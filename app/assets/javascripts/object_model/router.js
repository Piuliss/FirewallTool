/**
 *@author Raul Benitez
 *@email raulbeni@gmail.com
 *
 */
function Router(){
    ConnectionDevice.call(this,'Router');
}

Router.prototype = new ConnectionDevice();
Router.prototype.init = function (raphael, attr_params) {
    if ( attr_params['host_name'] === '') attr_params['host_name'] = 'Router';
    this.setAttrTooltip(['host_name']);
    var index = ConnectionDevice.prototype.init.call(this,raphael, attr_params);
    this.addClassToShape(ALLOW_PACKAGE_BOTH);
    return index;
};
Router.prototype.getIP = function () {
    return this.getAttrParam('ip2');
};
Router.prototype.setIp = function(ip){
    this.setAttrParam('ip2',ip);
};
Router.prototype.getMaskIp = function (){
    return this.getAttrParam('mask_ip2')
};
Router.prototype.setMaskIp = function (mask_ip){
    this.setAttrParam('mask_ip2',mask_ip);
};

/**
 * Trabajo Final de Grado - FirewallTool
 * Universidad Nacional de Itapua
 * Facultad de Ingenieria.
 * User: Raul Benitez Netto
 * Date: 17/03/14
 * Time: 21:50
 */

function Internet () {
    Router.call(this,'Internet');
}
Internet.prototype = new Router();
Internet.prototype.init = function (raphael, attr_params) {
    if ( attr_params['host_name'] === '') attr_params['host_name'] = 'Internet';
    this.setAttrTooltip(['host_name']);
    var index = Router.prototype.init.call(this,raphael, attr_params);
    return index;
};