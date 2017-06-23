class CreateNetworkComponents < ActiveRecord::Migration

  def change
    precision = 8
    scale = 4
    create_table :computers do |t|
      t.string  :name
      t.string  :ip, limit: 18
      t.string  :mask_ip, limit: 18
      t.string  :gateway_ip, limit: 18
      t.integer :interface_amount
      t.string  :type, limit: 50
      t.decimal :posY, precision: precision, scale: scale
      t.decimal :posX, precision: precision, scale: scale
      t.integer :connections_limit, default: 0
      t.integer :graphic_network_id
    end
    add_foreign_key :computers, :graphic_networks
    add_index(:computers, :graphic_network_id)

    create_table :routers do |t|
      t.string  :host_name
      t.string  :ip1, limit: 18
      t.string  :mask_ip1, limit: 18
      t.string  :ip2, limit: 18
      t.string  :mask_ip2, limit: 18
      t.boolean :is_wireless
      t.decimal :posY, precision: precision, scale: scale
      t.decimal :posX, precision: precision, scale: scale
      t.integer :connections_limit
      t.integer :graphic_network_id
    end
    add_foreign_key :routers, :graphic_networks
    add_index(:routers, :graphic_network_id)

    create_table :switches do |t|
      t.string  :name
      t.integer :input_amount
      t.string  :ip, limit: 18
      t.string  :mask_ip, limit: 18
      t.decimal :posY, precision: precision, scale: scale
      t.decimal :posX, precision: precision, scale: scale
      t.integer :connections_limit
      t.integer :graphic_network_id
    end
    add_foreign_key :switches, :graphic_networks
    add_index(:switches, :graphic_network_id)

    create_table :connections do |t|
      t.integer :source_object_id, null: true
      t.integer :destination_object_id, null: true
      t.string  :source_type, limit: 20
      t.string  :destination_type, limit: 20
      t.boolean :is_wireless
      t.integer :graphic_network_id
      t.integer :distance, default: 1
    end
    add_foreign_key :connections, :graphic_networks
    add_index(:connections, :graphic_network_id)
    add_index(:connections, :source_object_id)
    add_index(:connections, :destination_object_id)
    add_index(:connections, :source_type)
    add_index(:connections, :destination_type)

  end
end
