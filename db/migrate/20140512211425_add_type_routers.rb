class AddTypeRouters < ActiveRecord::Migration
  def change
    add_column :routers, :type, :string, limit: 30, null: false, default: 'Router'
  end
end
