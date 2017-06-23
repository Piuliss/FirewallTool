/**
 *@author Raul Benitez
 *@email raulbeni@gmail.com
 *
 */
function Network(connection_list,attribute_params){
    NetworkHardware.call(this,'network', connection_list,attribute_params);
}
Network.prototype = new NetworkHardware();