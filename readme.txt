get some Distro based in debian,(Ubuntu, Mint, etc)
install postgres engine and its developer tools pg-dev and so on, define a user=postgres with password=postgres
install rvm and ruby 2.2.1
go to  the directory FirewallTool in the console (terminal)
comment the line 36 (add #) of the Gemfile file, maybe is already commented or the gem changed
rvm --create use 2.2.1@firewalltool --rvmrc
rvm use 2.2.1@firewalltool
gem install bundler
bundler install 
rake db:create	
rake db:migrate
rake db:seed
rails s
go to the link http://localhost:3000/ in an CHROME browser 
user= raulbeni@gmail.com
password= password
