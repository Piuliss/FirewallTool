/**
 *@author Raul Benitez
 *@email raulbeni@gmail.com
 *
 * Super Class of object model
 */
function NetworkHardware (){
    var thiz    = this;
    var _connections_objects_list = {};
    var _connections_objects_length = 0;
    var _packagesAddedForSource = {};
    var _packageAddedForDestination = {};
    var _packageIds = "";
    var _attr_tooltip = [];
    DiagramObject.call(this);


    /* getters and setters */
    this.getConnectionList = function () {
        return _controllerConnections.getConnectionsCollectionByObj(this.getIndex());
    };
    this.setConnectionLimit = function (connections_limit){
        this.setAttrParam('connections_limit', connections_limit);
    };
    this.getConnectionsLimit = function () {
        return this.getAttrParam('connections_limit');
    };
    this.getAttrTooltip = function () {
        var attr = {};
        for(var i = 0; i < _attr_tooltip.length; i++){
            var key = _attr_tooltip[i];
            attr[key]= thiz.getAttrParam(key);
        }
        return attr;
    };
    this.setAttrTooltip = function (attr_tooltip) {
        _attr_tooltip = attr_tooltip;
    };

    /* METHODS UTILS*/
    this.addAttrTooltip = function (key){
        _attr_tooltip.push(key);
    }

    this.createConnectionFromMenuContext = function (){
        var firewall = _controllerNetwork.getFirewallAdded();
        if (firewall != null ){
            firewall.showEthPositions()
        }
        var connectionPoint = [];
        var svg = $('.main-plain');
        var elem_to_connect = $('.'+FOR_CONNECTING_CLASS);
        var r = thiz.getRaphael();
//        var controlFactory;
        svg.css('cursor','pointer');
        elem_to_connect.css('cursor','crosshair');
        var x = thiz.getPosX();
        var y = thiz.getPosY();
        var path = [["M", x, y], ["L", x, y]];
        var elem = thiz.getShape().node;
//        controlFactory = r.path(path).attr({stroke: "", "stroke-dasharray": ""});
        elem.classList.add("point-adding");
        connectionPoint.push(elem);
        svg.mousemove(function (ev) {
            var left   = ev.pageX - DELTA_LEFT;
            var top    = ev.pageY;
            path[1][1] = left;
            path[1][2] = top;
//            controlFactory.attr({path: path});
        });
        elem_to_connect.on('click',function(){
            var elem2 = this;
            var isAdding = elem2.classList.contains('point-adding');
            if(!isAdding){
                svg.off('mousemove');
                var pointB = elem2;
                var pointA = elem;
                pointA.classList.remove('point-adding');
//                controlFactory.remove();
                _controllerNetwork.createGraphicConnections(pointA, pointB);
                svg.css('cursor','cell');
                elem_to_connect.css('cursor','cell').off('click');
                elem_to_connect.css('cursor', 'move');
                if (firewall != null ){
                    firewall.hideEthPositions()
                }
            }

        });
        svg.bind("contextmenu",function(e) {
            e.preventDefault();
            svg.css('cursor','cell');
            elem_to_connect.css('cursor','cell').off('click');
            elem_to_connect.css('cursor', 'move');
            svg.off();
            if (firewall != null ){
                firewall.hideEthPositions()
            }

        });
    }

    /* ========================== CONNECTIONS METHODS ====================================*/

    this.existConnectionWithObj = function(obj){
        return _controllerConnections.checkExistConnection(this.getIndex(), obj.getIndex());
    };
    this.getConnectionsSize = function (){
        return this.getConnectionList().length;
    };
    this.deleteConnections = function () {
        _controllerConnections.removeAllConnectionOf(this.getIndex());
    };


    this.checkConnection = function(netObject){
        if(netObject instanceof  NetworkHardware){
            var length1 = this.getConnectionsSize();
            var length2 = netObject.getConnectionsSize();
            if(this.existConnectionWithObj(netObject) == true){
                return false;
            }else if(this.getConnectionsLimit() > length1 && netObject.getConnectionsLimit() > length2){
                return true;
            }else{
                /* add a logger*/
                console.log('This length = ' + length1 + ' and this limit is ' + this.getConnectionsLimit() );
                console.log('netObject length = ' + length2 + ' and netObject limit is ' + netObject.getConnectionsLimit() );
                return false;
            }
        }else {
            return false;
        }
    };
    /* =========================== ADD PACKAGES ========================= */

    this.addPackageToHashDestination = function (index, elem){
        _packageAddedForDestination[index] = elem;
    }

    this.addPackageIds = function (index){
        _packageIds += '#'+index+', ';
    }
    this.addPackageToHashSource = function (index, elem){
        _packagesAddedForSource[index] = elem;
    }
    this.getPackagesListForDestination = function () {
       return _packageAddedForDestination;
    }
    this.getPackagesList = function () {
        return _packagesAddedForSource;
    }

    this.updatePackagesPosition = function (x,y) {
        for(var key in _packagesAddedForSource){
            var package = _packagesAddedForSource[key];
            var x = parseFloat(x+ 20);
            var y = parseFloat(y - 15);
            var att = {x: x , y: y };
            package.getShape().attr(att);
            package.setPositions(x,y);
            package.updateNumberPosition(x,y)
        }

    }

    /* ========================== TOOLTIPS METHODS ====================================*/

    this.destroyTooltip = function () {
        var shape = thiz.getShape();
        $(shape.node).diagramTooltip({destroy: true});
    }
    this.addTooltipEvent = function (update) {
        var shape = thiz.getShape();
        var index = thiz.getIndex();
        $(shape.node).diagramTooltip({
            posX: thiz.getPosX(),
            posY: thiz.getPosY(),
            index: index,
            attrs: thiz.getAttrTooltip(),
            update: update
        });
    };


};
NetworkHardware.prototype = new DiagramObject();
/*re implement methods*/
NetworkHardware.prototype.init = function (raphael, type, attr_params, klass) {
    klass += ' '+ FOR_CONNECTING_CLASS;
    var index = DiagramObject.prototype.init.call(this, raphael, type, attr_params, klass);
    var thiz = this;
    this.addItemForContextMenu({label: i8n_label('com.menucontext.create_connection'),  icon:'/assets/context-menu-icons/network-ip-local.png', action: function() { $('.contextMenuPlugin').remove(); thiz.createConnectionFromMenuContext(); } });
    this.addItemForContextMenu({label: i8n_label('com.menucontext.delete_connections'),  icon:'/assets/context-menu-icons/cross-button.png', action: function() { $('.contextMenuPlugin').remove(); thiz.deleteConnections(); } });
    this.setConnectionLimit(attr_params['connections_limit']);
    this.addTooltipEvent(false);
    return index;
};

