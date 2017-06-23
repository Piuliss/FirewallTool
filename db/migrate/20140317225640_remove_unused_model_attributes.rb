class RemoveUnusedModelAttributes < ActiveRecord::Migration
  def change
    remove_column :switches, :input_amount
    remove_column :switches, :ip
    remove_column :switches, :mask_ip
    remove_column :computers, :interface_amount
    remove_column :routers, :is_wireless
  end
end
