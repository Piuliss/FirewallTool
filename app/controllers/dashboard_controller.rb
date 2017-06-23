
class DashboardController < ApplicationController
  include Parser

	respond_to :html, :js, :json
	def index



  end
  def show

  end

  def create

  end

  def demos_and_examples
    @graphic_networks = current_user.graphic_networks
    @demos_and_examples = GraphicNetwork.where(is_public: true)
    @graphic_network = GraphicNetwork.new
    @firewall = Firewall.new
  end

  def public_demos_and_examples
    @graphic_networks = current_user.graphic_networks
    allowed_ids = @graphic_networks.map{|gn| gn.id.to_s}
    params[:demos_and_examples].each do |data_array|
      gn_id = data_array[0]
      is_checked = data_array[1] == "1"
      if allowed_ids.include?(gn_id)
        gn = @graphic_networks.select{|gn| gn.id.to_s == gn_id}.first
        gn.is_public = is_checked
        gn.save!
      end
    end
    flash[:success] = "Diagrams published successfully"
    redirect_to root_path
  rescue => e
    flash[:error] = "An error occurs while we was trying to publis the diagrams"
    redirect_to demos_and_examples_dashboard_index_path
  end

  def new
    @rule = Rule.new
    @option = Option.new(attack_life: 1, attack_time: :second)
    @graphic_networks = current_user.graphic_networks
    @demos_and_examples = GraphicNetwork.where(is_public: true)
    @graphic_network = GraphicNetwork.new
    @rules = []
    @policies = []
    @firewall = Firewall.new
    flash[:error] =  flash[:success] = nil
  end

  def edit
    @rule = Rule.new
    load_graphic_network(params[:id])
    respond_to do |format|
      format.html{ render :new }
      format.js{ render :edit }
    end
  end

  def update
    components  = params[:components] || {}
    packages    = params[:packages] || {}
    connections = params[:connections] || {}
    rules       = params[:rules] || {}
    policies    = params[:policies] || {}
    option      = params[:option][:option]
    allowed_components = Constants::NETWORK_COMPONENTS
    graphic_parameters = ActionController::Parameters.new(option_attributes: option).permit(option_attributes: [:id, :attack_life, :attack_time])
    begin
      GraphicNetwork.transaction do
        gn = GraphicNetwork.includes(firewall: :rules).find_by_id(params[:graphic_network_id])
        # destroy policies and rules before destroy components
        gn.update_attributes!(graphic_parameters)
        firewall = gn.firewall
        if firewall
          firewall.rules.destroy_all
          firewall.policies.destroy_all
        end
        gn.destroy_all_network_components
        @graphic_network = build_graphic_network(gn, components, packages, connections, rules, policies)
        flash[:success] = "The diagram #{gn.name} was updated successfully"
        @rule = Rule.new
        load_graphic_network(gn.id)
        render :edit , format: :js
      end
    rescue => e
      logger.error e.message
      logger.error e.backtrace.join("\n")
      flash[:success] = nil
      flash[:error] ||= "Error, there was a problem trying to update the diagram, please verify the configuration and try again."
      render js: 'showFlashMessages("'+flash_message()+'");'
    end

  end

  def create_diagram
    components  = params[:components] || {}
    #components.select!{|component| !component.include?("package")}
    connections = params[:connections] || {}
    packages    = params[:packages] || {}
    rules       = params[:rules] || {}
    policies    = params[:policies] || {}
    option      = params[:option][:option]
    graphic_name = params[:graphic_name]
    exist = GraphicNetwork.where(name: graphic_name, user_id: current_user.id).first
    if exist.blank?
      graphic_parameters = ActionController::Parameters.new(name: graphic_name, status: :pending, user_id: current_user.id, option_attributes: option)
                                                       .permit(:name, :status, :user_id, option_attributes: [:attack_life, :attack_time])
      graphic_network = GraphicNetwork.new(graphic_parameters)
      @graphic_network = build_graphic_network( graphic_network, components, packages, connections, rules, policies)
      load_graphic_network(@graphic_network.id)
      flash.now[:success] = "The diagram #{@graphic_network.name} was saved successfully"
    else
      flash.now[:error] = "This new diagram can not be saved because there is a diagram with this name, please enter other name ''#{graphic_name}''"
    end
  rescue => e
    logger.error e.message
    logger.error e.backtrace.join("\n")
    flash.now[:error] ||= "It was a problem to save, the diagram, contact with the Site Admin"
  ensure
    render @graphic_network.nil? ? :error : :edit
  end

  # Parameters needed: params[:?]
  #  -graphic_network_id
  #  - packages (array)
  #  - attack_packages (array)
  def generate_path_simulation
    graphic_network = GraphicNetwork.includes(:option, :firewall, :packages, :computers).find(params[:graphic_network_id])
    firewall = graphic_network.firewall
    paths = []
    simulation_time = graphic_network.option.to_seconds
    # for simple packages
    graphic_network.normal_packages.to_a.each do |package|
      paths.push( { path: Path.generate_path_for_package(package, graphic_network.id), index: package.index })
    end

    # create all packages object
    unless  graphic_network.attack_packages.empty?
      #for attack packages
      attack_packages = []
      graphic_network.attack_packages.to_a.each do |package|
        package.amount.to_i.times.each do |index|
          package_temp = Package.new(package.attributes)
          package_temp.amount = 0
          attack_packages << package_temp
        end
      end

     #if there is a firewall, we need to prepare the attack packages in order to the firewall to reject it
      if firewall
        #separate by protocol
        packages_by_protocol = {"tcp" => [], "udp" => [], "icmp" => []}
        attack_packages.each do |package|
          packages_by_protocol[package.protocol] << package
        end

        # group the packages according the time of the simulation
        %w(tcp udp icmp).each do |protocol|
          slice_size = (packages_by_protocol[protocol].size/simulation_time.to_f).ceil
          packages_by_protocol[protocol] = packages_by_protocol[protocol].in_groups_of(slice_size, false) if slice_size > 0
        end

        #logic
        tcp_sequence = 0
        udp_sequence = 0
        icmp_sequence = 0
        simulation_time.times do |second|
          %w(tcp udp icmp).each do |protocol|
            sequence = eval("#{protocol}_sequence")
            time_to_clean = firewall.to_seconds(protocol)
            #simulation in seconds

            # free space when it is time
            firewall_limit = firewall.limit_for(protocol).to_i
            to_be_free = firewall.amount_to_free(protocol).to_i
            if second % time_to_clean == 0
              sequence -= to_be_free
              sequence  = 0 if sequence < 0
              eval("#{protocol}_sequence = sequence")
            end
            # get all packages by protocol and by time
            packages = packages_by_protocol[protocol][second]
            #iterate and create paths for all packages
            packages.each do |package|
              package.sequence = sequence
              eval("#{protocol}_sequence += 1") if sequence < firewall_limit
              paths.push( { path: Path.generate_path_for_package(package, graphic_network.id), index: package.index })
              sequence += 1
            end unless packages.blank?

          end
        end
      else
        # if there is not a firewall, then we just generate path like normal packages
        attack_packages.each do |attack_package|
          paths.push( { path: Path.generate_path_for_package(attack_package, graphic_network.id), index: attack_package.index })
        end
      end
    end
    respond_to do |format|
      format.json { render json: {paths: paths}}
    end
  rescue => e
    logger.error e.message
    logger.error e.backtrace.join("\n")
    render json: {error: 'Error trying to process the simulation, please verify your configuration and try again.'}, status: 500
  end

  def port_scan
    @firewall = Firewall.includes(:policies, :rules).find(params[:id])
    all_rules = @firewall.rules.select{|rule| (rule.chain.INPUT? || rule.chain.OUTPUT? || rule.chain.FORWARD?) && rule.job.ACCEPT? }
    from = params[:port][:from].to_i
    to = params[:port][:to].to_i
    from = 1 if from < 1 || from > 65535
    to = 65535 if to < 1 || to > 65535
    protocol = params[:port][:protocol]

    @rules_by_port = {}
    (from .. to).each do |port|
      @rules_by_port[port] = []
      all_rules.each do |rule|
        if rule.destination_port.blank?
          @rules_by_port[port] << rule
        else
          port_range = rule.destination_port.split(":")
          port_start = port_range[0].to_i
          port_end = port_range[1] ? port_range[1].to_i : port_start

          if (rule.protocol == protocol || rule.protocol == "all") && ((port_start .. port_end).include?(port))
            @rules_by_port[port] << rule
          end
        end
      end
    end
    @rules_by_port.select!{|_, rules| !rules.empty? }
  rescue => e
    logger.error(e.backtrace.join("\n"))
  end

  private
  #private - private - private - private - private - private - private - private - private - private - private - private

  def load_graphic_network(id)
    gn = GraphicNetwork.includes(:option, :computers, :routers, :switches, :connections, :firewall, :rules).find_by_id(id)
    #params
    @graphic_network    = gn
    @graphic_networks   = current_user.graphic_networks
    @demos_and_examples = GraphicNetwork.where(is_public: true)
    @network_components = gn.network_components
    @connections        = gn.connections
    @rules              = gn.rules
    @policies           = gn.policies
    @firewall           = gn.firewall || Firewall.new
    @option             = gn.option
  end


  def build_graphic_network(graphic_network, components, packages, connections, rules, policies)
    firewall = nil

    allowed_components = Constants::NETWORK_COMPONENTS - ['AttackPackage', 'NormalPackage', 'TcpSimple',  'TcpAttack', 'UdpSimple', 'UdpAttack', 'IcmpSimple', 'IcmpAttack']

    GraphicNetwork.transaction do
      graphic_network.save!
      components.each do |k,v|
        v[:graphic_network_id] = graphic_network.id
        type = v[:type]
        #skip iteration when model is a package for example
        next unless allowed_components.include?(type)
        v.delete(:id)
        v.delete(:type)
        v.select!{|_,v| !v.blank? }
        v.merge!(params[:firewall][:firewall]) if type == "Firewall"
        obj = eval("#{type}.new(#{v})")
        obj.save!
        firewall = obj if obj.instance_of?(Firewall)
        components[k]['real_id'] = obj.id
        components[k][:type] = type
      end

      packages.each do |index, v|
        source_index = v[:source_index]
        destination_index = v[:destination_index]
        type = v[:type]
        v[:graphic_network_id] = graphic_network.id
        v[:source_id] = components[source_index]['real_id']
        v[:destination_id] = components[destination_index]['real_id']
        v.delete(:source_index)
        v.delete(:destination_index)
        v.delete(:id)
        v.delete(:type)
        v.select!{|_,v| !v.blank? }
        package = eval("#{type}.new(#{v})")
        package.save!
      end

      connections.each do |k,v|
        objA = v['pointA_id']
        objB = v['pointB_id']
        connection = Connection.create!(
            source_object_id:       components[objA]['real_id'],
            destination_object_id:  components[objB]['real_id'],
            source_type:            components[objA]['type'],
            destination_type:       components[objB]['type'],
            graphic_network_id:     graphic_network.id)
      end
      if firewall
        rules.each do |order, attributes|
          attributes[:firewall_id] = firewall.id
          parameters = ActionController::Parameters.new(attributes).permit(:firewall_id, :table, :chain, :input_device, :output_device, :protocol,
                                                                           :source_ip, :destination_ip, :source_port, :destination_port, :job, :connection_states,
                                                                           :nat_action_ip, :description, :rule, :source_mask, :destination_mask, :nat_action_mask)
          rule = Rule.new(parameters)
          rule.connection_states = attributes[:connection_states]
          rule.save!
        end
        policies.each do |order, attributes|
          attributes["firewall_id"] = firewall.id
          parameters = ActionController::Parameters.new(attributes)
          Policy.create!(parameters.permit(:firewall_id, :table, :chain, :job))
        end
      end
    end
    return graphic_network
  end

  # [1,2,4,5,6,7,9,13].to_ranges       # => [1..2, 4..7, 9..9, 13..13]
  # [1,2,4,5,6,7,9,13].to_ranges(true) # => [1..2, 4..7, 9, 13]
  def ranges(array, non_ranges_ok=false)
    array.sort.each_with_index.chunk { |x, i| x - i }.map { |diff, pairs|
      if (non_ranges_ok)
        pairs.first[0] == pairs.last[0] ? pairs.first[0] : pairs.first[0] .. pairs.last[0]
      else
        pairs.first[0] .. pairs.last[0]
      end
    }
  end
end
