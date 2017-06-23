# == Schema Information
#
# Table name: policies
#
#  id          :integer          not null, primary key
#  firewall_id :integer
#  table       :string(10)
#  chain       :string(20)
#  job         :string(20)
#  description :string(255)
#  rule        :string(255)
#  created_at  :datetime
#  updated_at  :datetime
#

class Policy < ActiveRecord::Base
  extend Enumerize

  belongs_to :firewall

  enumerize :table, in: [:filter, :nat], predicates: true
  enumerize :chain, in: [:INPUT, :OUTPUT, :FORWARD, :PREROUTING, :POSTROUTING], predicates: true
  enumerize :job, in: [:ACCEPT, :DROP]

  validate :table, :chain, :job, :firewall_id, presence: true
end
