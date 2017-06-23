# == Schema Information
#
# Table name: computers
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  ip                 :string(18)
#  mask_ip            :string(18)
#  gateway_ip         :string(18)
#  interface_amount   :integer
#  type               :string(50)
#  posY               :decimal(8, 4)
#  posX               :decimal(8, 4)
#  connections_limit  :integer          default(0)
#  graphic_network_id :integer
#

include Component
include NetworkOperations
class Computer < ActiveRecord::Base
  attr_accessor :parent_component
  #extend Enumerize
  #enumerize :type, in: ['Laptop', 'Pc', 'Printer', 'Server'], predicates: true
  belongs_to :graphic_network
  validates :type, presence: true
  validates :posY, :posX, :graphic_network_id, presence: true

  def route_packet(package,network_routes, ignore_nodes_name,max_depth)
    #puts "------------- START ROUTE PACKET AT COMPUTER -------------"
    raise "MAX DEPTH EXCEPTION" if max_depth <= 0
    # Check if the package is for external network
    package_destination_ip = NetworkOperations.ip_with_mask(package.destination_ip,package.destination_mask)
    computer_ip = NetworkOperations.ip_with_mask(ip,mask_ip)

    # If the package is for external network, then create new package and send to gateway
    # If the computer has not configured a gateway, then return object_description()
    if !NetworkOperations.same_subnetworkd?(package_destination_ip,computer_ip)
        if !gateway_ip.blank?

           package_to_gateway = Package.new(source_ip: ip, source_mask: mask_ip, destination_ip: gateway_ip, destination_mask: mask_ip, protocol: package.protocol, state: package.state)
           package_to_gateway.set_packet(package)
           return object_description() + "|" + send_packet(package_to_gateway,network_routes,ignore_nodes_name,max_depth)
        end
        # If this machine has not set a gateway ip, the return just the object_description
        return object_description()
    end


  	if package.destination_ip == ip
  		return object_description()
  	else
      #Get routes of this component
      ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
      return object_description() + "|" + send_packet(package,network_routes,ignore_nodes_name,max_depth)
  	end
  end

  #This method implement all logic to send the package to the destination
  def send_packet(package,network_routes,ignore_nodes_name,max_depth)
      #puts "--------------START SEND PACKET AT COMPUTER----------------"
      routes = network_routes.get_routes_by_node(object_description())
      # Case when the machine is not the destination, then route the packet
      ##select where the packet will be sent ignoring "ignore_node_name"
      routes.each do |route|
          node = node_description(route)
          #This avoid no visit the last visited node.)
          if !ignore_nodes_name.include?(node) 
              component = Component.get_component(node_name(route),node_id(route))
              ## Get ip and gateway ip from the component

              if component.kind_of?(Firewall)
                  component_ip = component.get_firewall_ip_connected_to_this_network(ip,mask_ip)
              else
                  component_ip = Component.get_component_ip(component)
              end


              ## If the package is for the component or
              ## If the component is a Swith or Firewall
              if  component_ip == package.destination_ip || component.kind_of?(Switch) || component.kind_of?(Firewall)
                  ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
                  component.parent_component = self
                  return  component.route_packet(package,network_routes,ignore_nodes_name,max_depth)
              end
          end
      end
      return ""
  end

  #Return route node name e.g "Laptop_1" where 1 is the id
  def node_description(route)
    return node_name(route) + "_" + node_id(route)
  end

  def node_name(route)
    return route.get_end_node.split("_")[0].to_s
  end
  def node_id(route)
    return route.get_end_node.split("_")[1].to_s
  end
  def object_description
  	return type.to_s + "_" + id.to_s
  end

end
