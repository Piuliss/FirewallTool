class AddPreConfiguredTypeToPackage < ActiveRecord::Migration
  def change
    add_column :packages, :pre_configured_type, :boolean, null: false, default: false
  end
end
