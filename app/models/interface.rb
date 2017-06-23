class Interface

  attr_accessor :name,:ip,:mask_ip
  def initialize(parameters)
    parameters = parameters.with_indifferent_access
    @name = parameters[:name]
    @ip   = parameters[:ip]
    @mask_ip = parameters[:mask_ip]
  end

  def self.build_interfaces(amount)
    interfaces = [Interface.new(name: "lo")]
    amount.times do |time|
      interfaces << Interface.new(name: "eth#{time}")
    end
    interfaces
  end
end
