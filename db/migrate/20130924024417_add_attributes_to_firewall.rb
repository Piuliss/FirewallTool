class AddAttributesToFirewall < ActiveRecord::Migration
  def change
    add_column :firewalls, :connections_limit, :integer, default: 3
    add_column :firewalls, :posY, :decimal, precision: 8, scale: 4
    add_column :firewalls, :posX, :decimal, precision: 8, scale: 4
  end
end
