include Parser
class RulesController < ApplicationController
  #skip_before_filter :verify_authenticity_token 
  respond_to :html, :js, :json

  def index
    @rule = Rule.new
  end

  def create
    render nothing: true
  end
  # Respond using save_rule.js.erb
  def add_rule
  		@message = nil
  		srule = params[:rule]
      @rule = Rule.new
      @is_policy = false
  		if check_rule(srule)
        #Check if is rule or policy
        @is_policy = true if srule.split(" ").include?("-P")
          unless @is_policy
            @rule.table = ptable(srule).to_s
            #puts "table:" + @rule.table.to_s
            @rule.chain = pchain(srule).to_s
            #puts "chain:" + @rule.chain.to_s
            @rule.input_device = pinput_device(srule).to_s
            #puts "input_device:" + @rule.input_device
            @rule.output_device = poutput_device(srule).to_s
            #puts "output_device:" + @rule.output_device
            @rule.protocol = pprotocol(srule).to_s
            #puts "protocol:" + @rule.protocol.to_s
            @rule.source_ip = psource_ip(srule).to_s
            #puts "source_ip:" + @rule.source_ip.to_s
            @rule.source_mask = psource_ip_mask(srule).to_s
            #puts "source mask ip " + @rule.source_mask
            @rule.source_port = psource_port(srule).to_s
            #puts "source_port:" + @rule.source_port.to_s
            @rule.destination_ip = pdestination_ip(srule).to_s
            #puts "destination_ip:" + @rule.destination_ip.to_s
            @rule.destination_mask = pdestination_ip_mask(srule).to_s
            #puts "destination_ip_mask:" + @rule.destination_mask.to_s
            @rule.destination_port = pdestination_port(srule).to_s
            #puts "destination_port" + @rule.destination_port.to_s
            @rule.job = pjump(srule).to_s
            #puts "job:" + @rule.job.to_s
            @rule.nat_action_ip = pnat_action_ip(srule).to_s
            #puts "nat_action_ip:" + @rule.nat_action_ip.to_s
            @rule.nat_action_mask = pnat_action_ip_mask(srule).to_s
            #puts "nat_action_ip mask:" + @rule.nat_action_mask.to_s
            @rule.connection_states = pstate(srule)
            #puts "connection_states:" +  @rule.connection_states.to_s
            @states = pstate(srule)
            #puts "states:" + @states.to_s
          else

            @rule.table = ptable(srule).to_s
            @rule.chain = ppchain(srule).to_s
            @rule.job = ppjump(srule).to_s
          end

	        @message = "success"
      	else
      		@message = "error"
      	end
    clear
    
  end

  def upload_file
    sfile = params[:upload][0]
    post = DataFile.save(params[:upload])
    rules = DataFile.read(params[:upload]['datafile'].original_filename)
    @rules_object = []
    @policies_object = []

    rules.each do |srule|
      rule = Rule.new
      @is_policy = false
      if check_rule(srule)
        @is_policy = true if srule.split(" ").include?("-P")
        unless @is_policy
          rule.table = ptable(srule).to_s   
          rule.chain = pchain(srule).to_s 
          rule.input_device = pinput_device(srule).to_s
          rule.output_device = poutput_device(srule).to_s
          rule.protocol = pprotocol(srule).to_s 
          rule.source_ip = psource_ip(srule).to_s
          rule.source_mask = psource_ip_mask(srule).to_s
          rule.source_port = psource_port(srule).to_s 
          rule.destination_ip = pdestination_ip(srule).to_s
          rule.destination_mask = pdestination_ip_mask(srule).to_s
          rule.destination_port = pdestination_port(srule).to_s 
          rule.job = pjump(srule).to_s 
          rule.nat_action_ip = pnat_action_ip(srule).to_s
          rule.nat_action_mask = pnat_action_ip_mask(srule).to_s
          rule.connection_states = pstate(srule)
          @rules_object.push(rule)
        else
          puts srule
          rule.table = ptable(srule).to_s
          rule.chain = ppchain(srule).to_s
          rule.job = ppjump(srule).to_s
          @policies_object.push(rule)
        end
      end
      clear
    end
  end
  # Method use to download script iptables
  def download_script_iptables
    firewall_id = params[:id]
    fecha =  Time.now.strftime("%b_%m_of_%Y_time_%H_%M").downcase
    file_name = "iptables_" + fecha + ".sh"

    firewall = Firewall.includes(:rules, :policies).find(params[:id])
    policies = firewall.policies
    rules = firewall.rules

    f = File.new("./public/data/" + file_name,"w+")
      f.puts("# Script generated by FirewallTools. ")
      f.puts("# Date: #{fecha}")
      f.puts("# Policies.")
      if !policies.blank?
          policies.each do |police|
            p = " iptables -t " + police.table.to_s + " -P " + police.chain.to_s + " " + police.job
            f.puts(p)
          end
      else
        f.puts("# There were not defined policies for the firewall")
      end

      f.puts("# DoS and DDoS Mitigation Attack")
      f.puts(Rule.syn_flood_prevention_rules(firewall.syn_limit, firewall.syn_unity, firewall.syn_limit_burst)) if firewall.syn_rules?
      f.puts(Rule.udp_flood_prevention_rules(firewall.udp_limit, firewall.udp_unity, firewall.udp_hitcount)) if firewall.udp_rules?
      f.puts(Rule.icmp_flood_prevention_rules(firewall.icmp_limit, firewall.icmp_unity, firewall.icmp_limit_burst)) if firewall.icmp_rules?

      f.puts("# Rules")
      if !rules.blank?
        f.puts(" echo 1 > /proc/sys/net/ipv4/ip_forward")
        rules.each do |rule|
          r = " iptables -t #{rule.table.to_s} -A #{rule.chain.to_s}"
          r = r + " -i "  + rule.input_device.to_s unless rule.input_device.blank?
          r = r + " -o " + rule.output_device.to_s unless rule.output_device.blank?
          r = r + " -s " + NetworkOperations.ip_with_mask(rule.source_ip.to_s,rule.source_mask.to_s).to_s  unless rule.source_ip.blank?
          r = r + " -d " + NetworkOperations.ip_with_mask(rule.destination_ip.to_s,rule.destination_mask.to_s).to_s unless rule.destination_ip.blank?
          r = r + " -p " + rule.protocol.to_s unless rule.protocol.blank?
          r = r + " --sport " + rule.source_port.to_s unless rule.source_port.blank?
          r = r + " --dport " + rule.destination_port.to_s unless rule.destination_port.blank?
          r = r + " -m state --state " + rule.connection_states.to_s unless rule.connection_states.blank?
          r = r + " -j " + rule.job.to_s
          r = r + " --to-destination " if rule.job.DNAT?
          r = r + " --to-source " if rule.job.SNAT?
          r = r + " " + rule.nat_action_ip.to_s unless rule.nat_action_ip.blank?
          f.puts(r.to_s)
        end
      else
        f.puts("# There were not added rules for the firewall")
      end

      f.puts("# End Script")
      f.flush
      f.close
    url =  "public/data/" + file_name
    send_file url, :type => "application/sh"

  end
end
