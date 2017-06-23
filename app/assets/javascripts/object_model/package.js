/**
 * Trabajo Final de Grado - FirewallTool
 * Universidad Nacional de Itapua
 * Facultad de Ingenieria.
 * User: Raul Benitez Netto
 * Date: 24/09/13
 */

function Package (type) {
    var _source = null;
    var _destination = null;
    var _type = type;
    var thiz = this;
    var _eth_pos_destination = null;
    var _number;
    var _number_shape ;
    var _disabled_attrs = ['destination_ip', 'destination_mask', 'source_mask', 'source_ip' ];
    var _checkbox_attrs = ['syn', 'ack', 'fin', 'rst'];
    var _selects_attrs = {'protocol' : ['tcp', 'udp', 'icmp'], 'connection_state' : ["","NEW", "ESTABLISHED", "RELATED"]};
    var _attr_with_weight = { 'protocol': 0,            'source_ip': 10,     'source_mask': 20,  "destination_ip":30,
                              "destination_mask":40,     'source_port':50,    'destination_port':60,
                              'connection_state': 70,    'syn':80, 'ack':90,   'fin':100, 'rst':110, 'amount': 75 };

    DiagramObject.call(this);


    //setters  and getters
    this.getAttrWithWeight = function () {
        return _attr_with_weight;
    }
    this.getSelectsAttrs = function () {
        return _selects_attrs;
    }
    this.setNumber = function (number){
        _number = number;
    }
    this.getNumber = function (){
        return _number;
    }
    this.setNumberShape = function (n) {
        _number_shape = n;
    }
    this.getNumberShape = function () {
        return _number_shape;
    }
    this.getType = function (){
        return _type;
    }
    this.setType = function (type){
        _type = type;
    }
    this.setProtocol = function (protocol){
       this.setAttrParam('protocol', protocol);
    }
    this.getProtocol = function () {
        return this.getAttrParam('protocol');
    };
    this.setSimulationType = function (simulation_type){
        this.setAttrParam('simulation_type', simulation_type);
    }
    this.getSimulationType = function () {
        return this.getAttrParam('simulation_type');
    };

    this.setSourceIndex = function (index){
        this.setAttrParam('source_index',index);
    }
    this.setDestinationIndex = function (index){
        this.setAttrParam('destination_index',index);
    }
    this.getSourceIndex = function () {
        return this.getAttrParam('source_index');
    };
    this.getDestinationIndex = function () {
        return this.getAttrParam('destination_index');
    };

    this.setSourceIp = function (source_ip){
        var attr = this.getAttributeParams();
        attr['source_ip'] = source_ip;
        this.setAttributeParams(attr);
    };

    this.getSourceIp = function () {
        return _source.getIP();
    };

    this.setDestinationIp = function (destination_ip){
        var attr = this.getAttributeParams();
        attr['destination_ip'] = destination_ip;
        this.setAttributeParams(attr);
    };
    this.getDestinationIp = function () {
        return _destination.getIP();
    };
    this.setSourceId = function (source_id){
        var attr = this.getAttributeParams();
        attr['source_id'] = source_id;
        this.setAttributeParams(attr);
    };
    this.getSourceId = function () {
        return _source.getId()
    };
    this.setDestinationId = function (id){
        var attr = this.getAttributeParams();
        attr['destination_id'] = id;
        this.setAttributeParams(attr);
    };
    this.getDestinationId = function () {
        return _destination.getId();
    };
    this.setSourceType = function (source_type){
        var attr = this.getAttributeParams();
        attr['source_type'] = source_type;
        this.setAttributeParams(attr);
    };
    this.setDestinationType = function (type){
        var attr = this.getAttributeParams();
        attr['destination_type'] = type;
        this.setAttributeParams(attr);
    }
    this.setSourceMask = function (source_mask) {
        this.setAttrParam('source_mask', source_mask);
    };
    this.getSourceMask = function () {
        return this.getAttrParam('source_mask');
    };
    this.setDestinationMask = function (destination_mask){
        this.setAttrParam('destination_mask', destination_mask);
    };
    this.getDestinationMask = function (){
        return this.getAttrParam('destination_mask');
    };

    this.setOnlySource = function (source){
        _source = source;
        thiz.setSourceType(source.getType());
        thiz.setSourceId(source.getId());
        thiz.setSourceIndex(source.getIndex())

    }
    this.setOnlyDestination = function (destination){
        _destination = destination;
        thiz.setDestinationType(destination.getType());
        thiz.setDestinationId(destination.getId());
        thiz.setDestinationIndex(destination.getIndex())
    }
    this.setSource = function (source){
       _source = source;
       thiz.setSourceType(source.getType());
       thiz.setSourceIp(source.getIP());
       thiz.setSourceId(source.getId());
       thiz.setSourceMask(source.getMaskIp());
       thiz.setSourceIndex(source.getIndex());
    }

    this.setDestination = function(destination){
        _destination = destination;
        thiz.setDestinationType(destination.getType());
        thiz.setDestinationIp(destination.getIP());
        thiz.setDestinationId(destination.getId());
        thiz.setDestinationMask(destination.getMaskIp());
        thiz.setDestinationIndex(destination.getIndex());

    }
    this.setDestinationFirewall = function (destination_firewall){
        _destination = destination_firewall;
        var eth = this.getEthPosDestination();
        thiz.setDestinationType(destination_firewall.getType());
        thiz.setDestinationIp(destination_firewall.getIpEthPos(eth));
        thiz.setDestinationId(destination_firewall.getId());
        thiz.setDestinationMask(destination_firewall.getMaskIpEthPos(eth));
        thiz.setDestinationIndex(destination_firewall.getIndex());

    };
    this.setSourceFirewall = function (source_firewall){
        _source = source_firewall;
        var eth = this.getEthPosDestination();
        thiz.setSourceType(source_firewall.getType());
        thiz.setSourceIp(source_firewall.getIpEthPos(eth));
        thiz.setSourceId(source_firewall.getId());
        thiz.setSourceMask(source_firewall.getMaskIpEthPos(eth));
        thiz.setSourceIndex(source_firewall.getIndex());

    }
    this.getEthPosDestination = function (){
        return _eth_pos_destination;
    };
    this.setEthPosDestination = function (eth) {
         _eth_pos_destination = eth;
    }
    this.getSource = function () {
        return _source;
    }
    this.getDestination = function () {
        return _destination;
    }
    this.haveDestination = function () {
        return _destination != null;
    };
    this.createGraphicConnections = function(pointA, pointB){
        var objA = getNetworkObject(pointA.getAttribute('data-index'));
        var objB = getNetworkObject(pointB.getAttribute('data-index'));
        if(pointA.classList.contains('eth-class') && objA instanceof Firewall) {
            objA.setEthPositionToNextConnection(pointA.getAttribute('data-eth-position'));
        }
        if(pointB.classList.contains('eth-class')  && objB instanceof Firewall) {
            objB.setEthPositionToNextConnection(pointB.getAttribute('data-eth-position'));
        }
        objA.createConnection(objB);
    }

    this.settingDestinationEvent = function () {
        var firewall = _controllerNetwork.getFirewallAdded();
        if (firewall != null ){
            firewall.showEthPositions()
        }
        var svg = $('.main-plain');
        var elem_to_connect = $('.'+ALLOW_PACKAGES_DESTINATION);
        var r = thiz.getRaphael();
        svg.css('cursor','pointer');
        var elem = thiz.getShape().node;
        var x = parseFloat(elem.getAttribute('x')) + (IMAGE_WIDTH / 2);
        var y = parseFloat(elem.getAttribute('y')) + (IMAGE_HEIGHT / 2);
        // create linea factory
        var path = [["M", x, y], ["L", x, y]];
//        var controlFactory = r.path(path).attr({stroke: "", "stroke-dasharray": ""});
        svg.mousemove(function (ev) {
            var left   = ev.pageX - DELTA_LEFT;
            var top    = ev.pageY;
            path[1][1] = left;
            path[1][2] = top;
//            controlFactory.attr({path: path});
        });
        elem_to_connect.css('cursor','crosshair');
        /* Effect when you click on the network component*/
        elem_to_connect.on('click',function () {
            svg.off('mousemove');
            var elemB = this;
//            controlFactory.remove();
            var indexB = elemB.getAttribute('data-index');
            var indexA = elem.getAttribute('data-index');
            var package = thiz;
            var destination = _controllerNetwork.getNetworkObject(indexB);
            if(destination instanceof Firewall) package.setEthPosDestination(elemB.getAttribute('data-eth-position'));
            destination.addPackageForDestination(package);
            svg.css('cursor','cell');
            elem_to_connect.css('cursor','cell').off('click');
            elem_to_connect.css('cursor', 'move');
            if (firewall != null ){
                firewall.hideEthPositions()
            }
            _listenerController.setChange();

        });
        svg.bind("contextmenu",function(e) {
            e.preventDefault();
//            controlFactory.remove();
            svg.css('cursor','cell');
            elem_to_connect.css('cursor','cell').off('click');
            elem_to_connect.css('cursor', 'move');
            $(this).off();
            if (firewall != null ){
                firewall.hideEthPositions()
            }

        });


    };

    this.isAttackPackage = function () {
        return ATTACK_PACKAGES.indexOf(thiz.getType()) > -1;
    }
    this.isNormalPackage = function () {
        return NORMAL_PACKAGES.indexOf(thiz.getType()) > -1;
    }
    this.haveSource = function (){
        return this.getSource() != null;
    }
    this.haveDestination = function () {
        return this.getDestination() != null;
    }

    this.updateNumberPosition = function (x , y){
         x += 25;
         y += 23;
        this.getNumberShape().attr({x: x, y: y});
    }
    this.addNumberShape = function () {
        var x = this.getPosX() + 25;
        var y = this.getPosY() + 23;
        var number = this.getRaphael().text(x,y, this.getNumber());
        number.attr({'font-size': '16px', 'font-weight': 'bold'});
        this.setNumberShape(number);
    }

    this.getCheckboxAttrs = function (){
        return _checkbox_attrs;
    }
    this.getDisabledAttrs = function () {
        return _disabled_attrs;
    }
    this.addArrayDisableAttrs = function (disabled_attrs){
        for(var i = 0; i < disabled_attrs.length ; i++){
            _disabled_attrs.push(disabled_attrs[i]);
        }
    }



}
Package.prototype = new DiagramObject();
Package.prototype.init = function (raphael, attr_params) {
    attr_params['source_index'] = attr_params['destination_index'] = '';
    attr_params['type'] = this.getType();
    if (attr_params['protocol'] == '' || attr_params['protocol'] == null) attr_params['protocol'] = TCP;
    var index = DiagramObject.prototype.init.call(this, raphael, this.getType(), attr_params, 'no-connect package');
    var thiz  = this;
    this.addItemForContextMenu({label:'Target Destination',  icon:'/assets/context-menu-icons/network-ip-local.png', action: function() { $('.contextMenuPlugin').remove(); thiz.settingDestinationEvent(); } });
    this.afterCreateEvent(this.getShape());
    this.addBlockAttrs(['index', 'package', 'state', 'group_of', 'sequence', 'incoming_interface', 'outgoing_interface',
                        'source_type', 'destination_type', 'source_id', 'destination_id', 'package_type', 'simulation_type',
                        'matched_policies','matched_rules', 'destination_index', 'source_index', 'pre_configured_type']);
    return index;
};
Package.prototype.afterCreateEvent = function (shape){
    this.addNumberShape();

};

