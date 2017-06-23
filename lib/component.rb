module Component

	#Return objet from database using name and id
	def get_component(type,id)
		component = nil
		if type == "Pc" || type == "Laptop" || type == "Server" || type == "Printer"
			component = Computer.find_by_id(id)
		elsif type == "Switch"
			component = Switch.find_by_id(id)
		elsif type == "Router"
			component = Router.find_by_id(id)
		elsif type == "Firewall"
			component = Firewall.find_by_id(id)
    elsif type == "Internet"
      component = Internet.find_by_id(id)
    elsif type == "Network"
			component = Network.find_by_id(id)
    else
      raise "ERROR TO GET COMPONENT, TYPE UNDEFINED CORRECTLY"
		end	
		component
	end

	def get_component_ip(component)
		if component.kind_of? Computer
           return component.ip
        end
        if component.kind_of? Router
            return component.ip2 # local
        end
        if component.kind_of? Firewall
            return " "
        end
        if component.kind_of? Switch
            return " " 
        end
        return " "
	end
    def get_component_maskip(component)
        if component.kind_of? Computer
           return component.mask_ip
        end
        if component.kind_of? Router
            return component.mask_ip2   #local
        end
        if component.kind_of? Firewall
            return " "
        end
        if component.kind_of? Switch
            return " " 
        end
        return " "
    end

	def get_component_gateway(component)
		if component.kind_of? Computer
            return component.gateway_ip
        end
        if component.kind_of? Router
            return component.ip1  # internet
        end
        if component.kind_of? Firewall
            return " "
        end
        if component.kind_of? Switch
            return " " 
        end
        return " "
  end

end