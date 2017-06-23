var CONNECTION_STATES = ["NEW", "ESTABLISHED", "RELATED"];
var PROTOCOLS = {"ALL": "all", "TCP": "tcp", "UDP": "udp", "ICMP": "icmp"};
var TABLES = ["filter", "nat"];
var CHAINS_BY_TABLE = {"filter": ["INPUT", "FORWARD", "OUTPUT"], "nat": ["PREROUTING", "OUTPUT", "POSTROUTING"]};
var DEVICE_BY_CHAIN = {"input_device": ["INPUT", "FORWARD", "PREROUTING"], "output_device": ["OUTPUT", "FORWARD", "POSTROUTING"]};
var JOBS_BY_CHAIN = {"filter": {"INPUT": ["ACCEPT", "DROP", "REJECT"], "FORWARD": ["ACCEPT", "DROP", "REJECT"], "OUTPUT": ["ACCEPT", "DROP", "REJECT"]},
                     "nat": {"PREROUTING": ["DNAT"], "OUTPUT": ["DNAT"], "POSTROUTING": ["SNAT","MASQUERADE"]}};
var POLICY_JOBS_BY_CHAIN = {"filter": {"INPUT": ["ACCEPT", "DROP"], "FORWARD": ["ACCEPT", "DROP"], "OUTPUT": ["ACCEPT", "DROP"]},
    "nat": {"PREROUTING": ["ACCEPT"], "OUTPUT": ["ACCEPT"], "POSTROUTING": ["ACCEPT"]}};
var ORDER = 0;
var SHOW_MESSAGE_TIME = 4000;
var FADE_OUT_TIME = 4000;
var POLICY_ORDER = 0;
var INDEX_FIREWALL = null;
var DEFAULT_IP = '127.0.0.1';
var DEFAULT_MASK_IP = '255.255.255.0';




var _controllerNetwork;
var _controllerConnections;
var _listenerController;
var IMAGE_WIDTH             = 32;
var IMAGE_HEIGHT            = 32;
var DELTA_LEFT              = 85;
var SIMPLE_SIMULATION       = 'simple_simulation';
var ATTACK_SIMULATION       = 'attack_simulation';
var TCP                     = "tcp";
var ATTACK_PACKAGE          = 'AttackPackage';
var NORMAL_PACKAGE          = 'NormalPackage';
var NORMAL_PACKAGES         = [NORMAL_PACKAGE, 'TcpSimple', 'UdpSimple', 'IcmpSimple'];
var ATTACK_PACKAGES         = [ATTACK_PACKAGE, 'TcpAttack', 'UdpAttack', 'IcmpAttack'];
var PRECONFIGURED_PACKAGE   = 'PreConfiguredPackage';
var ALLOW_PACKAGES_DESTINATION = 'allow-packages-destination';
var ALLOW_PACKAGES_SOURCE      = 'allow-packages-source';
var ALLOW_PACKAGE_BOTH  = ALLOW_PACKAGES_DESTINATION + ' ' + ALLOW_PACKAGES_SOURCE;
var FOR_CONNECTING_CLASS    = "to-connect";
var ATTACK_PACKAGE_UNIQUE_IMG = '/assets/attack_unique.png'
var DEFAULT_ATTR_PARAMS     = {};
var COMPONENTS_IMAGES_SRC   = {};

var connections = [];
var shapes = [];
var raphael;

/*Packet flow paths.
Packet Events*/
var DROP_EVENT      = 'DROP';
var ACCEPT_EVENT    = 'ACCEPT';
var REJECT_EVENT    = 'REJECT';
var RETURN_EVENT    = 'RETURN';
var CONTINUE_EVENT  = 'CONTINUE';
var INACTIVE_EVENT = 'INACTIVE';
var firewallInactived = false;

var HOLDER_HEIGHT;
var HOLDER_WIDTH;
var HOLDER_ID = 'svg-holder';

// This will initialize the plugin
// and show two dialog boxes: one with the text "Olá World"
// and other with the text "Good morning John!"
jQuery.i18n.properties({
    name:'Messages',
    path:'../assets/bundle/',
    mode:'map',
    lang: navigator.language || navigator.userLanguage

});

