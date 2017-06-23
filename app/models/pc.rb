# == Schema Information
#
# Table name: computers
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  ip                 :string(18)
#  mask_ip            :string(18)
#  gateway_ip         :string(18)
#  interface_amount   :integer
#  type               :string(50)
#  posY               :decimal(8, 4)
#  posX               :decimal(8, 4)
#  connections_limit  :integer          default(0)
#  graphic_network_id :integer
#

# Trabajo Final de Grado - FirewallTool
# Universidad Nacional de Itapua
# Facultad de Ingenieria.
# User: Raul Benitez Netto
# Date: 29/08/13
# Time: 19:47

class Pc < Computer
end