Package.prototype.afterMoveEvent = function (x, y, index){
    DiagramObject.prototype.afterMoveEvent.call (this, x, y, index);
    this.updateNumberPosition(x,y);

}
Package.prototype.afterRemoveEvent = function (){
    DiagramObject.prototype.afterRemoveEvent.call(this);
   this.getNumberShape().remove();
}
Package.prototype.getAttributeParams = function(){
    var params_values = $.extend({}, DiagramObject.prototype.getAttributeParams.call(this));
//    var delete_params = ['id', 'posX', 'posY', 'type'];
//    for(var k in params_values){
//        if( $.inArray(k, delete_params ) > -1) {
//            delete params_values[k];
//        }
//    }
    params_values['index'] = this.getIndex();
    return params_values;
};
Package.prototype.createForm = function(){
    var html = '';
    var i = 0;
    var attrs = this.getAttributes();
    var block_attr = this.getBlockAttr();
    var type = this.getType();
    var checkbox_attrs = this.getCheckboxAttrs();
    var disabled_attrs = this.getDisabledAttrs();
    var selects_attrs = this.getSelectsAttrs();
    var attr_weight = this.getAttrWithWeight();
    var forms_fields = [];

    for(var key in attrs){
        if ($.inArray(key, block_attr ) <= -1){
            var label = i8n_modal_labels(key) || key;
            var field = '<div class="control-group"><label class="control-label" for="input-'+i+'">'+label+'</label><div class="controls">';
            var input_type = 'text';
            var klass_validation = key.indexOf('ip') > -1 || key.indexOf('mask') > -1 ? 'validate[custom[ipv4]] numeric' : '';
            var value = this.getAttrParam(key);
            var checked = '';
            var disabled = '';
            if (disabled_attrs.indexOf(key) > -1){ /*attributes disabled*/
                disabled = 'disabled="disabled"'
            }
            if(selects_attrs[key] != null ) { /*attributes with select*/
                field +='<select name="'+key+'" '+disabled+'>';
                var select_options = selects_attrs[key];
                for(var ik =0; ik< select_options.length; ik++){
                    var option_value = select_options[ik];
                    var selected_value = value == option_value ? 'selected="selected"' : '';
                    field += '<option value="'+option_value+'" '+selected_value+ ' >'+option_value+'</option>';
                }
                field += '</select>';
            }else {
                if (checkbox_attrs.indexOf(key) > -1){ /* attributes with checkbox*/
                    input_type = 'checkbox';
                    if(value == "true" || value == true) checked = 'checked = "checked"';
                    else value =  true;
                }
                field +='<input type="'+input_type+'" name="'+key+'" '+checked+ ' '+ disabled +' class="'+klass_validation+'" id="input-'+i+'" maxlength="26" value="'+ value+'" data-type="'+type+'"/>';
            }
            field += '</div></div>';
            var index = parseInt(attr_weight[key]);
            if(isNaN(index)){
                forms_fields.push(field);
            }else{
                forms_fields[index]= field;
            }



            i++;
        }
    }

    for(var i = 0; i < forms_fields.length ; i++){
        var field = forms_fields[i];
        if(field == null) continue;
        else html += field;
    }
    return html;
};


