module NetworkOperations
  def same_subnetworkd?(ip1_with_mask, ip2_with_mask)
    total_bits = 32
    bits_per_number = 8
    ip1_splited = ip1_with_mask.split("/")
    ip2_splited = ip2_with_mask.split("/")
    mask1 = ip1_splited[1].to_i
    mask2 = ip2_splited[1].to_i
    binary_ip1 = ip_to_binary(ip1_splited[0])
    binary_ip2 = ip_to_binary(ip2_splited[0])
    mask1_ip = number_mask_to_ip(mask1)
    mask2_ip = number_mask_to_ip(mask2)
    binary_ip1 = binary_ip_and_operation(binary_ip1, mask1_ip)
    binary_ip2 = binary_ip_and_operation(binary_ip2, mask2_ip)
    compare_binary_ip(binary_ip1, binary_ip2)
  end


  def ip_to_binary(ip)
    ip.split(".").collect{|number| number.to_i.to_s(2)}.collect do |binary|
      to_complete = Constants::IP_BITS_PER_NUMBER - binary.length
      to_complete.times{|_| binary.prepend("0")}
      binary
    end
  end

  def number_mask_to_ip(number_mask)
    mask_ip = ""
    1.upto(Constants::IP_TOTAL_BITS) do |order|
      mask_ip += (number_mask >= order) ? "1" : "0"
      mask_ip += "." if(order % Constants::IP_BITS_PER_NUMBER == 0)
    end
    mask_ip.split(".")
  end

  def get_mask_from_ip_address(ip_address)
    mask_number = ip_address.split("/")[1]
    ip = []
    number_mask_to_ip(mask_number.to_i).each do |binary|
      ip << binary.to_i(base=2)
    end
    ip.join(".")
  end

  def get_ip_from_ip_address(ip_address)
    ip_address.split("/")[0]
  end

  def binary_ip_and_operation(binary_ip_1, binary_ip_2)
    binary_result = []
    binary_ip_1.each_with_index  do |string1, index|
      bits2 = binary_ip_2[index].split("")
      binary_string = ""
      string1.split("").each_with_index do |bit1, index|
        bit2 = bits2[index]
        binary_string += (bit1 == bit2 && bit1 == "1") ? "1" : "0"
      end
      binary_result[index] = binary_string
    end
    binary_result
  end

  def compare_binary_ip(binary_ip_1, binary_ip_2)
    binary_ip_1.each_with_index  do |string1, index|
      string2 = binary_ip_2[index]
      return false if string1 != string2
    end
    true
  end

  def bits(mask)
    # Count number of bits used (1). This is only really useful for the network mask
    bits = 0
    octets = mask.to_s.split('.')
    octets.each { |n|
      bits += Math.log10(n.to_i + 1) / Math.log10(2) unless n.to_i == 0
    }
    bits.to_i
  end

  def ip_with_mask(ip,mask)
    if(mask.to_s.length > 0)
    ip + "/" + bits(mask).to_s
    else
    ip
    end
  end

  def network_address?(ip, mask)
    binary_ip = ip_to_binary(ip).join
    mask_number = bits(mask)
    bits = binary_ip[(mask_number - Constants::IP_TOTAL_BITS) .. -1]
    # all bits should be zero to be a network address
    bits.length.times do |time|
      return false if bits[time] == "1"
    end
    true
  end
end