NetworkHardware.prototype.afterSubmitModalEvent = function (obj){
    DiagramObject.prototype.afterSubmitModalEvent.call(this,obj);
    /*update tooltip*/
    this.addTooltipEvent(true);
    /*update data on package sources*/
    var packages = this.getPackagesList();
    for(var k in packages){
        var pack = packages[k];
        pack.setSource(this);
    }
    /* update data package for destination*/
    var packages_destination = this.getPackagesListForDestination();
    for(var k in packages_destination){
        var pack = packages_destination[k];
        pack.setDestination(this);
    }

};
NetworkHardware.prototype.afterRemoveEvent = function () {
    DiagramObject.prototype.afterRemoveEvent.call(this);
};
NetworkHardware.prototype.afterMoveEvent = function (x, y, index) {
    DiagramObject.prototype.afterMoveEvent.call(this,x, y, index);
    //update tooltip
    this.addTooltipEvent(true);
    //update connection wire
    var r = this.getRaphael();
    var connections_shapes = _controllerConnections.getConnectionsShapesCollectionByObj(this.getIndex());
    for (var i = connections_shapes.length; i--;) {
        r.connection(connections_shapes[i]);
    }
    //update package position
    this.updatePackagesPosition(x,y);
};
NetworkHardware.prototype.remove = function () {
    this.deleteConnections();
    this.destroyTooltip();
    var listPackages = this.getPackagesList();
    for(var l in listPackages){
        var p = listPackages[l];
        _controllerNetwork.remove(p.getIndex());
    }
    DiagramObject.prototype.remove.call(this);
    delete this;
};
/* new methods to be overridden by the children of this class */
NetworkHardware.prototype.createConnection = function(objB){
    var objA = this;
    var ready;
    if(objA === null || objB === null) return false;
    if(objA.checkConnection(objB)){
        ready = _controllerConnections.addConnection(objA, objB);
        if(ready === true){
            objA.afterCreateConnection(objB);
            objB.afterCreateConnection(objA);
        }
        return ready;
    }
    return false;
};
NetworkHardware.prototype.addPackageForDestination = function (elem) {
    elem.setDestination(this);
    var index = elem.getIndex();
    this.addPackageToHashDestination(index, elem);
};
NetworkHardware.prototype.getIP = function () {
    console.log('getIP() not implemented')
    return null;
};
NetworkHardware.prototype.setIp = function(ip){
    console.log('setIP() not implemented')
}

NetworkHardware.prototype.afterCreateConnection = function (obj_relation ){
};
NetworkHardware.prototype.getMaskIp = function (){
    console.log('getMaskIp() not implemented');
    return null;
};
NetworkHardware.prototype.setMaskIp = function (mask_ip){
    console.log('setMaskIp() not implemented');
};
NetworkHardware.prototype.addPackageForOrigin = function (elem) {
    elem.setSource(this);
    var index = elem.getIndex();
    this.addPackageToHashSource(index,elem);
    this.addPackageIds (index);
};
