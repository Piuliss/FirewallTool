/**
 *@author Raul Benitez
 *@email raulbeni@gmail.com
 *
 */
function Switch(){
    ConnectionDevice.call(this,'Switch');
}
Switch.prototype = new ConnectionDevice();
Switch.prototype.init = function (raphael, attr_params) {
    if ( attr_params['name'] === '') attr_params['name'] = 'Switcher';
    this.setAttrTooltip(['name']);
    return ConnectionDevice.prototype.init.call(this,raphael, attr_params);
};
Switch.prototype.getIP = function () {
    return this.getAttrParam('ip');
};
Switch.prototype.setIp = function(ip){
    this.setAttrParam('ip',ip);
}
Switch.prototype.getMaskIp = function (){
    return this.getAttrParam('mask_ip')
};
Switch.prototype.setMaskIp = function (mask_ip){
    this.setAttrParam('mask_ip',mask_ip);
};