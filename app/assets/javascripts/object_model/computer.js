/**
 *@author Raul Benitez
 *@email raulbeni@gmail.com
 *
 */
function Computer(type){
    var _networkDevice = null;
    var _type = type;
    var thiz = this;

    NetworkHardware.call(this);
    /*GETTERS AND SETTERS*/
    this.setNetworkDevice = function(networkDevice){
        if(networkDevice instanceof  NetworkHardware){
            _networkDevice = networkDevice;

        }
    }
    this.getNetworkDevice = function (){
        return _networkDevice;
    }
    this.setGatewayIp = function (gateway_ip){
        this.setAttrParam('gateway_ip', gateway_ip);
    }
    this.getGatewayIp = function () {
        return this.getAttrParam('gateway_ip');
    }
    
};
Computer.prototype = new NetworkHardware();
Computer.prototype.init = function (raphael, attr_params) {
    if ( attr_params['ip'] === '') attr_params['ip'] = DEFAULT_IP;
    if ( attr_params['name'] === '') attr_params['name'] = attr_params['type'];
    if ( attr_params['connections_limit'] === '' ) attr_params['connections_limit'] = 1;
    if ( attr_params['mask_ip'] === '' ) attr_params['mask_ip'] = DEFAULT_MASK_IP;
    this.setAttrTooltip(['name','ip']);
    return NetworkHardware.prototype.init.call(this,raphael, attr_params['type'] , attr_params, ALLOW_PACKAGE_BOTH+ ' device');
};
Computer.prototype.getIP = function () {
    return this.getAttrParam('ip');
};
Computer.prototype.setIp = function(ip){
    this.setAttrParam('ip',ip);
    this.setAttrTooltip(['name','ip']);
    this.addTooltipEvent(true);
}

Computer.prototype.setAttributeParams = function ( attribute_params ){
    attribute_params = typeof attribute_params=== "undefined" ? {} : attribute_params;
    if (attribute_params['connections_limit'] === null || attribute_params['connections_limit'] === ''){
        attribute_params['connections_limit'] = 1;
    }
    if (attribute_params['ip'] === null || attribute_params['ip'] === '') {
        attribute_params['ip'] = "127.0.0.1";
    }
    if (attribute_params['mask_ip'] === null || attribute_params['mask_ip'] === '') {
        attribute_params['mask_ip'] = "255.255.255.0";
    }
    NetworkHardware.prototype.setAttributeParams.call(this,attribute_params);
};
Computer.prototype.setPositions = function(x,y){
    NetworkHardware.prototype.setPositions.call(this,x,y);
};
Computer.prototype.remove = function () {
    NetworkHardware.prototype.remove.call(this);
}
Computer.prototype.getMaskIp = function (){
    return this.getAttrParam('mask_ip')
};
Computer.prototype.setMaskIp = function (mask_ip){
    this.setAttrParam('mask_ip',mask_ip);
};


/* PC Class*/
function Pc(){
    Computer.call(this, 'Pc');
}
Pc.prototype = new Computer();
/* Laptop Class*/
function Laptop(){
    Computer.call(this, 'Laptop');
}
Laptop.prototype = new Computer();

/* Printer Class*/
function Printer(){
    Computer.call(this, 'Printer');
}
Printer.prototype = new Computer();

/* Server Class*/
function Server(){
    Computer.call(this, 'Server');
}
Server.prototype = new Computer();