var i8n_label = function (key){
    var label =  jQuery.i18n.prop(key);
    return label;

}
var i8n_modal_labels = function (key){
    var label =  jQuery.i18n.prop('com.diagram.modal.' +key);
    if (label.indexOf('[') > -1){
        return null;
    }else {
        return label;
    }
}
/*returns an array, the first element is the html for a row in the view rule, the second element is the html for the code rule view*/
/* when you want to add a new rule order parameter must be null*/
var addRuleRowToViewAndCode = function(order, table, chain, input_device, output_device, source_ip, source_mask, destination_ip, destination_mask, protocol, source_port, destination_port, job, nat_action_ip, nat_action_mask, input_devices, output_devices, connection_states){
    if(order == null){
        ORDER++;
        order = ORDER;
    }
    var viewHtml = "";
    var codeHtml = "";

    var startTable = "<table>";
    var endTable = "</table>";

    var startTR    = "<tr data-order='" + (order) + "'>";
    var endTR      = "</tr>";
    var startTD    = "<td>";
    var endTD      = "</td>";
    viewHtml += startTR;
    codeHtml += startTR;

    //table
    viewHtml +=     startTD;
    codeHtml +=     startTD;
    viewHtml +=         "<select class='rule-table' data-order='" + order + "' id='table-" + order + "' name='rule[rules][" + (order) + "][table]'>";
                        $.each(TABLES, function(index, value){
                            var selected = (value == table) ? "selected='selected'" : "";
    viewHtml +=                "<option value='" + value.toLowerCase() + "' " + selected + ">" + value  + "</option>";
                            if(value == table)
    codeHtml +=                 value;
                        });
    viewHtml +=         "</select>";
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    //chain
    viewHtml +=     startTD;
    codeHtml +=     startTD;
    viewHtml +=         "<select class='rule-chain upper-case' data-order='" + order + "' id='chain-" + order + "' name='rule[rules][" + (order) + "][chain]'>";
                        $.each(CHAINS_BY_TABLE[table], function(index, value){
                           var selected = (value == chain) ? "selected= 'selected'" : "";
    viewHtml +=                "<option value='" + value + "' " + selected + ">" + value + "</option>";
                            if(value == chain)
    codeHtml +=                 value;
                        });
    viewHtml +=         "</select>";
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    // interface
    viewHtml += startTD;
    codeHtml += startTD;
        codeHtml += startTable;
        viewHtml += startTable;
            viewHtml += startTR;
            codeHtml += startTR;
            //source interface
                viewHtml += startTD;
                codeHtml += startTD;
                    viewHtml +=         "<select class='rule-interface' data-order='" + order + "' id='input-device-" + order + "' name='rule[rules][" + (order) + "][input_device]'>";
                        $.each(input_devices, function(index, value){
                            var selected = (value == input_device) ? "selected= 'selected'" : "";
                            var val    = (value == "eth...") ? "" : value;
                    viewHtml +=                 "<option value='" + val +"' " + selected + ">" + value +"</option>";
                            if(value == input_device)
                    codeHtml +=                 value;
                        });
                    viewHtml +=         "</select>";
                viewHtml +=     endTD;
                codeHtml +=     endTD;
            viewHtml += endTR;
            codeHtml += endTR;
            viewHtml += startTR;
            codeHtml += startTR;
            //destination interface
                viewHtml += startTD;
                codeHtml += startTD;
                        viewHtml +=         "<select class='rule-interface' data-order='" + order + "' id='output-device-" + order + "' name='rule[rules][" + (order) + "][output_device]'>";
                        $.each(output_devices, function(index, value){
                            var selected = (value == output_device) ? "selected= 'selected'" : "";
                            var val    = (value == "eth...") ? "" : value;
                            viewHtml +=                 "<option value='" + val +"' " + selected + ">" + value +"</option>";
                            if(value == output_device)
                                codeHtml +=                 value;
                        });
                        viewHtml +=         "</select>";
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
        viewHtml += endTable;
        codeHtml += endTable;
    viewHtml +=     endTD;
    codeHtml +=     endTD;





    //source
    viewHtml += startTD;
    codeHtml += startTD;
    codeHtml += startTD;
        viewHtml += startTable;
        codeHtml += startTable;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                    viewHtml += "<input class='rule-ip' data-order='" + order + "' name='rule[rules][" + (order) + "][source_ip]' maxlength='15' type='text' placeholder='ip' value='" + source_ip + "'>";
                    codeHtml += source_ip;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                    viewHtml += "<input class='rule-ip' data-order='" + order + "' name='rule[rules][" + (order) + "][source_mask]' maxlength='15' type='text' placeholder='mask' value='" + source_mask + "'>";
                    codeHtml += source_mask;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
        viewHtml += endTable;
        codeHtml += endTable;
    viewHtml += endTD;
    codeHtml += endTD;

    //destination
    viewHtml += startTD;
    codeHtml += startTD;
        viewHtml += startTable;
        codeHtml += startTable;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                    viewHtml += "<input class='rule-ip' data-order='" + order + "' name='rule[rules][" + (order) + "][destination_ip]' maxlength='15' type='text' placeholder='ip' value='" + destination_ip + "'>";
                    codeHtml += destination_ip;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                    viewHtml += "<input class='rule-ip' data-order='" + order + "' name='rule[rules][" + (order) + "][destination_mask]' maxlength='15' type='text' placeholder='mask' value='" + destination_mask + "'>";
                    codeHtml += destination_mask;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
        viewHtml += endTable;
        codeHtml += endTable;
    viewHtml += endTD;
    codeHtml += endTD;
    codeHtml += endTD;




    //protocol
    viewHtml +=     startTD;
    codeHtml +=     startTD;
    viewHtml +=         "<select class='rule-protocol' data-order='" + order + "' name='rule[rules][" + (order) + "][protocol]'>";
                        for (var key in PROTOCOLS) {
                            var value = PROTOCOLS[key];
                            var selected = (value == protocol) ? "selected= 'selected'" : "";
    viewHtml +=                 "<option value='" + value + "' " + selected + ">" + key + "</option>";
                            if(value == protocol)
    codeHtml +=                 value;
                        }
    viewHtml +=         "</select>";
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    // ports
    viewHtml += startTD;
    codeHtml += startTD;
        viewHtml += startTable;
        codeHtml += startTable;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                   //source port
                    viewHtml += "<input class='rule-port' data-order='" + order + "'  name='rule[rules][" + (order) + "][source_port]' type='text' placeholder='source' value='" + source_port + "'>";
                    codeHtml += source_port;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                   //destination port
                    viewHtml += "<input class='rule-port' data-order='" + order + "' name='rule[rules][" + (order) + "][destination_port]' type='text' placeholder='destination' value='" + destination_port + "'>";
                    codeHtml += destination_port;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
        viewHtml += endTable;
        codeHtml += endTable;
    viewHtml += endTD;
    codeHtml += endTD;


    //connection
    viewHtml +=     startTD;
    codeHtml +=     startTD;
                    $.each(CONNECTION_STATES, function(index, value){
                        var has = $.inArray(value, connection_states) >= 0;
                        var checked = has ? "checked='checked'" : "";
    viewHtml +=             "<label class='rule-connection no-margin'><input data-order='" + order + "' name='rule[rules][" + (order) + "][connection_states][]'" + checked + " type='checkbox' value='" + value +"'>" + value + "</label>";
                        if(has)
    codeHtml +=             "<p class='no-margin'>" + value + "</p>";
                    });
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    //action
    viewHtml +=     startTD;
    codeHtml +=     startTD;
    viewHtml +=         "<select class='rule-job upper-case' data-order='" + order + "' id='job-"+ order + "' name='rule[rules][" + (order) + "][job]'>";
                        $.each(JOBS_BY_CHAIN[table][chain], function(index, value){
                            var selected = (value == job) ? "selected= 'selected'" : "";
    viewHtml +=                 "<option value='" + value + "' " + selected + ">" + value + "</option>";
                            if(value == job)
    codeHtml +=                 value;
                        });
    viewHtml +=         "</select>";
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    //action ip
    viewHtml += startTD;
    codeHtml += startTD;
        viewHtml += startTable;
        codeHtml += startTable;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                    viewHtml += "<input class='rule-ip nat-action' data-order='" + (order) + "' name='rule[rules][" + (order) + "][nat_action_ip]' maxlength='15' type='text' placeholder='ip' value='" + nat_action_ip + "'>";
                    codeHtml += nat_action_ip;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
            viewHtml += startTR;
            codeHtml += startTR;
                viewHtml += startTD;
                codeHtml += startTD;
                    viewHtml += "<input class='rule-ip nat-action' data-order='" + (order) + "' name='rule[rules][" + (order) + "][nat_action_mask]' maxlength='15' type='text' placeholder='mask', value='" + nat_action_mask + "'>";
                    codeHtml += nat_action_mask;
                viewHtml += endTD;
                codeHtml += endTD;
            viewHtml += endTR;
            codeHtml += endTR;
        viewHtml += endTable;
        codeHtml += endTable;
    viewHtml += endTD;
    codeHtml += endTD;

    //remove link
    viewHtml +=     startTD;
    viewHtml +=         "<a class='btn btn-danger' data-order='" + (order) + "' data-remove-rule='true' href='#'><i class='icon-remove icon-white'></i></a>";
    viewHtml +=     endTD;

    viewHtml += endTR;
    return [viewHtml, codeHtml];
};

