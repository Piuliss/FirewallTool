class CreateFirewallsPoliciesAndRules < ActiveRecord::Migration
  def change
    create_table :firewalls do |t|
      t.integer :graphic_network_id
      t.string :name
      t.text :source_code
      t.text :ip_eth0
      t.text :mask_ip_eth0
      t.text :ip_eth1
      t.text :mask_ip_eth1
      t.text :ip_eth2
      t.text :mask_ip_eth2
      t.boolean :syn_rules, default: false
      t.integer :syn_limit
      t.text :syn_unity
      t.integer :syn_limit_burst
      t.boolean :udp_rules, default: false
      t.integer :udp_limit
      t.text :udp_unity
      t.integer :udp_hitcount
      t.boolean :icmp_rules, default: false
      t.integer :icmp_limit
      t.text :icmp_unity
      t.integer :icmp_limit_burst
      t.timestamps
    end

    add_index(:firewalls, :graphic_network_id)
    add_foreign_key(:firewalls, :graphic_networks)

    create_table :rules do |t|
      t.integer :firewall_id
      t.string :table, limit: 10
      t.string :chain, limit: 20
      t.string :input_device, limit: 5
      t.string :output_device, limit: 5
      t.string :protocol, limit: 10
      t.integer :connection_states
      t.string :source_ip, limit: 15
      t.string :destination_ip, limit: 15
      t.string :source_mask, limit: 15
      t.string :destination_mask, limit: 15
      t.integer :source_port
      t.integer :destination_port
      t.string :job, limit: 20
      t.string :nat_action_ip, limit: 15
      t.string :nat_action_mask, limit: 15
      t.string :description
      t.string :rule, limit: 255
      t.timestamps
    end

    add_foreign_key :rules, :firewalls
    add_index(:rules, :firewall_id)

    create_table :policies do |t|
      t.integer :firewall_id
      t.string :table, limit: 10
      t.string :chain, limit: 20
      t.string :job, limit: 20
      t.string :description
      t.string :rule, limit: 255
      t.timestamps
    end

    add_foreign_key :policies, :firewalls
    add_index(:policies, :firewall_id)
  end
end