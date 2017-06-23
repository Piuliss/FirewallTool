# == Schema Information
#
# Table name: firewalls
#
#  id                 :integer          not null, primary key
#  graphic_network_id :integer
#  name               :string(255)
#  source_code        :text
#  ip_eth0            :text
#  mask_ip_eth0       :text
#  ip_eth1            :text
#  mask_ip_eth1       :text
#  ip_eth2            :text
#  mask_ip_eth2       :text
#  syn_rules          :boolean          default(FALSE)
#  syn_limit          :integer
#  syn_unity          :text
#  syn_limit_burst    :integer
#  udp_rules          :boolean          default(FALSE)
#  udp_limit          :integer
#  udp_unity          :text
#  udp_hitcount       :integer
#  icmp_rules         :boolean          default(FALSE)
#  icmp_limit         :integer
#  icmp_unity         :text
#  icmp_limit_burst   :integer
#  created_at         :datetime
#  updated_at         :datetime
#  connections_limit  :integer
#  posY               :decimal(8, 4)
#  posX               :decimal(8, 4)
#
include NetworkOperations
include Simulator
class Firewall < ActiveRecord::Base
  extend Enumerize
  attr_accessor :parent_component, :is_dnat, :ran_firewall

  belongs_to :graphic_network
  has_many :rules
  has_many :policies

  @@time_unity = [:second, :minute, :hour, :day]
  enumerize :syn_unity, in: @@time_unity, predicates: true
  enumerize :udp_unity, in: @@time_unity, predicates: true
  enumerize :icmp_unity, in: @@time_unity, predicates: true

  def route_packet(package,network_routes,ignore_nodes_name,max_depth)

    #puts "######### START ROUTE PACKET AT FIREWALL #################"
    raise "MAX DEPTH EXCEPTION" if max_depth <= 0


    #Check if the package is for this machine
    # eth0 internet
    # eth1 internal network 1
    # eth2 internal network 2
    self.is_dnat = false
    self.ran_firewall = false

    package = package.aux_package if package.aux_package && !package.checked_by_firewall

    from_localhost = from_localhost?(package)
    #If the package is for the firewall, so the package is comming into the firewall from some interfaces eth1, eth2 or eth2
    if package.destination_ip == ip_eth0 || package.destination_ip == ip_eth1  || package.destination_ip == ip_eth2 || from_localhost
      set_outgoing_interface(package)
      set_incoming_interface(package)
      if from_localhost
        package.source_ip = package.outgoing_interface.ip
        package.source_mask = package.outgoing_interface.mask_ip
      end
      #set_incoming_interface(package)
      #in case that the package has subpacket is because the package is for other network
      if !package.unpacket.blank?
        unpacket = package.unpacket
        set_incoming_interface(unpacket)
        set_outgoing_interface(unpacket)
        unpacket = run_firewall(unpacket)  if !package.checked_by_firewall
        unpacket.aux_package = package
        return object_description(unpacket) if unpacket.state == :DROP || unpacket.state == :REJECT || has_ip?(unpacket.destination_ip)
        return send_packet(unpacket,network_routes,ignore_nodes_name,max_depth) if unpacket.same_subnetwork?
        return object_description(unpacket) if self.ran_firewall
        # forward a otra red #nat
        #return send_packet_other_network(unpacket,network_routes,ignore_nodes_name)
      elsif from_localhost
        package = run_firewall(package)  if !package.checked_by_firewall
        return object_description(package) if package.state == :DROP || package.state == :REJECT || has_ip?(package.destination_ip)
        return send_packet(package,network_routes,ignore_nodes_name,max_depth) if package.same_subnetwork?
      end
      # packet for this firewall
      package = run_firewall(package) if !package.checked_by_firewall
      return object_description(package)
    else
       # in this case the origen of the package is into the firewall
       # we forget implement OUTPUT here
       #package = run_firewall(package)
       return send_packet(package,network_routes,ignore_nodes_name,max_depth)
    end
  end

  def send_packet_other_network(package, network_routes, ignore_nodes_name,max_depth)


    #puts "START SEND PACKET AT OTHER NETWORK INTO FIREWALL"
    # Unpacket
    sub_package = package.unpacket

    sub_package_destination_ip = NetworkOperations.ip_with_mask(sub_package.destination_ip, sub_package.destination_mask)
    sub_package_source_ip = NetworkOperations.ip_with_mask(sub_package.source_ip, sub_package.source_mask)

    #If the package is for external ip, then create a packet with gateway ip as destination and
    # ip source of the firewall
    if !NetworkOperations.same_subnetworkd?(sub_package_destination_ip, sub_package_source_ip)

      #Check packet direction
      #eth0 default internet out
      ip_eth0_with_mask = NetworkOperations.ip_with_mask(ip_eth0, mask_ip_eth0)
      ip_eth1_with_mask = NetworkOperations.ip_with_mask(ip_eth1, mask_ip_eth1)
      ip_eth2_with_mask = NetworkOperations.ip_with_mask(ip_eth2, mask_ip_eth2)

      if NetworkOperations.same_subnetworkd?(sub_package_destination_ip, ip_eth0_with_mask)
        firewall_source_ip = ip_eth0
        firewall_source_mask = mask_ip_eth0
      elsif  NetworkOperations.same_subnetworkd?(sub_package_destination_ip, ip_eth1_with_mask)

        firewall_source_ip = ip_eth1
        firewall_source_mask = mask_ip_eth1
      elsif  NetworkOperations.same_subnetworkd?(sub_package_destination_ip, ip_eth2_with_mask)
        firewall_source_ip = ip_eth2
        firewall_source_mask = mask_ip_eth2
      else
        ip_mask = get_eth_ip_connected_to_router(network_routes, ignore_nodes_name, sub_package).split(",")
        firewall_source_ip = ip_mask[0]
        firewall_source_mask = ip_mask[1]
      end


      new_destination_ip = get_parent_ip(firewall_source_ip, firewall_source_mask, network_routes, sub_package)
      if new_destination_ip != "-1"
        firewall_package = Package.new(source_ip: firewall_source_ip, source_mask: firewall_source_mask,
                                       destination_ip: new_destination_ip, destination_mask: sub_package.destination_mask,
                                       protocol: sub_package.protocol)
        firewall_package.set_packet(package)
        ignore_nodes_name << object_description(package) if !ignore_nodes_name.include?(object_description(package))
        return send_packet(firewall_package, network_routes, ignore_nodes_name,max_depth)
      else
        ignore_nodes_name << object_description(package) if !ignore_nodes_name.include?(object_description(package))
        return send_packet(package.unpacket, network_routes, ignore_nodes_name,max_depth)
      end
    end

  end


  def send_packet(package, network_routes, ignore_nodes_name,max_depth)


    routes = network_routes.get_routes_by_node(object_description(package))
    ##select where the packet will be sent

    ignore_node_name_from_firewall  = ignore_nodes_name
   #if self.is_dnat == true && package.unpacket &&  package.destination_ip != package.unpacket.destination_ip
   #  ignore_node_name_from_firewall = []
   #end
   if self.is_dnat
     ignore_nodes_name =[]
     ignore_nodes_name << object_description(package)
     package.checked_by_firewall = true
      return object_description(package) + "|" + route_packet(package,network_routes,ignore_nodes_name,max_depth-1)
   end

    ## First try send package to terminal host
    routes.each do |route|
      node = node_description(route)
      component = Component.get_component(node_name(route), node_id(route))
      if !ignore_node_name_from_firewall.include?(node) && !component.kind_of?(Switch)
         ## Get ip and gateway ip from the component
        component_ip = Component.get_component_ip(component)
        if (component_ip == package.destination_ip)
          ignore_node_name_from_firewall << object_description(package) if !ignore_node_name_from_firewall.include?(object_description(package))
          component.parent_component = self
          return object_description(package) + "|" + component.route_packet(package, network_routes, ignore_node_name_from_firewall,max_depth)
        end
      end
    end

    # Try send package to switches
    routes.each do |route|
      node = node_description(route)
      component = Component.get_component(node_name(route), node_id(route))
      if (!ignore_node_name_from_firewall.include?(node) && component.kind_of?(Switch))
        ignore_node_name_from_firewall << object_description(package) if !ignore_node_name_from_firewall.include?(object_description(package))
        component.parent_component = self
        return object_description(package) + "|" + component.route_packet(package, network_routes, ignore_node_name_from_firewall,max_depth)
      end
    end

  end


  def object_description(package)
     rulesid = ""
     unless package.matched_rules.blank?
       package.matched_rules.each do |rule|
         rulesid = rulesid + rule.id.to_s + ";"
       end
     end
     rulesid ="empty" if rulesid.blank?
     policiesid = ""
     unless package.matched_policies.blank?
       package.matched_policies.each do |policy|
         policiesid = policiesid + policy.id.to_s + ";"
       end
     end
     policiesid = "empty" if policiesid.blank?
     return "Firewall_#{id}_#{package.unpacket.state}_#{rulesid}_#{policiesid}" if !package.unpacket.blank? && !package.unpacket.state.blank?
    "Firewall_#{id}_#{package.state}_#{rulesid}_#{policiesid}"
  end

  #Return route node name e.g "Laptop_1" where 1 is the id
  def node_description(route)
    node_name(route) + "_" + node_id(route)
  end

  def node_name(route)
    route.get_end_node.split("_")[0].to_s
  end

  def node_id(route)
    route.get_end_node.split("_")[1].to_s
  end

  def get_parent_ip(ip, mask, network_routes, package)

    routes = network_routes.get_routes_by_node(object_description(package))
    source = NetworkOperations.ip_with_mask(ip, mask)

    ##select where the packet will be sent
    routes.each do |route|
      node = node_description(route)

      component = Component.get_component(node_name(route), node_id(route))
      # if component.kind_of?(Router)
      dip = Component.get_component_ip(component)
      dm =Component.get_component_maskip(component)
      destination = NetworkOperations.ip_with_mask(dip, dm)

      if NetworkOperations.same_subnetworkd?(source, destination)
        return dip
      end

      #end
    end
    # No parent ip
    "-1"
  end

  def get_parent_maskip(ip, mask, network_routes, package)


    routes = network_routes.get_routes_by_node(object_description(package))
    source = NetworkOperations.ip_with_mask(ip, mask)

    ##select where the packet will be sent
    routes.each do |route|
      node = node_description(route)

      component = Component.get_component(node_name(route), node_id(route))
      # if component.kind_of?(Router)
      dip = Component.get_component_ip(component)
      dm =Component.get_component_maskip(component)
      destination = NetworkOperations.ip_with_mask(dip, dm)

      if NetworkOperations.same_subnetworkd?(source, destination)
        return dm
      end

      #end
    end
    # No parent ip
    "-1"
  end

  def get_firewall_ip_connected_to_this_network(ip, mask)
    ip_eth0_with_mask = NetworkOperations.ip_with_mask(ip_eth0, mask_ip_eth0)
    ip_eth1_with_mask = NetworkOperations.ip_with_mask(ip_eth1, mask_ip_eth1)
    source = NetworkOperations.ip_with_mask(ip, mask)
    if NetworkOperations.same_subnetworkd?(source, ip_eth0_with_mask)

      firewall_source_ip = ip_eth0

    elsif  NetworkOperations.same_subnetworkd?(source, ip_eth1_with_mask)

      firewall_source_ip = ip_eth1

    else

      firewall_source_ip = ip_eth2

    end
  end

  def get_firewall_mask_connected_to_this_network(ip, mask)
    ip_eth0_with_mask = NetworkOperations.ip_with_mask(ip_eth0, mask_ip_eth0)
    ip_eth1_with_mask = NetworkOperations.ip_with_mask(ip_eth1, mask_ip_eth1)
    source = NetworkOperations.ip_with_mask(ip, mask)
    if NetworkOperations.same_subnetworkd?(source, ip_eth0_with_mask)
      firewall_source_mask = mask_ip_eth0
    elsif  NetworkOperations.same_subnetworkd?(source, ip_eth1_with_mask)
      firewall_source_mask = mask_ip_eth1
    else
      firewall_source_mask = mask_ip_eth2
    end
  end

  def get_eth_ip_connected_to_router(network_routes, ignore_nodes_name, package)
    routes = network_routes.get_routes_by_node(object_description(package))

    ##select where the packet will be sent
    routes.each do |route|
      node = node_description(route)

      component = Component.get_component(node_name(route), node_id(route))
      if component.kind_of?(Router) && !ignore_nodes_name.include?(node)
        dip = Component.get_component_ip(component)
        dm =Component.get_component_maskip(component)

        eth = get_firewall_ip_connected_to_this_network(dip, dm)
        eth_mask = get_firewall_mask_connected_to_this_network(dip, dm)
        return eth.to_s + "," + eth_mask
      end
    end
  end

  def rules_for(table, chain)
    rules.select { |rule| rule.table.to_sym == table && rule.chain.to_sym == chain }
  end

  def policy_for(table, chain)
    policies.select { |policy| policy.table.to_sym == table && policy.chain.to_sym == chain }
  end

  def run_firewall(packet)
    self.ran_firewall = true
    package = packet
    syn_flood(package) if syn_rules?
    udp_flood(package) if udp_rules?
    icmp_flood(package) if icmp_rules?
    return package if package.state == :DROP || package.state == :REJECT

    if form_local_to_local?(package)
      groups = [{nat: [:OUTPUT]}, {filter: [:OUTPUT]}, {filter: [:INPUT]}]
    elsif from_local_to_external?(package)
      groups = [{nat: [:OUTPUT]}, {filter: [:OUTPUT]}, {nat: [:POSTROUTING]}]
    elsif from_external_to_local?(package)
      groups = [{nat: [:PREROUTING]}, {filter: [:INPUT,:FORWARD]}]
    else
      # fom external to external (forward)
      groups = [{nat: [:PREROUTING]}, {filter: [:FORWARD]}, {nat: [:POSTROUTING]}]
    end

    groups.each do |group|
      group.each do |table, chains|
        rule = nil
        chains.each do |chain|

          result = send(table, package, chain)
          package = result[:packet]
          rule = result[:matched_rule]
          policy = result[:matched_policy]

          return package if package.state == :DROP || package.state == :REJECT
          break if rule || policy
        end
      end
    end

    package
  end

  def mangle(packet, chain)
    packet
  end

  def nat(packet, chain)
    package = packet

    if Rules::CHAINS_BY_TABLE[:nat].include?(chain)
      matched_rule = get_matched_rule(:nat, chain, packet)
      matched_policy = nil
      if matched_rule
        job = matched_rule.job.to_sym
        if chain == :PREROUTING || chain == :OUTPUT
          #to_destination_ip
          self.is_dnat = true
          tmp = Package.new(destination_ip: matched_rule.nat_action_ip,
                            destination_mask: matched_rule.nat_action_mask)
          set_outgoing_interface(tmp)

          package = Package.new(source_ip: tmp.outgoing_interface.ip,
                                source_mask: tmp.outgoing_interface.mask_ip,
                                destination_ip: matched_rule.job.MASQUERADE? ? packet.incoming_interface.ip : matched_rule.nat_action_ip,
                                destination_mask: matched_rule.job.MASQUERADE? ? packet.incoming_interface.mask_ip : matched_rule.nat_action_mask,
                                protocol: packet.protocol,
                                source_port: packet.source_port,
                                destination_port: packet.destination_port,
                                package: packet,
                                state: nil)
          package.matched_policies = packet.matched_policies
          package.matched_rules = packet.matched_rules
          package.incoming_interface = packet.incoming_interface
          package.outgoing_interface = tmp.outgoing_interface
          ##set_incoming_interface(package)
          ##set_outgoing_interface(package)
          package.matched_rules << matched_rule
          package
        elsif chain == :POSTROUTING
          #to_source_ip
          package = Package.new(source_ip: matched_rule.job.MASQUERADE? ? packet.outgoing_interface.ip : matched_rule.nat_action_ip,
                                source_mask: matched_rule.job.MASQUERADE? ? packet.outgoing_interface.mask_ip : matched_rule.nat_action_mask,
                                destination_ip: packet.destination_ip,
                                destination_mask: packet.destination_mask,
                                protocol: packet.protocol,
                                source_port: packet.source_port,
                                destination_port: packet.destination_port,
                                package: packet,
                                state: nil)
          package.matched_policies = packet.matched_policies
          package.matched_rules = packet.matched_rules
          package.incoming_interface = packet.incoming_interface
          package.outgoing_interface = packet.outgoing_interface
          #set_incoming_interface(package)
          #set_outgoing_interface(package)
          package.matched_rules << matched_rule
          package
        else
          raise "Invalid chain for nat"
        end
      else
        #TODO: Policy
        matched_policy = get_matched_policy(:nat, chain, packet)
        if matched_policy
          package.matched_policies << matched_policy
          package.state = matched_policy.job.to_sym
        end
      end
    end
    {packet: package, matched_rule: matched_rule, matched_policy: matched_policy}
  end

  def filter(packet, chain)

    if Rules::CHAINS_BY_TABLE[:filter].include?(chain)
      matched_rule = get_matched_rule(:filter, chain, packet)
      matched_policy = nil
      if matched_rule

        packet.matched_rules  << matched_rule
        # TODO: target
        job = matched_rule.job.to_sym #:job, in: [:ACCEPT, :DROP, :REJECT, :DNAT, :SNAT, :MASQUERADE]
        if job == :ACCEPT || job == :DROP || job == :REJECT
          packet.state = job
        else
          raise "Invalid job for filter"
        end
      else
        #TODO: policy
        matched_policy = get_matched_policy(:filter, chain, packet)
        if matched_policy

          packet.matched_policies << matched_policy
          packet.state = matched_policy.job.to_sym
        end
      end
    end
    {packet: packet, matched_rule: matched_rule, matched_policy: matched_policy}
  end

  def to_seconds(protocol)
    protocol = protocol.to_s
    time = flood_time(protocol)
    Constants::TIMES_IN_SECOND[time]
  end

  def limit_for(protocol)
    protocol = protocol.to_s
    if protocol == "tcp" || protocol == "syn"
      syn_limit_burst
    elsif protocol == "udp"
      udp_hitcount
    elsif protocol == "icmp"
      icmp_limit_burst
    else
      nil
    end
  end

  def amount_to_free(protocol)
    protocol = protocol.to_s
    if protocol == "tcp" || protocol == "syn"
      syn_limit
    elsif protocol == "udp"
      udp_limit
    elsif protocol == "icmp"
      icmp_limit
    else
      nil
    end
  end

  def flood_time(protocol)
    protocol = protocol.to_s
    if protocol == "tcp" || protocol == "syn"
      syn_unity
    elsif protocol == "udp"
      udp_unity
    elsif protocol == "icmp"
      icmp_unity
    else
      nil
    end
  end

  def package_to_eth0?(package)
    ip_eth0_with_mask = NetworkOperations.ip_with_mask(ip_eth0, mask_ip_eth0)
    package_ip_with_mask = NetworkOperations.ip_with_mask(package.source_ip, package.source_mask)
    if NetworkOperations.same_subnetworkd?(ip_eth0_with_mask, package_ip_with_mask )
      true
    else
      false
    end
  end

  def package_to_eth1?(package)
    ip_eth1_with_mask = NetworkOperations.ip_with_mask(ip_eth1, mask_ip_eth1)
    package_ip_with_mask = NetworkOperations.ip_with_mask(package.source_ip, package.source_mask)
    if NetworkOperations.same_subnetworkd?(ip_eth1_with_mask, package_ip_with_mask )
      true
    else
      false
    end
  end

  def package_to_eth2?(package)
    ip_eth2_with_mask = NetworkOperations.ip_with_mask(ip_eth2, mask_ip_eth2)
    package_ip_with_mask = NetworkOperations.ip_with_mask(package.source_ip, package.source_mask)
    if NetworkOperations.same_subnetworkd?(ip_eth2_with_mask, package_ip_with_mask )
      true
    else
      false
    end
  end

  def type
    return 'Firewall'
  end



  private

  def get_matched_rule(table, chain, packet)
    matched_rule = nil
    rules_for(table, chain).each do |rule|
      if rule.match_package?(packet)
        matched_rule = rule
        break
      end
    end
    matched_rule
  end

  def get_matched_policy(table, chain, packet)
    matched_policy = nil
    policy_for(table, chain).first
  end

  def syn_flood(packet)
    # iptables -N syn_flood
    # iptables -A INPUT -p tcp --syn -j syn_flood
    # iptables -A syn_flood -m limit --limit 1/second --limit-burst 3 -j RETURN
    # iptables -A syn_flood -j DROP
    syn_unity
    syn_limit_burst
    packet.state = :DROP if packet.posible_syn_flood? && packet.sequence.to_i >= syn_limit_burst
  end

  def udp_flood(packet)
    # iptables -N udp_flood
    # iptables -A INPUT -p udp -j udp_flood
    # iptables -A udp_flood -m state –state NEW –m recent –update –seconds 1 –hitcount 10 -j RETURN
    # iptables -A udp_flood -j DROP
    udp_unity
    udp_hitcount
    packet.state = :DROP if packet.posible_udp_flood? && packet.sequence.to_i >= udp_hitcount
  end

  def icmp_flood(packet)
    # iptables -N icmp_flood
    # iptables -A INPUT -p icmp -j icmp_flood
    # iptables -A icmp_flood -m limit --limit 1/s --limit-burst 3 -j RETURN
    # iptables -A icmp_flood -j DROP
    icmp_unity
    icmp_limit_burst
    packet.state = :DROP if packet.posible_icmp_flood? && packet.sequence.to_i >= icmp_limit_burst
  end

  def set_incoming_interface(package)
    [:eth0, :eth1, :eth2].each do |interface|
      source = ip_with_mask(package.source_ip, package.source_mask)
      destination = ip_with_mask(send("ip_#{interface}"), send("mask_ip_#{interface}"))
      if same_subnetworkd?(source, destination)
        package.incoming_interface = Interface.new(name: "#{interface}", ip: send("ip_#{interface}"), mask_ip: send("mask_ip_#{interface}"))
        break
      end
    end
  end

  def set_outgoing_interface(package)
    [:eth0, :eth1, :eth2].each do |interface|
      source = ip_with_mask(package.destination_ip, package.destination_mask)
      destination = ip_with_mask(send("ip_#{interface}"), send("mask_ip_#{interface}"))
      if same_subnetworkd?(source, destination)
        package.outgoing_interface = Interface.new(name: "#{interface}", ip: send("ip_#{interface}"), mask_ip: send("mask_ip_#{interface}"))
        break
      end
    end
  end

  def has_ip?(ip)
    [:eth0, :eth1, :eth2].each do |interface|
      return true if ip == send("ip_#{interface}")
    end
    false
  end

  def is_input?(package)
    # if it is from localhost, it is not an input
    !from_localhost?(package) && is_for_firewall?(package)
  end

  def is_output?(package)
    # if it is from localhost, it is output
    from_localhost?(package)
  end

  def is_forward?(package)
    !is_for_firewall?(package) && !from_localhost?(package)
  end

  def from_localhost?(package)
    [:eth0, :eth1, :eth2].each do |interface|
      return true if package.source_ip == send("ip_#{interface}") && package.source_mask == send("mask_ip_#{interface}")
    end
    false
  end

  def is_for_firewall?(package)
    [:eth0, :eth1, :eth2].each do |interface|
      firewall_ip = send("ip_#{interface}")
      firewall_mask = send("mask_ip_#{interface}")
      return true if package.destination_ip == firewall_ip && package.destination_mask == firewall_mask
    end
    false
  end

  def from_local_to_external?(package)
    from_localhost?(package) && !is_for_firewall?(package)
  end

  def from_external_to_local?(package)
    !from_localhost?(package) && is_for_firewall?(package)
  end

  def form_local_to_local?(package)
    from_localhost?(package) && is_for_firewall?(package)
  end


end
