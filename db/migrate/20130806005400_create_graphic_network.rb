class CreateGraphicNetwork < ActiveRecord::Migration
  def change
    create_table :graphic_networks do |t|
      t.string :name
      t.string :status
      t.integer :user_id
      t.timestamps
    end

    add_foreign_key :graphic_networks, :users
  end
end
