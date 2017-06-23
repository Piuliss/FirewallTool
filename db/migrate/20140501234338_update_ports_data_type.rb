class UpdatePortsDataType < ActiveRecord::Migration
  def change
    change_column :rules, :source_port, :string, limit: 11
    change_column :rules, :destination_port, :string, limit: 11
  end
end