/*returns an array, the first element is the html for a row in the policy view, the second element is the html for the code rule view*/
/* when you want to add a new rule order parameter must be null*/
var addPolicyRowToViewAndCode = function(order, table, chain, job){
    if(order == null){
        ORDER++;
        order = ORDER;
    }
    var viewHtml = "";
    var codeHtml = "";

    var startTR    = "<tr data-order='" + (order) + "'>";
    var endTR      = "</tr>";
    var startTD    = "<td>";
    var endTD      = "</td>";
    viewHtml += startTR;
    codeHtml += startTR;

    //table
    viewHtml +=     startTD;
    codeHtml +=     startTD;
    viewHtml +=         "<select class='policy-table' data-order='" + order + "' id='policy-table-" + order + "' name='policy[policies][" + (order) + "][table]'>";
    $.each(TABLES, function(index, value){
        var selected = (value == table) ? "selected='selected'" : "";
        viewHtml +=                "<option value='" + value.toLowerCase() + "' " + selected + ">" + value.toLowerCase() + "</option>";
        if(value == table)
            codeHtml +=                 value;
    });
    viewHtml +=         "</select>";
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    //chain
    viewHtml +=     startTD;
    codeHtml +=     startTD;
    viewHtml +=         "<select class='policy-chain upper-case' data-order='" + order + "' id='policy-chain-" + order + "' name='policy[policies][" + (order) + "][chain]'>";
    $.each(CHAINS_BY_TABLE[table], function(index, value){
        var selected = (value == chain) ? "selected= 'selected'" : "";
        viewHtml +=                "<option value='" + value + "' " + selected + ">" + value + "</option>";
        if(value == chain)
            codeHtml +=                 value;
    });
    viewHtml +=         "</select>";
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    //action
    viewHtml +=     startTD;
    codeHtml +=     startTD;
    viewHtml +=         "<select class='policy-job upper-case' data-order='" + order + "' id='policy-job-"+ order + "' name='policy[policies][" + (order) + "][job]'>";
    $.each(POLICY_JOBS_BY_CHAIN[table][chain], function(index, value){
        var selected = (value == job) ? "selected= 'selected'" : "";
        viewHtml +=                 "<option value='" + value + "' " + selected + ">" + value + "</option>";
        if(value == job)
            codeHtml +=                 value;
    });
    viewHtml +=         "</select>";
    viewHtml +=     endTD;
    codeHtml +=     endTD;

    //remove link
    viewHtml +=     startTD;
    viewHtml +=         "<a class='btn btn-danger' data-order='" + (order) + "' data-remove-policy='true' href='#'><i class='icon-remove icon-white'></i></a>";
    viewHtml +=     endTD;

    codeHtml += endTR;
    viewHtml += endTR;
    return [viewHtml, codeHtml];
}


