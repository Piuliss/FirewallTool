
include Component
module Simulator
	class Label
	 	def initialize(accumulated, provenance)
			@accumulated = accumulated
			@provenance = provenance
		end
	  	def get_accumulated
	    		return @accumulated
	  	end
	  	def get_provenance
	    		return @provenance
	  	end
	end

	class Node
	  	def initialize(id, name, accumulated, provenance, marked)
			@id = id
			@name = name
			@labels = []
			lab = Label.new(accumulated, provenance)
			@labels << lab
			@marked = marked
		end
		def set_id(id)
			@id = id
		end
		def set_name(name)
			@name = name
		end
	  	def get_name
			return @name
		end
		def get_id
			return @id
		end
		def set_label(accumulated, provenance)
			@labels = []
			lab = Label.new(accumulated, provenance)
			@labels << lab
		end
		def get_accumulated
			return @labels[0].get_accumulated
		end
		def get_provenance
			return @labels[0].get_provenance
		end
	 	def get_labels
	    		return @labels
	  	end
		def set_marked(mark)
			@marked = mark
		end
		def get_marked
			return @marked
		end
		def clear
	    		@labels.clear
	    		@labels << Label.new(0,0)
	        	@marked = false
		end
	end


	class Route
	  	def initialize(begin_node, end_node, distance)
			@begin_node = begin_node
			@end_node = end_node
			@distance = distance
		end
		def set_begin_node(node)
			@begin_node = node
		end
		def set_end_node(node)
			@end_node = node
		end
		def set_distance(distance)
			@distance = distance
		end
		def get_begin_node
			return @begin_node
		end
		def get_end_node
			return @end_node
		end
		def get_distance
			return @distance
		end
	end


	class NetworkGraphic
		def initialize(graphic_network_id)
			rows = [0]
			# get the sources and destinations id from connections table
			sources = Connection.where(graphic_network_id: graphic_network_id).select(:source_object_id,:source_type).distinct.order(:source_object_id)
			sources.each do |s| 
				rows << s.source_type.to_s + "_" + s.source_object_id.to_s
			end
			
			destinations = Connection.where(graphic_network_id: graphic_network_id).select(:destination_object_id,:destination_type).distinct.order(:destination_object_id)
			destinations.each do |d|
				node_name = d.destination_type.to_s + "_" + d.destination_object_id.to_s
				if (!rows.include?(node_name))
				   rows << node_name
				end
			end

			#rows.each do |r|
			#	puts r
			#end

			connections = Connection.where(graphic_network_id: graphic_network_id)
			load_list(rows,rows,connections)
							
		end

		def generate_matrix(firstColItems,firstRowItems,connections)
			#debugger
			#table = Connection.connection.execute(@sql)
			$matriz = []
			
			
			for i in 0...firstColItems.length
				$matriz << Array.new
			end

			#set firstColValues and firstRowValues
			row = 0
			for col in 0...firstColItems.length 
				$matriz[row][col] = firstColItems[col]
			end
			col = 0
			for row in 0...firstRowItems.length 
				$matriz[row][col] = firstRowItems[row]
			end
			#----------------------------------------

			#Fill matriz with the connections values

			connections.each do |con|
				source_node_name = con["source_type"].to_s + "_" + con["source_object_id"].to_s
				destination_node_name = con["destination_type"].to_s + "_" + con["destination_object_id"].to_s
				setConnection(source_node_name,destination_node_name,con["distance"])
				setConnection(destination_node_name,source_node_name,con["distance"])
			end

			#Fill empty connection values
			fillNilTableValues

			#print matriz content
			#$matriz.each do |row|
			#	puts row.to_s
			#end

			#if File.exists?(file)
			#	f = File.open(file)
			#	i = 0
			#	f.each do |linea|
			#		0.upto(l) do |j|
			#			$matriz[i] << linea.split(",")[j]
			#		end
			#		i += 1
			#	end
			#	f.close
			#end
		end

		# This method add the distance value where there is a connection
		def setConnection(rowItem,colItem,distance)
			colIndex = 0
			rowIndex = 0
			
			for row in 1...$matriz.length 
			 	if ($matriz[row][colIndex].to_s == rowItem.to_s)
				 	for col in 1...$matriz.length 
				 		if($matriz[rowIndex][col].to_s == colItem.to_s)
				 			$matriz[row][col] = distance.to_i
				 		end
				 	end
			 	end
			 end

		end

		def fillNilTableValues
			for row in 1...$matriz.length 
				for col in 1...$matriz.length 
					if($matriz[row][col] == nil)
						$matriz[row][col] = 0
					end
				end
			end
		end

		def load_list(firstColItems,firstRowItems,connections)
			generate_matrix(firstColItems,firstRowItems,connections)
			l = $matriz.length
			@nodes = []
			for i in 1...l
				node = Node.new(i-1,$matriz[0][i],0,0,false)
				@nodes << node
			end
			load_routes()
			return @nodes
		end
		def load_routes
			l = $matriz.length
			row = 0
			col = 0
			@routes = []
			for i in 1...l
				for j in 1...l
					if $matriz[i][j].to_i != 0 then
						begin_node_name = $matriz[i][col].to_s
						end_node_name = $matriz[row][j].to_s
						route=Route.new(begin_node_name,end_node_name,$matriz[i][j].to_i)
						@routes << route
	                end
	             end
	         end
	         return @routes
	    end
	    
	    def get_routes_by_node(node_name)
        #detect if node_name is firewall and remove event
        if node_name.split("_")[0] == "Firewall"
          #set the name like "Firewall_ID" not "Firewall_ID_EVENT"
          node_name = node_name.split("_")[0..1].join("_")
        end
	    	routes_by_name = []
	    	@routes.each do |route|
	    		if route.get_begin_node == node_name
	    			routes_by_name << route
	    		end
	    	end
	    	return routes_by_name
	    end


	    def node_search(name)
	        @nodes.each do |node|
	            return node if name == node.get_name
	        end
	    end
	    def begin_path(node)
	        @begin = node_search(node)
	    end
	    def end_path(node)
	        @end = node_search(node)
	    end
	    
	    def lower_label
                  minor = 0
                  cond = false
                  m = -1
                  @nodes.each do |node|
                         if node.get_accumulated > 0 and !node.get_marked then
							if cond == false then
								minor = node.get_accumulated
								cond = true
								m = node.get_id
							end
                            if node.get_accumulated < minor and !node.get_marked then
								minor = node.get_accumulated
								m = node.get_id
							end
						end
					end
			if m != -1 then
				return @nodes[m]
			else
				return nil
			end
		end
	def generate_labels(nodebase)
		if nodebase then
			@nodes[nodebase.get_id].set_marked(true)
			@routes.each do |route|
				begin_node = route.get_begin_node
				end_node = route.get_end_node
				distance = route.get_distance
				if begin_node == nodebase.get_id and !@nodes[end_node].get_marked then
					if @nodes[end_node].get_accumulated == 0 or ((distance+nodebase.get_accumulated) < @nodes[end_node].get_accumulated) then
						@nodes[end_node].set_label(distance+nodebase.get_accumulated,nodebase.get_id)
					end
				end
			end
			generate_labels(lower_label())
		end
	end
	def short_path
	    clear
	    generate_labels(@begin)
	    routes = nodes_short_path(@end.get_id, @begin.get_id)
	    routes = routes.flatten
	    routes = routes.reverse
	    return routes
	end
	def nodes_short_path(node, nodebase)
		short_path_nodes = []
		@nodes[node].get_labels.each do |lab|
			if nodebase == lab.get_provenance then
				short_path_nodes << @nodes[node]
			else
				short_path_nodes << @nodes[node] << nodes_short_path(lab.get_provenance, nodebase)
			end
		end
		return short_path_nodes
	end
	def clear
	    @nodes.each do |node|
			node.clear
	    end
	end
