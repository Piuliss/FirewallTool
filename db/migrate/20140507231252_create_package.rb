class CreatePackage < ActiveRecord::Migration
  def change
    precision = 8
    scale = 4
    create_table :packages do |t|
      t.string :source_ip, limit: 18, null: false
      t.string :source_mask, limit: 18, null: false
      t.string :destination_ip, limit: 18, null: false
      t.string :destination_mask, limit: 18, null: false
      t.string :source_type, limit: 30, null: false
      t.string :destination_type, limit: 30, null: false
      t.string :source_port, limit: 15, default: ''
      t.string :destination_port , limit: 15, default: ''
      t.integer :source_id, null: false
      t.integer :destination_id, null: false
      t.string :protocol, limit: 15, null: false, default: 'tcp'
      t.string :state, limit: 15, default: ''
      t.boolean :syn, default: false
      t.boolean :ack, default: false
      t.boolean :rst, default: false
      t.boolean :fin, default: false
      t.string :connection_state, limit: 30, default: ''
      t.string :group_of, default: ''
      t.string :sequence, default: ''
      t.string :incoming_interface, default: ''
      t.string :outgoing_interface, default: ''
      t.string :index, limit: 30, default: ''
      t.string :type, limit: 30, null: false
      t.decimal :posX, precision: precision, scale: scale, null: false
      t.decimal :posY, precision: precision, scale: scale, null: false
      t.integer :graphic_network_id, null: false
      t.integer :amount, default: 0
      t.string :simulation_type, limit: 30, null:false
      t.string :matched_rules, default: ''
      t.string :matched_policies, default: ''
    end

    add_foreign_key :packages, :graphic_networks
    add_index(:packages, :graphic_network_id)
  end
end
