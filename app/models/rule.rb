# == Schema Information
#
# Table name: rules
#
#  id                :integer          not null, primary key
#  firewall_id       :integer
#  table             :string(10)
#  chain             :string(20)
#  input_device      :string(5)
#  output_device     :string(5)
#  protocol          :string(10)
#  connection_states :integer
#  source_ip         :string(15)
#  destination_ip    :string(15)
#  source_mask       :string(15)
#  destination_mask  :string(15)
#  source_port       :integer
#  destination_port  :integer
#  job               :string(20)
#  nat_action_ip     :string(15)
#  nat_action_mask   :string(15)
#  description       :string(255)
#  rule              :string(255)
#  created_at        :datetime
#  updated_at        :datetime
#

class Rule < ActiveRecord::Base
  extend Enumerize

  belongs_to :firewall

  enumerize :table, in: [:filter, :nat], predicates: true
  enumerize :chain, in: [:INPUT, :OUTPUT, :FORWARD, :PREROUTING, :POSTROUTING], predicates: true
  enumerize :protocol, in: [:all, :tcp, :udp, :icmp], predicates: true
  enumerize :job, in: [:ACCEPT, :DROP, :REJECT, :DNAT, :SNAT, :MASQUERADE]
  bitmask :connection_states, :as => [:NEW, :ESTABLISHED, :RELATED]

  # El localhost se deja (por ejemplo conexiones locales a mysql)
	#iptables -A INPUT -i lo -j ACCEPT

	# A nuestra IP le dejamos todo
	#iptables -A INPUT -s 195.65.34.234 -j ACCEPT

	# A un colega le dejamos entrar al mysql para que mantenga la BBDD
	#iptables -A INPUT -s 231.45.134.23 -p tcp --dport 3306 -j ACCEPT

	# A un diseñador le dejamos usar el FTP
	#iptables -A INPUT -s 80.37.45.194 -p tcp -dport 20:21 -j ACCEPT

	# El puerto 80 de www debe estar abierto, es un servidor web.
	#iptables -A INPUT -p tcp --dport 80 -j ACCEPT

	# Y el resto, lo cerramos
	#iptables -A INPUT -p tcp --dport 20:21 -j DROP
	#iptables -A INPUT -p tcp --dport 3306 -j DROP
	#iptables -A INPUT -p tcp --dport 22 -j DROP
	#iptables -A INPUT -p tcp --dport 10000 -j DROP

  def match_package?(package)
    match_protocol(package) && match_source_port(package) && match_destination_port(package) && match_incoming_interface(package) && match_outgoing_interface(package) &&
        match_destination_mask(package) && match_source_mask(package) && match_source_ip(package) && match_destination_ip(package)
  end

  def match_protocol(package)
  	protocol.blank? ? true : (protocol.all? || package.protocol == protocol)
  end

  def match_source_ip(package)
    if source_ip.blank?
      true
    else
      package.source_ip == source_ip ||
          ((network_address?(source_ip, source_mask) || network_address?(package.source_ip, package.source_mask)) && same_subnetworkd?(ip_with_mask(package.source_ip, package.source_mask), ip_with_mask(source_ip, source_mask)))
    end
  end

  def match_source_mask(package)
    source_mask.blank? ? true : package.source_mask == source_mask
  end

  def match_destination_ip(package)
    if destination_ip.blank?
      true
    else
      package.destination_ip == destination_ip ||
          ((network_address?(destination_ip, destination_mask) || network_address?(package.destination_ip, package.destination_mask)) && same_subnetworkd?(ip_with_mask(package.destination_ip, package.destination_mask), ip_with_mask(destination_ip, destination_mask)))
    end
  end

  def match_destination_mask(package)
    destination_mask.blank? ? true : package.destination_mask == destination_mask
  end

  def match_incoming_interface(package)
    need_check = (table=="filter" && (chain=="INPUT" || chain=="FORWARD")) || (table=="nat" && (chain=="PREROUTING"))
    (!need_check || input_device.blank?) ? true : (output_device == "lo" && package.incoming_interface.blank?) || (!package.incoming_interface.blank? && input_device == package.incoming_interface.name)
  end

  def match_outgoing_interface(package)
    need_check = (table=="filter" && (chain=="OUTPUT" || chain=="FORWARD")) || (table=="nat" && (chain=="POSTROUTING" || chain=="OUTPUT"))
    (!need_check || output_device.blank?) ? true : (output_device == "lo" && package.incoming_interface.blank?) || (output_device == package.outgoing_interface.name)
  end

  def match_source_port(package)
    source_port.blank? ? true : port_range_match(package.destination_port, destination_port)
  end

  def match_destination_port(package)
    destination_port.blank? ? true : port_range_match(package.destination_port, destination_port)
  end

  def self.syn_flood_prevention_rules(limit, time_unit, burst)
    "iptables -N syn_flood \n" +
    "iptables -A INPUT -p tcp --syn -j syn_flood \n" +
    "iptables -A syn_flood -m limit --limit #{limit}/#{time_unit} --limit-burst #{burst} -j RETURN \n" +
    "iptables -A syn_flood -j DROP"
  end

  def self.udp_flood_prevention_rules(limit, time_unit, hitcount)
    "iptables -N udp_flood \n"+
    "iptables -A INPUT -p udp -j udp_flood \n"+
    "iptables -A udp_flood -m state -state NEW -m recent -update -#{time_unit} #{limit} -hitcount #{hitcount} -j RETURN \n" +
    "iptables -A udp_flood -j DROP"
  end

  def self.icmp_flood_prevention_rules(limit, time_unit, burst)
    "iptables -N icmp_flood \n"+
    "iptables -A INPUT -p icmp -j icmp_flood \n"+
    "iptables -A icmp_flood -m limit --limit #{limit}/#{time_unit} --limit-burst #{burst} -j RETURN \n" +
    "iptables -A icmp_flood -j DROP"
  end

  def rule_to_string
    result = []
    [{"-i" => :input_device}, {"-o" => :output_device}, {"-s" => :source_ip}, {"-d" => :destination_ip}, {"-p" => :protocol}].each do |label_and_values|
      key = label_and_values.keys.first
      value = send(label_and_values[key])
      value = "any" if value.blank?
      result << "#{key} #{value}"
    end

    if !connection_states.empty?
      result << "--state #{connection_states.join(",")}"
    end

    result.join("  ")
  end

  private

  def port_range_match(port, single_or_range_port)
    port = port.to_i
    ports = single_or_range_port.split(":")
    if ports.size == 1
      start_port = single_or_range_port.to_i
      end_port = start_port
    else
      start_port = ports[0].to_i
      end_port = ports[1].to_i
    end
    (start_port .. end_port).include?(port)
  end

end
