/**
 * Trabajo Final de Grado - FirewallTool
 * Universidad Nacional de Itapua
 * Facultad de Ingenieria.
 * User: Raul Benitez Netto
 * Date: 23/09/13
 */
function Firewall(){
    var _type = 'Firewall'
    var thiz = this;
    var CIRCLE_RADIUS = 4;
    var _eth_shapes = [];
    var _eth_position_to_set = '';
    this.ETH0 = 'eth0';
    this.ETH1 = 'eth1';
    this.ETH2 = 'eth2';
    this.ARR_ETHS = [this.ETH0, this.ETH1, this.ETH2];
    NetworkHardware.call(this);
    var createCircleEth = function (ethPos, x, y) {
        var r = thiz.getRaphael();
        var circle = r.circle(x, y, CIRCLE_RADIUS);
        var color = Raphael.getColor();
        circle.attr({id: 'tt',fill: 'blue', stroke: 'blue', "fill-opacity": 0, "stroke-width": 2, "title": ethPos, "text": ethPos});
        var index = thiz.getIndex()+ '-' +ethPos;
        circle.node.id = index;
        circle.node.setAttribute('class', 'eth-class ' + ALLOW_PACKAGES_DESTINATION + ' ' + FOR_CONNECTING_CLASS );
        circle.hover(function () {this.attr({fill: 'red', stroke: 'red'}) }, function () { this.attr({fill: 'blue', stroke: 'blue'}) });
        circle.hide();
        var componentObj = $(circle.node);
        componentObj.attr('data-index', thiz.getIndex() );
        componentObj.attr('data-eth-position', ethPos);
        componentObj.attr('data-eth-index', index);
        return circle;
    }
    this.setEthPositionToNextConnection = function (ethPos) {
        _eth_position_to_set = ethPos
    };
    this.getEthPositionToNextConnection = function () {
        return _eth_position_to_set
    };

    this.showEthPositions = function () {
        for( var i = 0; i < _eth_shapes.length; i++){
            var circle = _eth_shapes[i];
            circle.show();
        }

    }
    this.hideEthPositions = function () {
        for( var i = 0; i < _eth_shapes.length; i++){
            var circle = _eth_shapes[i];
            circle.hide();
        }
    }
    this.createEthsMarks = function () {
        _eth_shapes.push(createCircleEth(this.ETH0, parseFloat(thiz.getPosX()) + 16,parseFloat( thiz.getPosY())));
        _eth_shapes.push(createCircleEth(this.ETH1, parseFloat(thiz.getPosX()), parseFloat(thiz.getPosY()) + 16));
        _eth_shapes.push(createCircleEth(this.ETH2, parseFloat(thiz.getPosX()) + 32, parseFloat(thiz.getPosY()) + 16));
    };

    this.moveEthsMarks = function () {
        for( var i = 0; i < _eth_shapes.length; i++){
            circle = _eth_shapes[i];
            var deltaX = 0;
            var deltaY = 0;
            if(i == 0 ){
                deltaX = 16;
            }else if (i == 1) {
                deltaY = 16;
            }else {
                deltaX = 32;
                deltaY = 16;
            }
            circle.attr({cx: parseFloat(thiz.getPosX() + deltaX), cy: parseFloat(thiz.getPosY() + deltaY)})
        }
    }
    this.getIpEthPos= function (eth_pos){
        return this.getAttrParam('ip_'+eth_pos);
    }
    this.setIpEthPos= function (eth_pos, value){
        return this.setAttrParam('ip_'+eth_pos, value);
    }
    this.getMaskIpEthPos= function (eth_pos){
        return this.getAttrParam('mask_ip_'+eth_pos);
    }
    this.setMaskIpEthPos= function (eth_pos, value){
        return this.setAttrParam('mask_ip_'+eth_pos, value);
    };

    /* CREATE MODAL FOR SELECT ETH POSITION*/
    this.createModalEth = function () {
        var html = '';
        html += '<div id="firewall-eth-modal" class="modal hide fade">';
        html += '<form>';
            html += '<div class="modal-header">';
                html += '<button type="button btn-close" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
                html += '<h3>Select Eth Position</h3>';
            html += '</div>';
            html += '<div class="modal-body">';
                html +=  '<div class="control-group">';
                    html += '<label class="control-label" for="input-11">Eth Position</label>';
                    html += '<div class="controls">';
                        html += '<select name="eth_position">';
                            html += '<option value="eth0">eth0</option>';
                            html += '<option value="eth1">eth1</option>';
                            html += '<option value="eth2">eth2</option>';
                        html += '</select>';
                    html += '</div>';
                html += '</div>';
            html += '</div>';
            html += '<div class="modal-footer">';
                html += '<button class="btn btn-close" data-dismiss="modal" aria-hidden="true">Close</button>';
                html += '<input type="submit" class="btn btn-primary btn-save" value="Select Position">';
            html += '</div>';
        html += '</form>';
        html +=  '</div>';
        return html;

    };
    this.openModal = function() {
//        var modal = $('#firewall-eth-modal');
//        if(modal.length) modal.remove();
        $('#modal-section').append(thiz.createModalEth());
        var modal = $('#firewall-eth-modal');
        modal.modal('show');
//        thiz.addModalEvents(modal);
        return modal;
    };
    this.ethModalSubmit = function (modal) {
        modal.find('form').submit(function(ev){
            ev.preventDefault();
            var elem        = $(this);
            var form_data = elem.serializeObject();
            this.setEthPositionToNextConnection(form_data['eth_position']);
//            elem.modal('hide');
        });

    };
    this.ethModalAfterHiddenThrowAddPackage = function (modal, pack) {
        var submitted = false;
        modal.find('form').on('submit', function (ev) {
            ev.preventDefault();
            var elem        = $(this);
            var form_data = elem.serializeObject();
            pack.setEthPosDestination(form_data['eth_position']);
            pack.setSourceFirewall(thiz);
            var index = pack.getIndex();
            thiz.addPackageToHashSource(index,pack);
            thiz.addPackageIds(index);
            submitted = true;
            modal.modal('hide');

        });
        modal.on('hidden', function (){
           if(!submitted) pack.remove();
           modal.remove();
        });

    }

}
Firewall.prototype = new NetworkHardware();
Firewall.prototype.init = function (raphael, attr_params) {
    if( thereIsFirewall() ){
        return false;
    }
    if ( attr_params['name'] === '') attr_params['name'] = 'Firewall';
    if ( attr_params['connections_limit'] === '' ) attr_params['connections_limit'] = 3;
    if ( attr_params['ip_eth0'] === '') attr_params['ip_eth0'] = '10.10.10.1';
    if ( attr_params['ip_eth1'] === '') attr_params['ip_eth1'] = '20.20.20.1';
    if ( attr_params['ip_eth2'] === '') attr_params['ip_eth2'] = '30.30.30.1';
    if ( attr_params['mask_ip_eth0'] === '') attr_params['mask_ip_eth0'] = '255.255.255.0'
    if ( attr_params['mask_ip_eth1'] === '') attr_params['mask_ip_eth1'] = '255.255.255.0'
    if ( attr_params['mask_ip_eth2'] === '') attr_params['mask_ip_eth2'] = '255.255.255.0'
    this.setAttrTooltip(['name']);
    this.addBlockAttrs(['syn_rules', 'udp_rules', 'icmp_rules', 'syn_limit', 'udp_limit', 'icmp_limit',
            'syn_unity', 'udp_unity', 'icmp_unity', 'syn_limit_burst', 'udp_hitcount', 'icmp_limit_burst',
            'source_code', 'connections_limit']);
    var index = NetworkHardware.prototype.init.call(this,raphael, 'Firewall', attr_params, '');
    this.setClassToShape(ALLOW_PACKAGES_SOURCE + ' firewall');
    return  index;
};
Firewall.prototype.afterRemoveEvent = function (){
    NetworkHardware.prototype.afterRemoveEvent.call(this);
    $("#policy-and-rules-container").hide(250);
    $("#all-policies").html("");
    $("#all-rules").html("");
    $("#all-code-policies").html("");
    $("#all-code-rules").html("");
    $("input[type='checkbox'][name='firewall[syn_rules]'], " +
        "input[type='checkbox'][name='firewall[udp_rules]'], " +
        "input[type='checkbox'][name='firewall[icmp_rules]']").prop("checked", false);
    $("#flood-form input").val("");
    $("#flood-form select").val("second");
    $(".debugger-container").slideUp(250);
    $("#debugger-link img").attr("src", "/assets/debug-disabled.png");
};

