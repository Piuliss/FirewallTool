# == Schema Information
#
# Table name: graphic_networks
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  status     :string(255)
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#

#Trabajo Final de Grado - FirewallTool
#Universidad Nacional de Itapua 
#Facultad de Ingenieria.
#User: Raul Benitez Netto
#Date: 8/09/13

class GraphicNetwork < ActiveRecord::Base
  extend Enumerize
  has_many :networks
  has_many :routers
  has_many :switches
  has_many :computers
  has_many :connections
  has_many :firewalls
  has_one :firewall, class_name: "Firewall", limit: 1
  has_many :rules, through: :firewall
  has_many :policies, through: :firewall
  has_many :packages
  has_one :option

  enumerize :status, in: [:pending], predicates: true
  accepts_nested_attributes_for :option

  validates :name, presence: true

  def all_components
    components = routers + switches + computers + connections
  end

  def network_components
    components = routers + switches + computers + firewalls
  end

  def destroy_all_network_components
    computers.destroy_all
    routers.destroy_all
    switches.destroy_all
    connections.destroy_all
    packages.destroy_all
    firewall.destroy if firewall
  end
  def normal_packages
    self.packages.where(type: Constants::NORMAL_PACKAGES)
  end

  def attack_packages
    self.packages.where(type: Constants::ATTACK_PACKAGES)
  end
end
