# == Schema Information
#
# Table name: routers
#
#  id                 :integer          not null, primary key
#  host_name          :string(255)
#  ip1                :string(18)
#  mask_ip1           :string(18)
#  ip2                :string(18)
#  mask_ip2           :string(18)
#  is_wireless        :boolean
#  posY               :decimal(8, 4)
#  posX               :decimal(8, 4)
#  connections_limit  :integer
#  graphic_network_id :integer
#

class Router < ActiveRecord::Base
  attr_accessor :parent_component
  validates :type, presence: true
  def route_packet(package,network_routes, ignore_nodes_name,max_depth)
    #puts "------------- START ROUTE PACKET AT ROUTER -------------"
    raise "MAX DEPTH EXCEPTION" if max_depth <= 0
    if package.destination_ip == ip1 || package.destination_ip == ip2
      if !package.unpacket().blank?

          sub_package = get_initial_package(package)
          if sub_package.destination_ip == ip1 || sub_package.destination_ip == ip2
               return object_description()
          end

          return object_description() + "|" + send_packet_other_network(package,network_routes,ignore_nodes_name,max_depth)
      end

      return object_description()
    else

      #Get routes of this component
      ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
      return object_description() + "|" + send_packet_other_network(package,network_routes,ignore_nodes_name,max_depth)
    end
  end

  def send_packet_other_network(package,network_routes,ignore_nodes_name,max_depth)
    #puts "########## START SEND OTHER NETWORK ROUTER ################### "
    # Unpacket
    sub_package = get_initial_package(package)

    sub_package_destination_ip = NetworkOperations.ip_with_mask(sub_package.destination_ip,sub_package.destination_mask)
    sub_package_source_ip = NetworkOperations.ip_with_mask(sub_package.source_ip,sub_package.source_mask)

    #If the package is for external ip, then create a packet with gateway ip as destination and
    # ip source of the firewall
    if !NetworkOperations.same_subnetworkd?(sub_package_destination_ip,sub_package_source_ip)

      #Check packet direction
      #ip1 ip2
      ip1_with_mask = NetworkOperations.ip_with_mask(ip1,mask_ip1)
      ip1_with_mask = "0.0.0.0/0" if ip1_with_mask.blank?
      ip2_with_mask = NetworkOperations.ip_with_mask(ip2,mask_ip2).to_s
      ip2_with_mask = "0.0.0.0/0" if ip2_with_mask.blank?

      if NetworkOperations.same_subnetworkd?(sub_package_destination_ip,ip1_with_mask)

        router_source_ip = ip1
        router_source_mask = mask_ip1

      else
        router_source_ip = ip2
        router_source_mask = mask_ip2
      end

      new_destination_ip = get_parent_ip(router_source_ip,router_source_mask,network_routes)

      router_package = Package.new(source_ip: router_source_ip, source_mask: router_source_mask,
                                   destination_ip: new_destination_ip, destination_mask: router_source_mask,
                                   protocol: sub_package.protocol)
      router_package.set_packet(package)

      ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
      return send_packet(router_package,network_routes,ignore_nodes_name,max_depth)

    else
      ignore_nodes_name << object_description() if !ignore_nodes_name.include?(object_description())
      return send_packet(package,network_routes,ignore_nodes_name,max_depth)
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
      #This avoid no visit the last visited node.
      if !ignore_nodes_name.include?(node)
        component = Component.get_component(node_name(route),node_id(route))
        ## Get ip and gateway ip from the component
        component_ip = Component.get_component_ip(component)


        ## If the package is for the component or
        ## If the component is a Swith  or Firewall
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
    return "Router" + "_" + id.to_s
  end

  def get_parent_ip(ip,mask,network_routes)
    routes = network_routes.get_routes_by_node(object_description())
    source = NetworkOperations.ip_with_mask(ip,mask)
    ##select where the packet will be sent
    routes.each do |route|
      node = node_description(route)
      component = Component.get_component(node_name(route),node_id(route))
      if component.kind_of?(Router)

        dip = component.ip1.blank? ? "0.0.0.0" : component.ip1
        dm = component.mask_ip1.blank? ? "0.0.0.0" : component.mask_ip1
        destination = NetworkOperations.ip_with_mask(dip,dm)
        if NetworkOperations.same_subnetworkd?(source,destination)
          return dip
        else
          return component.ip2
        end

      elsif component.kind_of?(Firewall)
        dip =  component.get_firewall_ip_connected_to_this_network(ip,mask)
        dm =  mask
        destination = NetworkOperations.ip_with_mask(dip,dm)
        return dip
      else
        dip = Component.get_component_ip(component)
        return dip
      end

    end
    # No parent ip
    #return " "
  end

  def final_package_for_this?(package)
    sub_package = package.unpacket()
    while !sub_package.unpacket.nil?
      sub_package = sub_package.unpacket()
    end

    if sub_package.destination_ip == ip2 || sub_package.destination_ip == ip1
      return true
    end
    return false

  end

  def get_initial_package(package)
    sub_package = package.unpacket()
    return package if sub_package.blank?
    while !sub_package.unpacket.blank?
      sub_package = sub_package.unpacket()
    end

    return sub_package

  end

end
