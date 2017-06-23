# == Schema Information
#
# Table name: networks
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  ip                 :string(255)
#  mask_ip            :string(255)
#  range_from         :string(255)
#  range_to           :string(255)
#  network_type       :string(255)
#  graphic_network_id :integer
#

# Trabajo Final de Grado - FirewallTool
# Universidad Nacional de Itapua
# Facultad de Ingenieria.
# User: Raul Benitez Netto
# Date: 8/09/13
# Time: 21:13

class Network  < ActiveRecord::Base

end
