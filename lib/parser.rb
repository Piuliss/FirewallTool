module Parser
	# Antes de usar este metodo, ejecutar los siguientes comandos en la consola de linux
	# para dar permisos de super usuario
	# chmod 4755 parser.rb
	# sudo chown root parser.rb


	# Este metodo retorna true o false si tuvo exito
	def check_rule(rule)
	    # Check if is a valid policy
	    if rule.split(" ").include?("-P")
	      if rule.split(" ").include?("nat")
	        policy_options = /(\s+\biptables\s+-t\s+\bnat\s+-P\s+[\bPREROUTING|\bOUTPUT|\bPOSTROURING]\s+[\bACCEPT|\bDROP])/.match(rule)

	      else
	        policy_options = /(\s+\biptables\s+-P\s+[\bINPUT|\bOUTPUT|\bFORWARD]\s+[\bACCEPT|\bDROP])/.match(rule)

	      end
	      return policy_options.blank?
	    end
	    # If is not a policy then is a rule, verify rule calling system

		command = "sudo " + rule
		value = system(command)
	end	

	# Este metodo debe de llamarse despues de check_rule
	# para limpiar la regla agregada al servidor
	def clear
		command = "sudo iptables -F"
		system(command)
	end

	# Parse the rule to get the table name
	def ptable(rule)
		table_options = /(\s+-t\s+\bfilter\s+|\s+-t\s+\bnat\s+)/.match(rule)
		table_name = "default"
	    if !table_options.nil?
				table_name = /\s+-t\s+(.*)\s+/.match(table_options.to_s)[1].to_s
	    end
	    if table_name == "default"
	      table_name = "filter"
	    end
	    return table_name.to_s
	end

	# Parse the rule to get chain name
	def pchain(rule)
		chain_options = /(\s+-A\s+\bINPUT\s+|\s+-A\s+\bOUTPUT\s+|\s+-A\s+\bFORWARD\s+|\s+-A\s+\bPREROUTING\s+|\s+-A\s+\bPOSTROUTING\s+)/.match(rule)
		if !chain_options.nil?
			chain_name = /\s+-A\s+(.*)\s+/.match(chain_options.to_s)[1].to_s
      return chain_name
    end
    raise "Invalid chain name"
	end

  # Parse chain name when policy
  def ppchain(rule)
    chain_options = /(\s+-P\s+\bINPUT\s+|\s+-P\s+\bOUTPUT\s+|\s+-P\s+\bFORWARD\s+|\s+-P\s+\bPREROUTING\s+|\s+-P\s+\bPOSTROUTING\s+)/.match(rule)
    if !chain_options.nil?
      chain_name = /\s+-P\s+(.*)\s+/.match(chain_options.to_s)[1].to_s
      return chain_name
    end
    raise "Invalid chain name when policy"
  end

	# Parse the rule to get input device name
	def pinput_device(rule)
		input_device_options = /(\s+-i\s+([a-z|\d]+)\s+-)/.match(rule)
		if !input_device_options.nil?
			input_device_name = input_device_options[2].to_s
		end
	end

	# Parse the rule to get output device name
	def poutput_device(rule)
		output_device_options = /(\s+-o\s+([a-z|\d]+)\s+-)/.match(rule)
		if !output_device_options.nil?
			output_device_name = output_device_options[2].to_s
		end
	end

	# Parse the rule to get protocol name
	def pprotocol(rule)
		protocol_options = /(\s+-p \ball\s+|\s+-p \btcp\s+|\s+-p \budp\s+|\s+-p \bicmp\s+)/.match(rule)
		if !protocol_options.nil?
			protocol_name = /\s+-p\s+([a-z]+)\s+/.match(rule)[1].to_s
		end
	end

	# Parse the rule to get the source ip
	def psource_ip(rule)
		source_options = /\s+-s\s+(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/[0-9]{1,2})?\b)/.match(rule)
		if !source_options.nil?
			source_ip = source_options[1].split("/")[0].to_s
		end
	end

  # Parse the rule to get the source ip mask
  def psource_ip_mask(rule)
    source_options = /\s+-s\s+(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/[0-9]{1,2})?\b)/.match(rule)
    if !source_options.nil?
      source_ip = source_options[1].to_s
      return NetworkOperations.get_mask_from_ip_address(source_ip).to_s
    end
  end

	# Parse the rule to get source port number
	def psource_port(rule)
		sport = /\s+--sport\s+(\d+:?\d+)\s+/.match(rule)
		if !sport.nil?
			sport_number = sport[1].to_s
		end
	end

	# Parse the rule to get the destination ip
	def pdestination_ip(rule)
		destination_options = /\s+-d\s+(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/[0-9]{1,2})?\b)/.match(rule)
    if !destination_options.nil?
			destination_ip = destination_options[1].split("/")[0].to_s
		end
	end

  # Parse the rule to get the destination ip
  def pdestination_ip_mask(rule)
    destination_options = /\s+-d\s+(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/[0-9]{1,2})?\b)/.match(rule)
    if !destination_options.nil?
      destination_ip = destination_options[1].to_s
      return NetworkOperations.get_mask_from_ip_address(destination_ip).to_s
    end
  end

	# Parse the rule to get the destination port
	def pdestination_port(rule)
		dport = /\s+--dport\s+(\d+:?\d+)\s+/.match(rule)
		if !dport.nil?
			dport_number = dport[1].to_s
		end
	end

	# Parse the rule to get state name
	def pstate(rule)
		states_options = /\s+-m\s+state\s+--state\s+([A-Z|,]+)/.match(rule)
		if !states_options.nil?
			states = states_options[1].to_s.split(",")
		else
			states = []
		end
	end

	# Parse the rule to get the jump 
	# [:ACCEPT, :DROP, :REJECT, :DNAT, :SNAT, :MASQUERADE]
	def pjump(rule)
		jump_options = /\s+-j\s+(\bACCEPT)\s*|\s+-j\s+(\bDROP)\s*|\s+-j\s+(\bREJECT)\s*|\s+-j\s+(\bDNAT)\s*|\s+-j\s+(\bSNAT)\s*|\s+-j\s+(\bMASQUERADE)\s*/.match(rule)
		if !jump_options.nil?
			jump = /\s*-j\s+(.*)\s*/.match(jump_options.to_s)[1]
    else
      raise "Invalid -j value"
    end

	end
  # Parse the rule to get the jump when policy
  def ppjump(rule)
    if rule.include?("ACCEPT")
      return "ACCEPT"
    elsif rule.include?("DROP")
      return "DROP"
    else
      raise "Invalid jump name when policy"
    end

  end

	# Parse the tule to get the nat action ip
	def pnat_action_ip(rule)
		nat_ip = /\s+-DNAT|-SNAT\s+--to\s+(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/[0-9]{1,2})?\b)/.match(rule)
		if !nat_ip.nil?
			ip = nat_ip[1].split("/")[0].to_s
		end
  end

  def pnat_action_ip_mask(rule)
    nat_ip = /\s+-DNAT|-SNAT\s+--to\s+(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/[0-9]{1,2})?\b)/.match(rule)
    if !nat_ip.nil?
      ip = nat_ip[1].to_s
      return NetworkOperations.get_mask_from_ip_address(ip).to_s
    end
  end
end