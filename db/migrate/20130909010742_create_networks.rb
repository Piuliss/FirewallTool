class CreateNetworks < ActiveRecord::Migration
  def change
    create_table :networks do |t|
      t.string :name
      t.string :ip
      t.string :mask_ip
      t.string :range_from
      t.string :range_to
      t.string :network_type
      t.integer :graphic_network_id
    end

    add_foreign_key :networks, :graphic_networks
    add_index(:networks, :graphic_network_id)
  end
end
