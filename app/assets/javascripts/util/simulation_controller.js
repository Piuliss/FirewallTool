/**
 * Trabajo Final de Grado - FirewallTool
 * Universidad Nacional de Itapua
 * Facultad de Ingenieria.
 * User: Raul Benitez Netto
 * Date: 12/01/14
 * Time: 14:06
 */
    //Packet counter for each interface
var count_eth0_packet = 0;
var count_eth1_packet = 0;
var count_eth2_packet = 0;
//NIC = 100mbp/s = 100.000 bits /s
var MAX_ETH_PACKET = 100000; // 100.000 bits/s
var TCP_PACKET_SIZE = 12000; // 4500 bytes = 12.000 bits
var UDP_PACKET_SIZE = 4096; //1 udp packet = 512 bytes(ethernet network) = 4096 bits,
var ICMP_PACKET_SIZE =  592 //bits
var current_second = 0;
var package_counter = 0;
var package_accept = 0;
var package_drop = 0;
var function_count = 0;
var tcp_package_accept = 0;
var tcp_package_drop = 0;
var udp_package_accept = 0;
var udp_package_drop = 0;
var icmp_package_accept = 0;
var icmp_package_drop = 0;
var debug_mode = false;


function SimulationController (raphael) {
    var thiz = this;
    var _raphael = raphael;
    var _cloneShapes = {};
    var _circleEvent = {} ;


    /*
    * This function is called before to run a simulation to display init values for debugger infos
    */
    var initCountersValues = function(){
        $("#clock-id").text(current_second);
        $("#drop-id").text(package_drop);
        $("#accept-id").text(package_accept);
        $("#tcp-accept-id").text(tcp_package_accept);
        $("#udp-accept-id").text(udp_package_accept);
        $("#icmp-accept-id").text(icmp_package_accept);
        $("#tcp-drop-id").text(tcp_package_drop);
        $("#udp-drop-id").text(udp_package_drop);
        $("#icmp-drop-id").text(icmp_package_drop);
        $("#package-second-id").text(0);
        $("#duration-id").text(0);
        package_counter = 0;
    }


   /* this method sent a hash with data about
    * package to begin the simulation
    * later the process data (path package)
    * is returned and processed to see the animation
    */
    this.runSimpleSimulation = function (packages_collection, graphic_network_id) {
        var attack_packages         = [];
        var normal_packages         = [];
        var loading_img = $('#loading-image');
        var run_button = $('#btn-run-simulation');
        var no_sent_packages = false;
        loading_img.show();
        run_button.hide();
        initCountersValues();

        if(graphic_network_id == '' || graphic_network_id == null){
            showFlashMessageTextError('You need to save the diagrams first, before to begin the simulation');
            loading_img.hide();
            run_button.show();
            return;
        }
        for(var k = 0; k < packages_collection.length; k++){
            var msg = packages_collection[k];
            var parameters = msg.getAttributeParams();
            if(msg.isAttackPackage()){
                attack_packages.push(parameters)
            }else if (msg.isNormalPackage()) {
                normal_packages.push(parameters);
            }else {
                showFlashMessageTextError('Error trying to set the package to generate the simulation, please refresh the page');
            }
            if(msg.haveSource() != true || msg.haveDestination() != true){
                no_sent_packages = true;
            }

        }

         if(no_sent_packages == false ){
             var data = {packages : normal_packages, attack_packages: attack_packages, graphic_network_id: graphic_network_id};
             $.ajax({
                 type:'GET',
                 data: data,
                 url: '/dashboard/generate_path_simulation',
                 dataType:'json',
                 success: function(data,textStatus) {
                     loading_img.hide();
                     run_button.show();
                     packageAnimation(data.paths);

                 },
                 error: function (xhr, textStatus, errorThrown){
                     loading_img.hide();
                     run_button.show();
                     var value = xhr.responseJSON.error;
                     showFlashMessageTextError(value);
                 }
             });
         } else {
             showFlashMessageTextError('Check destination or source (ip/mask ip) of all your packages are correctly saved');
             loading_img.hide();
             run_button.show();
         }


    };
    this.resetSimpleSimulation = function () {
       for(var key in _cloneShapes){
           if (key == "head") break;
           var packages = _cloneShapes[key];
           for(var i = 0; i < packages.length; i++){
               var pack  = packages[i]['elem'];
               var index =  key;//pack.node.getAttribute('data-index');
               pack.remove();
               packages[i]['number_shape'].remove();
               if(_circleEvent[index] != null){
                   _circleEvent[index].remove();
                   delete _circleEvent[index];

               }
           }
           delete _cloneShapes[key];
       }
        _cloneShapes = [];
        _circleEvent = {} ;
    };

    var debuggerContainerManager = function(){
        var debuggerContainer = $(".debugger-container");
        var debuggerLink = $("#debugger-link");
        var image = debuggerLink.find("img");
        var add = "/assets/debug-add.png";
        var remove = "/assets/debug-remove.png";
        if(image.attr("src") == add){
            debug_mode = false;
            $("#all-rules").find('tr').each(function(i,tr){ $(tr).removeClass("matched")});
            $("#all-policies").find('tr').each(function(i,tr){ $(tr).removeClass("matched")});
        }else if(image.attr("src") == remove){
            debug_mode = true;
        }else{
            debug_mode = false;
        }
    };

    /*
     * This function is called when debugger is enabled to pint the row matched by the packets
     **/
    var pintRowsMatched = function(matched_rules, matched_policies){
        var trRuleOrPolicy;
        if (matched_rules != "empty"){
            var rules = matched_rules.split(';');
            for(var i=0; i < rules.length - 1; i++ ){
                trRuleOrPolicy = $("tr[data-rule-id=" + rules[i] + "]");
                trRuleOrPolicy.addClass("matched");
            }
        }
        if(matched_policies!="emtpy"){
            var policies = matched_policies.split(';');
            for(var i=0; i < policies.length - 1; i++){
                trRuleOrPolicy = $("tr[data-policy-id= " + policies[i] + "]");
                trRuleOrPolicy.addClass("matched");
            }
        }

        // end pint row
    }

    /**
     * This function is called when a packet is on Firewall component
     */
    var callbackPackageFirewallFunction = function(package_obj, shape, event_type, x, y, number_shape,firewall, source_object ,total_packages, matched_rules, matched_policies){
        return function(){
            function_count += 1;
            if(function_count%2 == 1){
                // Pint row to matched rule or policy  when debug mode is enabled
                debuggerContainerManager();
                // pint row color when debug mode is enabled
                if (debug_mode){
                    pintRowsMatched(matched_rules,matched_policies);
                }

                $("#clock-id").text(current_second);

                // Calculate the time for the simulation
                var time = $('#option_attack_life').val();
                var time_in = $('#option_attack_time').val();
                var time_in_seconds = 0;
                if(time_in == 'second') time_in_seconds = time;
                if(time_in == 'minute') time_in_seconds = time*60;
                if(time_in == 'hour') time_in_seconds = time*60*60;
                if(time_in == 'day') time_in_seconds = time*60*60*60;

                // Get amount  packages by second that will support the firewall
                var packages_by_second = Math.floor(total_packages / time_in_seconds);
                if (total_packages < time_in_seconds)  packages_by_second = total_packages;
                $("#package-second-id").text(packages_by_second);
                $("#duration-id").text(time_in_seconds);
                // Check the time to reset the packages passed for the firewall by second
                package_counter = package_counter + 1;
                if (package_counter > packages_by_second) {
                    package_counter = 1;
                    count_eth0_packet = 0;
                    count_eth1_packet = 0;
                    count_eth2_packet = 0;
                    current_second = current_second + 1;
                    $("#clock-id").text(current_second);
                }

                var firewall_limit = 0;
                var tcp = false;
                var udp = false;
                var icmp = false
                // Count the package depending of the protocol and the network interface that the package is incoming
                if (package_obj.getProtocol() == "tcp"){

                    if (sameSubNet(firewall.getIpEthPos('eth0'), firewall.getMaskIpEthPos('eth0'),source_object.getIP())) count_eth0_packet += TCP_PACKET_SIZE;
                    if (sameSubNet(firewall.getIpEthPos('eth1'), firewall.getMaskIpEthPos('eth1'),source_object.getIP())) count_eth1_packet += TCP_PACKET_SIZE;
                    if (sameSubNet(firewall.getIpEthPos('eth2'), firewall.getMaskIpEthPos('eth2'),source_object.getIP())) count_eth2_packet += TCP_PACKET_SIZE;

                    firewall_limit = firewall.getAttrParam('syn_limit_burst');
                    if (firewall_limit == null) firewall_limit = 0;
                    tcp = true;

                } else if (package_obj.getProtocol() == "udp"){
                    if (sameSubNet(firewall.getIpEthPos('eth0'), firewall.getMaskIpEthPos('eth0'),source_object.getIP())) count_eth0_packet += UDP_PACKET_SIZE;
                    if (sameSubNet(firewall.getIpEthPos('eth1'), firewall.getMaskIpEthPos('eth1'),source_object.getIP())) count_eth1_packet += UDP_PACKET_SIZE;
                    if (sameSubNet(firewall.getIpEthPos('eth2'), firewall.getMaskIpEthPos('eth2'),source_object.getIP())) count_eth2_packet += UDP_PACKET_SIZE;
                    firewall_limit = firewall.getAttrParam('udp_hitcount');
                    if (firewall_limit == null) firewall_limit = 0;
                    udp = true;
                } else {
                    if (sameSubNet(firewall.getIpEthPos('eth0'), firewall.getMaskIpEthPos('eth0'),source_object.getIP())) count_eth0_packet += ICMP_PACKET_SIZE;
                    if (sameSubNet(firewall.getIpEthPos('eth1'), firewall.getMaskIpEthPos('eth1'),source_object.getIP())) count_eth1_packet += ICMP_PACKET_SIZE;
                    if (sameSubNet(firewall.getIpEthPos('eth2'), firewall.getMaskIpEthPos('eth2'),source_object.getIP())) count_eth2_packet += ICMP_PACKET_SIZE;
                    firewall_limit = firewall.getAttrParam('icmp_limit_burst');
                    if (firewall_limit == null) firewall_limit = 0;
                    icmp = true;
                }

                //Display eth values
                $("#eth0-id").text(count_eth0_packet);
                $("#eth1-id").text(count_eth1_packet);
                $("#eth2-id").text(count_eth2_packet);

                // Reset the amount of bits passed by the network interface
                if(sameSubNet(firewall.getIpEthPos('eth0'), firewall.getMaskIpEthPos('eth0'),source_object.getIP()) && firewall_limit != 0 && count_eth0_packet > 0 && firewall_limit < package_counter){
                    count_eth0_packet = 0;
                }
                if(sameSubNet(firewall.getIpEthPos('eth1'), firewall.getMaskIpEthPos('eth1'),source_object.getIP()) && firewall_limit != 0 && count_eth1_packet > 0 && firewall_limit < package_counter){
                    count_eth1_packet = 0;
                }
                if(sameSubNet(firewall.getIpEthPos('eth2'), firewall.getMaskIpEthPos('eth2'),source_object.getIP()) && firewall_limit != 0 &&  count_eth2_packet > 0 && firewall_limit < package_counter){
                    count_eth2_packet = 0;
                }

                if (count_eth0_packet > MAX_ETH_PACKET || count_eth1_packet > MAX_ETH_PACKET || count_eth2_packet > MAX_ETH_PACKET){
                    event_type = INACTIVE_EVENT;
                }
                // Event on Firewall
                var index = package_obj.getIndex();
                var r     = _raphael;
                if(_circleEvent[index] != null) _circleEvent[index].remove();
                var color = '';
                if(event_type == DROP_EVENT){
                    color = 'red';
                    package_drop += 1;
                    $("#drop-id").text(package_drop);
                    shape.remove();
                    number_shape.remove();
                    firewallInactived = false;
                    //check protocol
                    if (tcp) tcp_package_drop += 1;
                    if (udp) udp_package_drop += 1;
                    if (icmp) icmp_package_drop += 1;
                }else if(event_type == ACCEPT_EVENT){
                    color = 'green';
                    package_accept += 1;
                    $("#accept-id").text(package_accept);
                    firewallInactived = false;
                    //check protocol
                    if (tcp) tcp_package_accept += 1;
                    if (udp) udp_package_accept += 1;
                    if (icmp) icmp_package_accept += 1;
                }else if (event_type == INACTIVE_EVENT){   // This event is to simulate firewall out of service
                    package_drop += 1;
                    $("#drop-id").text(package_drop);
                    shape.remove();
                    number_shape.remove();
                    firewallInactived = true;
                    //check protocol
                    if (tcp) tcp_package_drop += 1;
                    if (udp) udp_package_drop += 1;
                    if (icmp) icmp_package_drop += 1;
                }else {
                    //when event_type is null is because the package was FORWARD
                    color = 'yellow';
                    package_accept += 1;
                    $("#accept-id").text(package_accept);
                    firewallInactived = false;
                    //check protocol
                    if (tcp) tcp_package_accept += 1;
                    if (udp) udp_package_accept += 1;
                    if (icmp) icmp_package_accept += 1;
                }
                changeFirewallState();


                $("#tcp-accept-id").text(tcp_package_accept);
                $("#udp-accept-id").text(udp_package_accept);
                $("#icmp-accept-id").text(icmp_package_accept);
                $("#tcp-drop-id").text(tcp_package_drop);
                $("#udp-drop-id").text(udp_package_drop);
                $("#icmp-drop-id").text(icmp_package_drop);

                _circleEvent[index] = r.circle(parseFloat(x)+16,parseFloat(y)+16,24).attr({stroke: color});

            }
        }
    }

    var sameSubNet = function(ip1, mask1, ip2){
        var oct1a = ip1.split('.')[0];
        var oct2a = ip1.split('.')[1];
        var oct3a = ip1.split('.')[2];
        var oct4a = ip1.split('.')[3];
        var snm1a = mask1.split('.')[0];
        var snm2a = mask1.split('.')[1];
        var snm3a = mask1.split('.')[2];
        var snm4a = mask1.split('.')[3];
        var oct1b = ip2.split('.')[0];
        var oct2b = ip2.split('.')[1];
        var oct3b = ip2.split('.')[2];
        var oct4b = ip2.split('.')[3];

        if (oct1a > 255) oct1a=255;
        if (oct2a > 255) oct2a=255;
        if (oct3a > 255) oct3a=255;
        if (oct4a > 255) oct4a=255;
        if (snm1a > 255) snm1a=255;
        if (snm2a > 255) snm2a=255;
        if (snm3a > 255) snm3a=255;
        if (snm4a > 255) snm4a=255;

        var nw1a = eval(snm1a & oct1a);
        var nw2a = eval(snm2a & oct2a);
        var nw3a = eval(snm3a & oct3a);
        var nw4a = eval(snm4a & oct4a);
        var broad1a = ((nw1a) ^ (~ snm1a) & 255);
        var broad2a = ((nw2a) ^ (~ snm2a) & 255);
        var broad3a = ((nw3a) ^ (~ snm3a) & 255);
        var broad4a = ((nw4a) ^ (~ snm4a) & 255);

        if (oct1b >= nw1a && oct1b <= broad1a) var oc1="true"
        if (oct2b >= nw2a && oct2b <= broad2a) var oc2="true"
        if (oct3b >= nw3a && oct3b <= broad3a) var oc3="true"
        if (oct4b >= nw4a && oct4b <= broad4a) var oc4="true"
        if (oc1 == "true" && oc2 == "true" && oc3 == "true" && oc4 == "true") {
            return true;
        }
        else {
            return false;
        }
        return false;
    }

    var callbackPackageFunction = function (package_obj, shape, event_type, x, y, number_shape,obj, source_object ,total_packages) {
        return function () {
            //component event
            var index = package_obj.getIndex();
            var r     = _raphael;
            if(_circleEvent[index] != null) _circleEvent[index].remove();
            var color = '';
            if(event_type == DROP_EVENT){
                color = 'red';
                shape.remove();
                number_shape.remove();

            }else if(event_type == ACCEPT_EVENT){
                color = 'green';


            }else if (event_type == INACTIVE_EVENT){   // This event is to simulate firewall out of service


            }else {
                color = 'yellow';
            }
            _circleEvent[index] = r.circle(parseFloat(x)+16,parseFloat(y)+16,24).attr({stroke: color});
        };
    };

   /*
    * this method is called when the method runSimpleSimulation()
    * process the package-path, and it create
    * the animation on dashboard
    */
    var packageAnimation = function (paths){

//        var total_packages_path = [];
        for(var i = 0; i<paths.length ; i++){
            var package_index               = paths[i]['index'];
            var main_package                = _controllerNetwork.getPackagesObject(package_index);

            var elem = main_package.getShape().clone();
            var number_shape = main_package.getNumberShape().clone();
            if( main_package.isAttackPackage() ) {
                elem.node.setAttribute('href', ATTACK_PACKAGE_UNIQUE_IMG)
            }

            elem.node.setAttribute('data-index', main_package.getIndex());
            if(_cloneShapes[package_index] == null) _cloneShapes[package_index] = [];

            var path                        = paths[i]['path'];
            var packages_path               = [];
            var source_object = null;

            for (var k = 0; k < path.length; k++ ){
                var array_components = path[k];
                var component_type   = array_components['component_type'];
                var component_id     = array_components['id'];
                var component_effect = array_components['event'];
                var index            = component_type.toLowerCase() + '-' + component_id;
                var obj              = _controllerNetwork.getNetworkObject(index);
                var matched_rules = array_components['rulesid'];
                var matched_policies = array_components['policiesid'];

                if (k == 0) source_object = _controllerNetwork.getNetworkObject(index);
                var y                = obj.getPosY();
                var x                = obj.getPosX();

                packages_path.push({y: y,
                                    x: x,
                                    easing: 'linear',
                                    callback: (obj instanceof Firewall)? callbackPackageFirewallFunction(main_package,elem, component_effect,x,y, number_shape, obj,source_object, paths.length, matched_rules, matched_policies) : null
                                    });
            }
            _cloneShapes[package_index].push({elem: elem, path: packages_path, number_shape: number_shape  });
        }
        for(var key in _cloneShapes){
            Concurrent.Thread.create(movePackage, _cloneShapes[key]);
        }



    };

    function movePackage (package_group) {
        var cont = 0;
        (function step () {
            var package_path    = package_group[cont]['path'];
            var time_porcentage = roundf(100 / package_path.length,0);
            var last_porcentage = time_porcentage;
            var attr_animation  = {};
            for ( var i =0; i < package_path.length; i++){
                attr_animation[last_porcentage+"%"] = package_path[i];
                last_porcentage += time_porcentage;
            }
            var shape =package_group[cont]['elem'];
            var number_shape = package_group[cont]['number_shape'];
            var index = shape.node.getAttribute('data-index');

            var animation = Raphael.animation(attr_animation, 1500 * package_path.length);
            shape.stop().animate(animation);
            number_shape.stop().animate(animation);
            cont++;
            if(cont < package_group.length){
                setTimeout(step, 1000);
            }
        })();
    }
    this.clear = function () {
        _cloneShapes = {};
        _circleEvent = {};
    }

};