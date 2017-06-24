FirewallTool
====================
FirewallTool is a web application developed with the framework Ruby on Rails. It allows to design with a graphic interface a network with wires, servers, computer, phones, firewall, etc. The firewall can be configured using iptable rules. The iptable rules can be imported, or implemented using a GUI. Once, the network is implemented and the firewall rules defined you can start to simulate packet traffic or network attacks to test the rules defined in the firewall . 

FirewallTool has a guaranteed compatibility in the browser Chrome

Installation
---------------------
* get some Distro based in debian,(Ubuntu, Mint, etc)
* install postgres engine and its developer tools pg-dev and so on, define a user=postgres with password=postgres or change this information in the file config/database.yml
* install [RVM](https://rvm.io/rvm/install) with ruby 2.2.1
* in th console, go the directory FirewallTool
* comment the line 36 (add #) of the Gemfile file, maybe is already commented or the gem changed
* `rvm --create use 2.2.1@firewalltool --rvmrc`
* `rvm use 2.2.1@firewalltool`
* `gem install bundler`
* `bundler install`
* `rake db:create`
* `rake db:migrate`
* `rake db:seed`
* `rails s`
* go to the link http://localhost:3000/ in the CHROME browser user= tripodevs@gmail.com, password= password
