function ConnectionDevice (type) {
	var _type = type;
	var _ip_list = [];
	NetworkHardware.call(this);


    this.getIpList = function (){
        return _ip_list;
    };
    this.setIpList = function (ip_list){
    	_ip_list = ip_list;
    };
    this.addIpToList = function (ip){
        _ip_list.push(ip);
    };

};
ConnectionDevice.prototype = new NetworkHardware();
ConnectionDevice.prototype.init = function (raphael, attr_params) {
    if ( attr_params['connections_limit'] === '' ) attr_params['connections_limit'] = 8;
    return NetworkHardware.prototype.init.call(this,raphael, attr_params['type'], attr_params,'connection-device');
};
ConnectionDevice.prototype.afterCreateConnection = function (obj_relation ){
    if(obj_relation instanceof  Computer){
        if(obj_relation.getIP() === DEFAULT_IP){
            var pos = this.getIpList().length + 1;
            var ip = "192.168.1."+pos;
            obj_relation.setNetworkDevice(this);
            this.addIpToList(ip);
            obj_relation.setIp(ip);
        }
    };
    NetworkHardware.prototype.afterCreateConnection.call(this, obj_relation);


};


