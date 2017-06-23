# == Schema Information
#
# Table name: options
#
#  id                 :integer          not null, primary key
#  graphic_network_id :integer          not null
#  attack_life        :integer          default(1), not null
#  attack_time        :string(255)      default("second"), not null
#  created_at         :datetime
#  updated_at         :datetime
#

class Option < ActiveRecord::Base
  extend Enumerize

  belongs_to :graphic_network

  @@time_unity = [:second, :minute, :hour, :day]

  enumerize :attack_time, in: @@time_unity, predicates: true

  def to_seconds
    Constants::TIMES_IN_SECOND[attack_time] * attack_life
  end
end
