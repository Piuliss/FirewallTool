/**
 * Trabajo Final de Grado - FirewallTool
 * Universidad Nacional de Itapua
 * Facultad de Ingenieria.
 * User: Raul Benitez Netto
 * Date: 11/08/13
 * Time: 20:19
 */

function ControllerComponents (raphael, graphic_network_id){
    var thiz                = this;
    var _raphael            = raphael;
    var _graphic_network_id = graphic_network_id;
    var _simulation_controller;
    var _index              = 1;
    var _cont_package       = 0;
    var _objects_collection = {};
    var _packages_collection = {};
    var _connections_objects = [];
    var btn_run_simulation = $('#btn-run-simulation');
    var btn_reset_simulation = $('#btn-reset-simulation');


    this.getPackagesObjects = function (){
        return _packages_collection;
    }
    this.getPackagesObject = function (index){
        return _packages_collection[index];
    }
    this.getNetworkObjects = function (){
        return _objects_collection;
    };
    /* Get any objects drawn on dashboard (public)*/
    this.getNetworkObject = function (index){
        return getNetworkObject(index);
    };
    /* Get any objects drawn on dashboard*/
    var getNetworkObject = function (index){
        return _objects_collection[index];
    };

    /* Event to let drag and drop a packages above an object on dashboard*/
    var packagesEvent = function () {
        var components = null;
        var circles = [];
        $(".draggable-package").draggable({
            helper: "clone",
            start: function (ev, ui){
                components = $('.'+ALLOW_PACKAGES_SOURCE);
            },
            drag: function (ev, ui){
                if(components != null){
                    components.each(function() {
                        var elem = $(this);
                        var x = parseFloat(elem.attr('x'));
                        var y = parseFloat(elem.attr('y'));
                        var obj = _raphael.circle(x+16,y+16,24).attr({stroke: 'red'});
                        $(obj.node).hover(function (e) {
                            $(e.target).attr({ 'opacity': 0.2, 'stroke': 'blue'});
                        });
                        circles.push(obj);
                    });
                    components = null;
                }

            },
            stop: function (event, ui) {
                var top   = ui.position.top;
                var left  = ui.position.left - DELTA_LEFT;
                var elem  = $(this);
                var clone = elem.clone();
                var type  = clone.data('type');
                var src   = clone.attr('src');
                var obj   = event.toElement ? event.toElement : event.relatedTarget;
                if (obj.classList.contains(ALLOW_PACKAGES_SOURCE)){
                    var indexPackage = thiz.addComponent(elem.data('type'), top, left + 40);
                    var indexObj     = obj.getAttribute('data-index');
                    thiz.connectPackageWithOrigin(indexPackage, indexObj, true);
                }
                for(var i=0; i < circles.length ; i++){
                    circles[i].remove();
                }

            }
        });
    };
    this.addSourceAndDestinationForPackageSaved= function (index_package, source_index, destination_index){
        var message      = getNetworkObject(index_package);
        var source     = getNetworkObject(source_index);
        var destination = getNetworkObject(destination_index);
        message.setOnlySource(source);
        message.setOnlyDestination(destination);
    }
    this.connectPackageWithOrigin = function (indexPackage, indexObj){
        _listenerController.setChange();
        var message      = getNetworkObject(indexPackage);
        var computer     = getNetworkObject(indexObj);
        computer.addPackageForOrigin(message);
    }
    this.connectPackageWithDestination = function(indexPackage, indexObj) {
        var package = getNetworkObject(indexPackage);
        var destination = getNetworkObject(indexObj);
        destination.addPackageForDestination(package);
    }
    var addPackagesCollection = function (message){
        _packages_collection[message.getIndex()] = message;
    };
    /* get all packages added on dashboard*/
    var getPackagesCollectionToArray = function () {
        var packages = [];
        for(var k in _packages_collection){
            packages.push(_packages_collection[k]);
        }
        return packages;
    }

    /* This event is called when you click on run simulation*/
    var runSimpleSimulationEvent = function () {

        btn_run_simulation.on('click',function (ev) {
            ev.preventDefault();
            var elem = $(this);
            if(elem.attr('disabled') == null){
                _simulation_controller.runSimpleSimulation(getPackagesCollectionToArray(),  thiz.getGraphicNetworkId());
                btn_reset_simulation.removeAttr('disabled');
            }
        });
    };

    var resetSimpleSimulationEvent = function () {
        btn_reset_simulation.on('click', function (ev) {
            ev.preventDefault();
            var elem = $(this);
            if(elem.attr('disabled') == null){
                _simulation_controller.resetSimpleSimulation();
                btn_reset_simulation.attr('disabled', 'disabled');
                resetFirewallSaturationVars();
            }

        });
    };

    var resetFirewallSaturationVars = function(){
        firewallInactived = false;
        changeFirewallState();
        count_eth0_packet = 0;
        count_eth1_packet = 0;
        count_eth2_packet = 0;
        current_second = 0;
        package_accept = 0;
        package_drop = 0;
        function_count = 0;
        tcp_package_accept = 0;
        tcp_package_drop = 0;
        udp_package_accept = 0;
        udp_package_drop = 0;
        icmp_package_accept = 0;
        icmp_package_drop = 0;
        package_counter = 0;
        //debug_mode = false;
        $("#eth0-id").text(count_eth0_packet);
        $("#eth1-id").text(count_eth1_packet);
        $("#eth2-id").text(count_eth2_packet);
        $("#clock-id").text(current_second);
        $("#accept-id").text(package_accept);
        $("#drop-id").text(package_drop);
        $("#tcp-accept-id").text(tcp_package_accept);
        $("#udp-accept-id").text(udp_package_accept);
        $("#icmp-accept-id").text(icmp_package_accept);
        $("#tcp-drop-id").text(tcp_package_drop);
        $("#udp-drop-id").text(udp_package_drop);
        $("#icmp-drop-id").text(icmp_package_drop);
        $("#package-second-id").text(0);
        $("#duration-id").text(0);
        $("#all-rules").find('tr').each(function(i,tr){ $(tr).removeClass("matched")});
        $("#all-policies").find('tr').each(function(i,tr){ $(tr).removeClass("matched")});


    };

    /* this event let drag and drop any objects on left side of the dashboard and move to main-plain */
    var draggableFunction = function () {
        $(".draggable").draggable({
            helper: "clone",
            stop: function (event, ui) {
//                event.preventDefault();
                var obj   = event.toElement ? event.toElement : event.relatedTarget;
                if (obj.id === HOLDER_ID){
                    var top   = ui.position.top;
                    var left  = ui.position.left - DELTA_LEFT;
                    var clone = $(this).clone();
                    var type  = clone.data('type');
                    var src   = clone.attr('src');
                    thiz.addComponent(type, top, left);

                }

            }
        });
    };

    /* this event let click on image of network fiber and create connection between objects  */
    var createConnectionsEvents = function(){
        var connectionPoint = [];
        $('img.connection').off();
        $('img.connection').on('click',function(){
            var svg = $('.main-plain');
            var firewall = thiz.getFirewallAdded();
            if (firewall != null ){
                firewall.showEthPositions()
            }
            var elem_to_connect = $('.'+FOR_CONNECTING_CLASS);
            var r = _raphael;
//            var controlFactory;
            svg.css('cursor','pointer');
            elem_to_connect.css('cursor','crosshair');
            elem_to_connect.on('click',function(){
                var elem = this;
                var x = parseFloat(elem.getAttribute('x')) + (IMAGE_WIDTH / 2);
                var y = parseFloat(elem.getAttribute('y')) + (IMAGE_HEIGHT / 2);
                var isAdding = elem.classList.contains('point-adding');
                if(!isAdding){
                    if(connectionPoint.length <= 0){
                        var path = [["M", x, y], ["L", x, y]];
//                        controlFactory = r.path(path).attr({stroke: "", "stroke-dasharray": ""});
                        elem.classList.add("point-adding");
                        connectionPoint.push(elem);
                        svg.mousemove(function (ev) {
                            var left   = ev.pageX - DELTA_LEFT;
                            var top    = ev.pageY;
                            path[1][1] = left;
                            path[1][2] = top;
//                            controlFactory.attr({path: path});
                        });
                    }else{
                        svg.off('mousemove');
                        var pointB = elem;
                        var pointA = connectionPoint.pop();
                        pointA.classList.remove('point-adding');
//                        controlFactory.remove();
                        thiz.createGraphicConnections(pointA, pointB);
                        svg.css('cursor','cell');
                        elem_to_connect.css('cursor','cell').off('click');
                        elem_to_connect.css('cursor', 'move');
                        if (firewall != null ){
                            firewall.hideEthPositions()
                        }
                    }

                }

            });
            svg.bind("contextmenu",function(e) {
                e.preventDefault();
                var firewall = thiz.getFirewallAdded();
                if (firewall != null ){
                    firewall.hideEthPositions()
                }
                svg.css('cursor','cell');
                svg.off();
//                controlFactory.remove();
                elem_to_connect.css('cursor','cell').off('click');
                elem_to_connect.css('cursor', 'move');

            });
        });
    };

   /* this method in called when you create a new ControllerComponents*/
    var init = function () {
        _simulation_controller = new SimulationController(_raphael);
        packagesEvent();
        runSimpleSimulationEvent();
        draggableFunction();
        createConnectionsEvents();
        resetSimpleSimulationEvent();

    };
    init();

    /*Create a hash with all data of components (network objects) of the dashboard*/
    var buildHashComponents = function (){
        var components   = {};
        for(var key in _objects_collection){
            var obj = _objects_collection[key];
            var params =  obj.getAttributeParams();
            components[key]= params;

        }
        return components

    }
    /* create a hash about all connections on dashboard*/
    var buildHashConnection = function () {
        var connections  = {};
        var connections_objects = _controllerConnections.getConnectionsCollection();
        for(var i = 0; i<connections_objects.length; i++){
            var elems = connections_objects[i];
            var objA  = elems.getObjA();
            var objB  = elems.getObjB();
            connections[i.toString()]= { pointA_id: objA.getIndex(), pointB_id: objB.getIndex()};

        }
        return connections;
    };

    var buildHashPackages = function (){
        var packages = {};
        var h = thiz.getPackagesObjects();
        for(var k in h){
            var pack = h[k];
            packages[k] =  pack.getAttributeParams();
        }
        return packages;

    }

    //FUNCTIONS
    /* This function parse the rules table and returns an array with hash attributes*/
    var getRulesParameters = function(){
        var rules = [];
        var order = -1;
        $("#all-rules select, #all-rules input:text, #all-rules input:checkbox:checked").each(function(index, element){
            var name = $(element).attr("name");
            var value = $(element).val();
            var attr = name.match(/table|chain|input_device|output_device|source_ip|source_mask|destination_ip|destination_mask|protocol|source_port|destination_port|connection_states|job|nat_action_ip|nat_action_mask/)[0];
            if(attr == "table")
                order += 1;

            if(rules[order] == undefined)
                rules[order] = {};

            if(attr == "connection_states"){
                (rules[order][attr] == undefined) ? rules[order][attr] = [value] : rules[order][attr].push(value);
            }else{
                rules[order][attr] = value;
            }
        });
        return rules;
    };

    /* This funcion parse the rules table and returns an array with hash attributes*/
    var getPoliciesParameters = function(){
        var rules = [];
        var order = -1;
        $("#all-policies select").each(function(index, element){
            var name = $(element).attr("name");
            var value = $(element).val();
            var attr = name.match(/table|chain|job/)[0];
            if(attr == "table")
                order += 1;

            if(rules[order] == undefined)
                rules[order] = {};

            rules[order][attr] = value;

        });
        return rules;
    };

    /* This function parse the rules table and returns an array with hash attributes*/
    var getOptionParameters = function(){
        var option = {};
        $("#option-form select, #option-form input").each(function(index, element){
            var name = $(element).attr("name");
            var value = $(element).val();
            option[name] = value
        });
        return option;
    };

    var getFirewallParameters = function(){
        var data = {};
        $.each($("#flood-form").serializeArray(), function(index, element){
            data[element["name"]] = element["value"];
        });
        return data;
    };
    this.checkToSaveUpdateDiagram = function (){
        var message = {checked: true , msg: ''}
        var p = thiz.getPackagesObjects();
        for(var k in p){
            var pack = p[k];
            if(pack.haveDestination() == false) {
                message['checked'] = false;
                message['msg'] = "You need to target  destination for all packages added to diagram";
                break;
            }
        }
        //add another think to check before to save/update diagram
        return message

    }

    /*this method is called when you want to 'save as' a diagram from dashboard*/
    this.buildDiagram = function(diagramName){
        var data= {connections: '', components:''};
        var summary_check = thiz.checkToSaveUpdateDiagram();
        if(summary_check['checked'] == true){
            data['connections']  = buildHashConnection();
            data['components']   = buildHashComponents();
            data['packages']     = buildHashPackages();
            data['graphic_name'] = diagramName;
            data['option']       = getOptionParameters();
            if(thereIsFirewall()){
                data['firewall']     = getFirewallParameters();
                data['rules']        = getRulesParameters();
                data['policies']     = getPoliciesParameters();
            }
            $.ajax({type:'POST',
                data:data,
                url: '/dashboard/create_diagram',
                dataType:'script'});

        }else {
            showFlashMessageTextError(summary_check['msg']);
        }
    };

    /*this method is called when you want to 'save' (update) a diagram from dashboard*/
    this.updateDiagram = function(graphic_network_id){
        var data    = {};
        var summary_check = thiz.checkToSaveUpdateDiagram();
        if(summary_check['checked'] == true){
            data['connections']         = buildHashConnection();
            data['components']          = buildHashComponents();
            data['packages']            = buildHashPackages();
            data['graphic_network_id']  = graphic_network_id;
            data['option']              = getOptionParameters();
            if(thereIsFirewall()){
                data['firewall']     = getFirewallParameters();
                data['rules']        = getRulesParameters();
                data['policies']     = getPoliciesParameters();
            }
            $.ajax({type:'PATCH',
                data:data,
                url: '/dashboard/' + graphic_network_id,
                dataType:'script'});
        }else {
            showFlashMessageTextError(summary_check['msg']);
        }


    };

    /*This method is called when you add a component (Any) to dashboard page (main-plain)*/
    this.addComponent = function(type, y, x, params ){
        _listenerController.setChange();
        _index++;
        var attributes_params       = params || $.extend({}, DEFAULT_ATTR_PARAMS[type]) || {};
        attributes_params['type']   = type;
        attributes_params['posX']   = x;
        attributes_params['posY']   = y;
        if (attributes_params['id'] === '' || attributes_params['id'] === undefined ) attributes_params['id'] = _index;
        var oc = eval("new " + type +"()");
        if(oc instanceof Package) {
            oc.setNumber(_cont_package);
            _cont_package ++;
        }
        var pos = oc.init(_raphael,  attributes_params);
        _objects_collection[pos] = oc;
        if(oc instanceof Firewall) INDEX_FIREWALL = pos;
        else if(oc instanceof Package) addPackagesCollection(oc);
        return pos;
    };
    this.remove = function (index) {
        delete  _objects_collection[index];
        delete  _packages_collection[index];
    };


    this.removeAllElements =  function(){
        _raphael.clear();
        _connections_objects = [];
        _objects_collection  =  {};
        _packages_collection = {};
        _index = 0;
        $('.main-plain .tooltip').remove();
        _controllerConnections.clear();
        _simulation_controller.clear();
        _cont_package = 0;
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

    var getRules = function(){
        var rules = [];
        $("#all-rules select, #all-rules input").each(function(index, element){
            rules[$(element).attr("name")] = $(element).val();
        });
        return rules;
    };
    this.getFirewallAdded = function () {
        return thiz.getNetworkObject(INDEX_FIREWALL)

    }

    this.setGraphicNetworkId = function (id){
        _graphic_network_id = id;
        btn_run_simulation.removeAttr('disabled');
    };
    this.getGraphicNetworkId = function () {
       return _graphic_network_id;
    };



}

