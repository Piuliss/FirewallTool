
# Set the working application directory
# working_directory "/path/to/your/app"
working_directory "/root/app/production/trabajo-final/FirewallTools"
# Unicorn PID file location
# pid "/path/to/pids/unicorn.pid"
pid "/root/app/production/trabajo-final/FirewallTools/tmp/pids/unicorn.pid"
# Path to logs
# stderr_path "/path/to/log/unicorn.log"
# stdout_path "/path/to/log/unicorn.log"
stderr_path "/root/app/production/trabajo-final/FirewallTools/log/unicorn.log"
stdout_path "/root/app/production/trabajo-final/FirewallTools/log/unicorn.log"

# Unicorn socket
listen "/tmp/unicorn.[firewalltools].sock"
listen "/tmp/unicorn.firewalltools.sock"

# Number of processes
# worker_processes 4
worker_processes 1

# Time-out
timeout 300

preload_app true
# Garbage collection settings.
GC.respond_to?(:copy_on_write_friendly=) &&
    GC.copy_on_write_friendly = true

# If using ActiveRecord, disconnect (from the database) before forking.
before_fork do |server, worker|
  defined?(ActiveRecord::Base) &&
      ActiveRecord::Base.connection.disconnect!
end

# After forking, restore your ActiveRecord connection.
after_fork do |server, worker|
  defined?(ActiveRecord::Base) &&
      ActiveRecord::Base.establish_connection
end
