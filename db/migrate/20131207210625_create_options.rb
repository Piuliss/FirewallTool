class CreateOptions < ActiveRecord::Migration
  def change
    create_table :options do |t|
      t.integer :graphic_network_id, null: false
      t.integer :attack_life, default: 1, null: false
      t.string :attack_time, default: :second, null: false
      t.timestamps
    end
    add_index :options, :graphic_network_id
    add_foreign_key :options, :graphic_networks
  end
end