end

	class Path

		def self.generate_path_for_package(package, graphic_network_id)
			# create a graph  of the graphic network 
			d = NetworkGraphic.new(graphic_network_id.to_i)
			# Find component where ip = package.source_ip
			component = package.source_object()
      component ||= Router.where("graphic_network_id = ? and (ip1 = ? or ip2 = ?) and type = 'Router'", graphic_network_id,package.source_ip,package.source_ip).first
      component ||= Internet.where("graphic_network_id = ? and (ip1 = ? or ip2 = ?)", graphic_network_id,package.source_ip,package.source_ip).first
			component ||= Firewall.where("graphic_network_id = ? and (ip_eth0 = ? or ip_eth1 = ? or ip_eth1 = ? )",graphic_network_id.to_i, package.source_ip, package.source_ip, package.source_ip).first

			
			raise "Source ip not found" if component.blank?

			ignore_nodes_name = []
      ignore_nodes_name << ( component.kind_of?(Firewall) ? component.object_description(package) : component.object_description)
			max_depth = 100
      package.matched_policies = []
      package.matched_rules = []
      path = component.route_packet(package,d,ignore_nodes_name,max_depth)
      path = self.remove_duplicated(path)
			path = self.format_path(path)
			return path
		end

    #"Laptop_764|Switch_358|Firewall_198_ACCEPT_401;_921;924;|Firewall_198_ACCEPT_401;401;_921;924;921;924;|Switch_360|Server_768"
    def self.remove_duplicated(path)
        aux_path = []
        final_path = []
        firewall_added = false
        components_ids = path.split('|')
        components_ids.each do |description|
          component = description.split('_')[0]
          if !firewall_added && component == "Firewall"
            final_path << description
            firewall_added = true
          end
          final_path << description if component != "Firewall"

        end
        final_path
    end
		# This method generates a path from the parameters sent from UI
		
		def self.generate_path(parameters)
      		parameters = parameters.with_indifferent_access
			# get information from parameters hash
			graphic_network_id = parameters["graphic_network_id"]
      package_type = parameters["package_type"]
			source_id = parameters["source_id"]
			source_type = parameters["source_type"]
			destination_id = parameters["destination_id"]
			destination_type = parameters["destination_type"]
			simulation_type = parameters["simulation_type"]

			# create a graph  of the graphic network 
			d = NetworkGraphic.new(graphic_network_id.to_i)


			#get ip and mask
			source_component = Component.get_component(source_type,source_id)

	      	if source_component.kind_of?(Firewall)
		        source_ip = source_component.ip_eth0
		        source_mask = source_component.mask_ip_eth0
	      	elsif source_component.kind_of?(Router)
		        source_ip = source_component.ip2
		        source_mask = source_component.mask_ip2
	      	else
		        source_ip = Component.get_component_ip(source_component)
		        source_mask = Component.get_component_maskip(source_component)
	      	end



			destination_component = Component.get_component(destination_type,destination_id)
	      	#if firewall select one of the three ips
	      	if destination_component.kind_of?(Firewall)
	        	destination_ip = destination_component.get_firewall_ip_connected_to_this_network(source_ip,source_mask)
	        	destination_mask =destination_component.get_firewall_mask_connected_to_this_network(source_ip,source_mask)
	      	elsif destination_component.kind_of?(Router)
	        	destination_ip = destination_component.ip2
	        	destination_mask =destination_component.mask_ip2
	      	else
	        	destination_ip = Component.get_component_ip(destination_component)
	        	destination_mask = Component.get_component_maskip(destination_component)
	      	end



			##Packet to send
			package = Package.new({source_ip: source_ip, source_mask: source_mask, destination_ip: destination_ip, destination_mask: destination_mask,
                             protocol: package_type, state: parameters[:state], source_port: parameters[:source_port], destination_port: parameters[:destination_port],
                             syn: parameters[:syn], ack: parameters[:ack], fin: parameters[:fin], connection_state: parameters[:connection_state], group_of: parameters[:group_of],
                              sequence: parameters[:sequence]})
			component = Component.get_component(source_type,source_id)
			ignore_nodes_name = []
			ignore_nodes_name << source_type.to_s + "_" + source_id.to_s
      max_depth = 100
			path = component.route_packet(package,d,ignore_nodes_name, max_depth)
			path = self.format_path(path)
			return path
		end

		# Apply format to the path to return to UI using as Simulation points
		# {'package_id' => [{type, id}]}
		# {'1' => [{'Computer', 1}, {'Laptop',1}, ...etc]}
		def self.format_path(path)
			#packages = Hash.new

			package_points = []
			
			path.each do |terminal|

				#point = Hash.new
        #puts "FormatPath: #{terminal}"
				component_name = terminal.split("_")[0].to_s
				component_id = terminal.split("_")[1].to_s
        event = terminal.split("_")[0] == "Firewall" ? terminal.split("_")[2] : "none"
				#point["#{component_name}"] = component_id
		    #point['component_type'] = component_name
		    #point['id']             = component_id
        rulesid = terminal.split("_")[0] == "Firewall"? terminal.split("_")[3] : "empty"
        policiesid = terminal.split("_")[0] == "Firewall"? terminal.split("_")[4] : "empty"
        point = {component_type: component_name, id: component_id, event: event, rulesid: rulesid, policiesid: policiesid }
        #puts "POINT #{component_name} #{component_id} #{event}"
        if package_points.last == point
              package_points.pop
        end
				package_points << point

			end
			#package_id = 0
			#packages["#{package_id}"] = package_points

			last_point = package_points.last
			if last_point[:event].to_s == "REJECT"
				return package_points.concat(package_points.reverse)
			else
				return package_points
			end
			
		end	

		

		def getNodeIP(node)
			id = node.get_name.split('_')[1].to_s
			type = node.get_name.split('_')[0].to_s
			ip = ""
			if type.downcase == "pc" || type.downcase == "laptop"
				ip = Computer.where(id: id).first.ip
			end
			return ip
		end
	end



	class Simulation
		def start
			parameters = { "graphic_id" => "14", "packet_type" => "tcp", "syn" => true,
			 "source_type" => "Laptop", "source_id" => "61", "destination_type" => "Laptop",
			 "destination_id" =>"62", "type_simulation"=>"simple_simulation", "sequence" => 1 }
      Path.generate_path(parameters)
		end
	end
end