/*
 * to use this function you cold pass the key pressed, you can get this through the event,
 * also the array with each ip number and the current index of the key added
 */
var checkIpNumber = function(which, numbers, index){
    var arrayElement = numbers[Math.floor(index/4)];
    if( index > 14){
        //first number mask
        if(index%4 == 0){
            if((which < 52 && which > 47) || (which < 100 && which > 95)){
                return true;
            }else{
                return false;
            }
            //second number mask
        }else if (index%4 == 1){
            var firstNumber = parseInt(arrayElement[0]);
            if(firstNumber == 3){
                if((which < 51 && which > 47) || (which < 99 && which > 95)){
                    return true;
                }else{
                    return false;
                }
            }else{
                return true;
            }
        }
    }else{
        //first number
        if(index%4 == 0){
            //from 0 to 2
            if((which < 51 && which > 47) || (which < 99 && which > 95)){
                return true;
            }else{
                return false;
            }
            //second number
        }else if (index%4 == 1){
            var firstNumber = parseInt(arrayElement[0]);
            if(firstNumber == 2){
                if((which < 54 && which > 47) || (which < 102 && which > 95)){
                    return true;
                }else{
                    return false;
                }
            }else{
                return true;
            }
            //third number
        }else if(index%4 == 2){
            var firstNumber = parseInt(arrayElement[0]+arrayElement[1]);
            if(firstNumber == 25){
                if((which < 54 && which > 47) || (which < 102 && which > 95)){
                    return true;
                }else{
                    return false;
                }
            }
        }
    }
}

