# == Schema Information
#
# Table name: routers
#
#  id                 :integer          not null, primary key
#  host_name          :string(255)
#  ip1                :string(18)
#  mask_ip1           :string(18)
#  ip2                :string(18)
#  mask_ip2           :string(18)
#  is_wireless        :boolean
#  posY               :decimal(8, 4)
#  posX               :decimal(8, 4)
#  connections_limit  :integer
#  graphic_network_id :integer
#

class Internet < Router
  def object_description
    return "Internet" + "_" + id.to_s
  end
end