var showDebugFirewall = function(){
    var debuggerImage = $("#debugger-link img");
    debuggerImage.attr("src", "/assets/debug-add.png");
}

var showTableFirewall = function () {
    var firewallConnections = $("input[name='connections_limit'][data-type='Firewall']").val();
    var rulesAndPolicyContainer = $("#policy-and-rules-container");
    /* if exist a firewall then show rules and policies section */
//    if(thereIsFirewall()){
    rulesAndPolicyContainer.show();
//    }else{
//        rulesAndPolicyContainer.hide();
//    }

    /*when the user change connections limit of firewall object */
    $("#modal-section").on("click", "input[type='submit'][data-type='Firewall']",function(){
        var connections = $("input[name='connections_limit'][data-type='Firewall']").val();
        var interfaces = buildInterfaces(connections);
        if(firewallConnections != connections){
            $("select.rule-interface").each(function(){
                var thiz = $(this);
                var selected = thiz.val();
                thiz.html(optionsForInterface(interfaces, selected));
            });
            firewallConnections = connections;
        }
    });
}
/* re implement methods*/
Firewall.prototype.afterCreateConnection = function (obj_relation ){
    if (obj_relation instanceof Computer){
        var eth = this.getEthPositionToNextConnection();
        if(this.ARR_ETHS.indexOf(eth) > -1){
            obj_relation.setGatewayIp(this.getIpEthPos(eth))
        }

    }
};
Firewall.prototype.afterMoveEvent = function (x, y, index){
    NetworkHardware.prototype.afterMoveEvent.call(this,x, y, index);
    this.moveEthsMarks();
}
Firewall.prototype.afterCreateObject = function (){
    showTableFirewall();
    showDebugFirewall();
    this.createEthsMarks();
}
Firewall.prototype.addPackageForOrigin = function (elem) {
    var added_correctly = this.ethModalAfterHiddenThrowAddPackage(this.openModal(), elem);
};
Firewall.prototype.getIP = function () {
    return this.getAttrParam('ip_eth0');
};
Firewall.prototype.setIp = function(ip){
    this.setAttrParam('ip_eth0',ip);
};
Firewall.prototype.getMaskIp = function (){
    return this.getAttrParam('mask_ip_eth0')
};
Firewall.prototype.setMaskIp = function (mask_ip){
    this.setAttrParam('mask_ip_eth0',mask_ip);
};
Firewall.prototype.addPackageForDestination = function (elem) {
    elem.setDestinationFirewall(this);
    var index = elem.getIndex();
    this.addPackageToHashDestination(index, elem);
}