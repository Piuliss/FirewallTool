class Package < ActiveRecord::Base
  include NetworkOperations
  extend Enumerize

  after_create :create_index
  after_initialize :setup_instance_variables
  #attr_accessor :source_ip,:source_mask,:destination_ip,:destination_mask,:protocol, :state, :source_port, :destination_port,
  #              :syn, :ack, :rst, :fin, :connection_state, :group_of, :sequence, :incoming_interface, :outgoing_interface, :source_type,
  #              :destination_type, :source_id, :destination_id, :index,:package_type
  attr_accessor :matched_rules, :matched_policies, :package, :aux_package ,:is_for_firewall, :checked_by_firewall

  belongs_to :graphic_network
  enumerize :connection_state, in: ["NEW", "ESTABLISHED", "RELATED"], predicates: true
  enumerize :protocol, in: ['tcp', 'udp', 'icmp'], predicates: true

  validates :type, presence: true
  validates_inclusion_of :pre_configured_type, in: [true, false]
  validates :posY, :posX, :graphic_network_id, :source_id, :destination_id,
            :source_type, :destination_type, :source_ip,:source_mask, :destination_ip, :protocol, :destination_mask, :simulation_type, presence: true

  def destination_object
    Component.get_component(destination_type, destination_id )
  end

  def source_object
    Component.get_component(source_type, source_id )
  end


  def set_packet(package)
    @package = package
  end
  def unpacket
    @package
  end

  def same_subnetwork?
    same_subnetworkd?(ip_with_mask(source_ip, source_mask), ip_with_mask(destination_ip, destination_mask))
  end

  def posible_syn_flood?
    (protocol == :tcp || protocol == "tcp") && (syn || rst)
  end

  def posible_udp_flood?
    (protocol == :udp || protocol == "udp") && (connection_state == :NEW || connection_state == "NEW")
  end

  def posible_icmp_flood?
    protocol == :icmp || protocol == "icmp"
  end

  private
  def create_index
    self.index = self.class.name.downcase.to_s + '-' + self.id.to_s
    self.save
  end

  def setup_instance_variables
    @matched_rules = []
    @matched_policies = []
    @package = nil
  end

end