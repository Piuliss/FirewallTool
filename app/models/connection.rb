# == Schema Information
#
# Table name: connections
#
#  id                    :integer          not null, primary key
#  source_object_id      :integer
#  destination_object_id :integer
#  source_type           :string(20)
#  destination_type      :string(20)
#  is_wireless           :boolean
#  graphic_network_id    :integer
#  distance              :integer          default(1)
#

class Connection < ActiveRecord::Base
  extend Enumerize

  enumerize :source_type, in: Constants::NETWORK_COMPONENTS, predicates: true
  enumerize :destination_type, in: Constants::NETWORK_COMPONENTS, predicates: true
  belongs_to :graphic_network
  validates :source_type, :source_object_id, :destination_type, :destination_object_id, presence: true


  def source_object
    object = eval("#{source_type}.find_by_id(#{source_object_id})")
  end

  def destination_object
    object = eval("#{destination_type}.find_by_id(#{destination_object_id})")
  end


end
