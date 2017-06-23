class AddIsPublicToGraphicNetworks < ActiveRecord::Migration
  def change
    add_column :graphic_networks, :is_public, :boolean, default: false
  end
end
