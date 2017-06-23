# == Schema Information
#
# Table name: switches
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  input_amount       :integer
#  ip                 :string(18)
#  mask_ip            :string(18)
#  posY               :decimal(8, 4)
#  posX               :decimal(8, 4)
#  connections_limit  :integer
#  graphic_network_id :integer
#

# == Schema Information
#
# Table name: switches
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  input_amount       :integer
#  ip                 :string(18)
#  mask_ip            :string(18)
#  posY               :decimal(8, 4)
#  posX               :decimal(8, 4)
#  connections_limit  :integer
#  graphic_network_id :integer
#
include Component
class Switch < ActiveRecord::Base
  attr_accessor :parent_component
	def route_packet(package,network_routes,ignore_nodes_name, max_depth)

		#puts "------------- START ROUTE PACKET AT SWITCH  -------------" + object_description()
    raise "MAX DEPTH EXCEPTION" if max_depth <= 0
    max_depth = max_depth - 1
  		result = send_packet_to_host(package,network_routes,ignore_nodes_name,max_depth)
		if result == " "
			 result = send_packet_to_switch(package,network_routes,ignore_nodes_name,max_depth)
    	end

	    # If this switch is not connected to the destination
	    if result == " "

        component = self.parent_component
	      ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
	      return component.route_packet(package,network_routes,ignore_nodes_name,max_depth)
	    end
			result
	end

  # This method send packet to host connected to the switch
	def send_packet_to_host(package,network_routes,ignore_nodes_name,max_depth)
		#puts "--------------START SEND PACKET TO HOST-----------------"
		routes = network_routes.get_routes_by_node(object_description())
		#iterare over terminal hosts
		routes.each do |route|
			node = node_description(route)
			#check to not route to ignore_component
			if !ignore_nodes_name.include?(node)
				component = Component.get_component(node_name(route),node_id(route))
				
				## Get ip and gateway ip from the component
				component_ip = Component.get_component_ip(component)

	        	#Check if component is a firewall to get the ip
	        	if component.kind_of?(Firewall)
	          	component_ip = component.get_firewall_ip_connected_to_this_network(package.source_ip,package.source_mask)
	        	end
				if component_ip == package.destination_ip || ( component.kind_of?(Firewall) && !package.unpacket().blank?)
					ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
          component.parent_component = self
					return object_description() + "|" + component.route_packet(package,network_routes,ignore_nodes_name,max_depth)
				end
			end
		end
	  " " 
  	end



	def send_packet_to_switch(package,network_routes,ignore_nodes_name,max_depth)
		#puts "--------------START SEND PACKET TO SWITCH------------------"
		routes = network_routes.get_routes_by_node(object_description())
		routes.each do |route|
			node = node_description(route)
			#check to no route to the ignore_node
			if !ignore_nodes_name.include?(node)

				component = Component.get_component(node_name(route),node_id(route))
        		if component.kind_of?(Switch)
					      ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
                component.parent_component = self
          			return object_description() + "|" + component.route_packet(package,network_routes,ignore_nodes_name,max_depth)
				    end
			end
		end
		" "
	end

	def object_description
		"Switch_" + id.to_s
	end
	#Return route node name example "Laptop_1" where 1 is the id
  	def node_description(route)
    	node_name(route) + "_" + node_id(route)
  	end

  	def node_name(route)
    	route.get_end_node.split("_")[0].to_s
  	end
  	def node_id(route)
    	route.get_end_node.split("_")[1].to_s
  	end
end
