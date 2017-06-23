function PreConfiguredPackage(pre_configured_type, attr_params_configured){
    var _pre_configured_type = pre_configured_type;
    var _attr_params_configured = attr_params_configured;

    Package.call(this, pre_configured_type);

    this.getPreConfiguredType = function () {
        return _pre_configured_type;
    };
    this.getAttrParamsConfigured = function (){
        return _attr_params_configured;
    };

    this.setAttrParamsConfigured = function( attr_params_configured) {
        _attr_params_configured = attr_params_configured;
    };


}
PreConfiguredPackage.prototype = new Package();
PreConfiguredPackage.prototype.init = function (raphael, attr_params) {
    var attr_params_configured = this.getAttrParamsConfigured();
    for(var k in attr_params_configured){
        if (attr_params[k] == '' || attr_params[k] == null){
            attr_params[k] = attr_params_configured[k];
        }

    }
    attr_params['pre_configured_type'] = true;
    var index = Package.prototype.init.call(this,raphael, attr_params);
    this.addArrayDisableAttrs(['connection_state','syn', 'ack', 'rst', 'fin', 'destination_index', 'source_index', 'pre_configured_type', 'amount', 'protocol']);
    return index
};
//Ataque usando TCP:
//    - Setear tipo de paquete a TCP
//- Setear flag(s) (a true): syn, rst (puedes setear cualquiera o ambos)
//
function TcpSimple () {
    var attr_params_configured = { protocol: 'tcp', syn: true, rst: true, 'simulation_type': SIMPLE_SIMULATION, 'source_port': 80, 'destination_port':80 };
    PreConfiguredPackage.call(this,'TcpSimple', attr_params_configured)
}
TcpSimple.prototype = new PreConfiguredPackage();


//tcp_attack: "TcpAttack"
function TcpAttack () {
    var attr_params_configured = { amount: 10, protocol: 'tcp', syn: true, rst: true, 'simulation_type': ATTACK_SIMULATION, 'source_port': 80, 'destination_port':80  };
    PreConfiguredPackage.call(this,'TcpAttack', attr_params_configured);
}
TcpAttack.prototype = new PreConfiguredPackage();

//Ataque usando UDP:
//    - Setear tipo de paquete a TCP
//- Setear connection state NEW
//
//udp_simple: "UdpSimple"
function UdpSimple () {
    var attr_params_configured = { protocol: 'udp', connection_state: "NEW", 'simulation_type': SIMPLE_SIMULATION, 'source_port': 53, 'destination_port':53  };
    PreConfiguredPackage.call(this,'UdpSimple', attr_params_configured)
}
UdpSimple.prototype = new PreConfiguredPackage();


//udp_attack: "UdpAttack"
function UdpAttack () {
    var attr_params_configured = { amount: 10,protocol: 'udp', connection_state: "NEW", 'simulation_type': ATTACK_SIMULATION, 'source_port': 53, 'destination_port':53 };
    PreConfiguredPackage.call(this,'UdpAttack',attr_params_configured)
}
UdpAttack.prototype = new PreConfiguredPackage();

//Ataque usando ICMP:
//    - No se setea nada
//icmp_simple: "IcmpSimple"
function IcmpSimple () {
    var attr_params_configured = { protocol: 'icmp', 'simulation_type': SIMPLE_SIMULATION, 'source_port': 113, 'destination_port':113 };
    PreConfiguredPackage.call(this,'IcmpSimple', attr_params_configured)
}
IcmpSimple.prototype = new PreConfiguredPackage();

//icmp_attack: "IcmpAttack"
function IcmpAttack () {
    var attr_params_configured = { amount: 10, protocol: 'icmp', 'simulation_type': ATTACK_SIMULATION, 'source_port': 113, 'destination_port':113  };
    PreConfiguredPackage.call(this,'IcmpAttack', attr_params_configured)
}
IcmpAttack.prototype = new PreConfiguredPackage();