/*to validate port number*/
var checkPortNumberOrRange = function(value){
    var spplited = value.toString().split(":");
    var number1 = null;
    var number2 = null;
    if(spplited.length == 1){
        //is not a range
        if(!isNaN(spplited[0])){
            number1 = parseInt(spplited[0]);
        }else{
            number1 = spplited[0];
        }
        number2 = 1;
    }else if(spplited.length == 2){
        //is a range
        if(!isNaN(spplited[0])){
            number1 = parseInt(spplited[0]);
        }else{
            number1 = spplited[0];
        }

        if(!isNaN(spplited[1])){
            number2 = parseInt(spplited[1]);
        }else{
            number2 = spplited[1];
        }
    }else{
        //alert(number2 != NaN && number2 <= 65535 && number2 >= 1);
        return false;
    }

    if(number1 != NaN && number2 != NaN && number1 <= 65535 && number1 >= 1 && number2 <= 65535 && number2 >= 1){
        return true;
    }else{
        return false;
    }
};

var messageEffect = function(){
    $("#message-container").children().delay(SHOW_MESSAGE_TIME).fadeOut(FADE_OUT_TIME).delay(FADE_OUT_TIME);
};
showFlashMessages = function(html){
    $("#message-container").html(html).show().delay(SHOW_MESSAGE_TIME).fadeOut(FADE_OUT_TIME);
}
showFlashMessageTextError = function (text){
    var response = '';
    response += "<div class='alert alert-error'>";
    response += "<button type='button' class='close' data-dismiss='alert'>&times;</button>";
    response += text;
    response += "</div>";
    showFlashMessages(response);

}

var thereIsFirewall = function(){
    var array = document.getElementsByTagName("image");
    var match = null;
    var i = 0;
    for(i = 0; i < array.length; i++){
        var href = array[i].getAttribute("href");
        match = href.match("firewall");
        if(match != null) break;
    }
    return match != null;
};

var changeFirewallState = function() {
    var array = document.getElementsByTagName("image");
    var match = null;
    var i = 0;
    for(i = 0; i < array.length; i++){
        var href = array[i].getAttribute("href");
        match = href.match("firewall");
            if(match != null) {
               if (firewallInactived){
                array[i].setAttribute("href","/assets/firewallInact.png");
               }else{
                array[i].setAttribute("href","/assets/firewall.png");
               }
            }

    }
    return match != null;
};



var firewallConnectionsLimit = function(){
    var firewall = _controllerNetwork.getNetworkObject(INDEX_FIREWALL);
    return firewall.getAttrParam("connections_limit");
};

var buildInterfaces = function(amount){
    var i = 0;
    var interfaces = ["eth...", "lo"];
    for(i=0; i<amount; i++){
        interfaces.push("eth"+i);
    }
    return interfaces;
};

var optionsForInterface = function(interfaces, selected){
    var sel = "selected='selected' ";
    var html = "";
    $.each(interfaces, function(index, element){
        html += "<option value='" + element + "'";
        if(element == selected){
            html += sel;
        }
        html += "'>" + element + "</option>";
    });
    return html;
}

function roundf(numero, lugares_decimales){
    var p = Math.pow(10, lugares_decimales);
    return Math.round(numero * p) / p;
}