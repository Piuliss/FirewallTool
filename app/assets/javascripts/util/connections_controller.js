function ConnectionsController (raphael) {
    var _connections_wires_collection = {};
    var _connections_relations_by_objs = {};
    var _raphael = raphael;

    this.addConnection = function (objA, objB) {
        if( objA instanceof NetworkHardware && objB instanceof NetworkHardware){
            _listenerController.setChange();
            var indexA              = objA.getIndex();
            var indexB              = objB.getIndex();
            if(!this.checkExistConnection(indexA,indexB) ){
                var elemPointA          = objA.getShape();
                var elemPointB          = objB.getShape();
                var connection_shape    = _raphael.connection(elemPointA, elemPointB, "#000");
                var wire                = new Wire(objA, objB, connection_shape );
                addConnectionWireToCollection(indexA, indexB, wire);
                return true;
            }else{
                console.log('Falla de Conexion!. Ya existe una conexion entre ' + objA.getName() + ' y ' + objB.getName());
                return false;
            }
        }else{
            console.log('Falla de Conexion!. No son objectos compatibles para un conexion ');
            return false;
        };
    };

    this.removeConnection = function (indexA, indexB) {
        var wire = getConnectionWireToCollection(indexA, indexB);
        var key = wire.getHashKey();
        wire.remove();
        _connections_wires_collection[key] = null;
        _connections_relations_by_objs[indexA][indexB] = false;
        _connections_relations_by_objs[indexB][indexA] = false;
        delete _connections_relations_by_objs[indexA][indexB];
        delete _connections_relations_by_objs[indexB][indexA];
        delete _connections_wires_collection[key];
    };
    this.removeAllConnectionOf = function (index_obj) {
        for(var k in _connections_relations_by_objs[index_obj]){
            var indexB = k;
            this.removeConnection(index_obj, indexB);
        }
        _connections_relations_by_objs[index_obj] = {};
        delete _connections_relations_by_objs[index_obj];
    };

    this.getConnectionsCollection = function (){
        var connections = [];
        for(var k in _connections_wires_collection){
            var wire = _connections_wires_collection[k];
            connections.push(wire);
        }
        return connections;
    }

    this.getConnectionsShapesCollectionByObj = function (index_obj){
        var connections = [];
        for(var k in _connections_relations_by_objs[index_obj]){
            var indexB = k;
            var wire = getConnectionWireToCollection(index_obj,indexB);
            connections.push(wire.getShapeConnection());
        }
        return connections;
    };

    this.getConnectionsCollectionByObj = function(index_obj) {
        var connections = [];
        for(var k in _connections_relations_by_objs[index_obj]){
            var indexB = k;
            var wire = getConnectionWireToCollection(index_obj,indexB);
            connections.push(wire);
        }
        return connections;

    };


    this.checkExistConnection = function (indexA, indexB) {
        var params = [indexA, indexB];
        var index =  createHash(params);
        return _connections_wires_collection[index] != null;
    };

    this.clear = function () {
        _connections_wires_collection = {};
        _connections_relations_by_objs = {};
    }

    var addConnectionWireToCollection = function (indexA, indexB, wire){
        var key =  createHash([indexA,indexB]);
        wire.setHashKey(key);
        if(typeof _connections_relations_by_objs[indexA] === 'undefined' ) _connections_relations_by_objs[indexA] = {};
        if(typeof _connections_relations_by_objs[indexB] === 'undefined') _connections_relations_by_objs[indexB] = {};
        _connections_relations_by_objs[indexA][indexB] = true;
        _connections_relations_by_objs[indexB][indexA] = true;
        _connections_wires_collection[key] = wire;
    };
    var getConnectionWireToCollection = function (indexA, indexB){
        var key =  createHash([indexA,indexB]);
        return _connections_wires_collection[key];
    };

//    var createHash = function (params)  {
//        var h=0, i=0;
//        if(typeof (params) === "string") {
//            for(i=0; i<params.length; i++) {
//                h = (h * 31 + params.charCodeAt(i)) & 0xffffffff;
//            }
//        }
//        else if( params instanceof Array) {
//            for(i in params) {
//                h ^= createHash(params[i]);
//            }
//        }
//        return h;
//    };
    var createHash = function (params)  {
        var params = params.sort();
        var h = 0;
        var node = "";
        for(var i=0; i<params.length; i++){
            node = node + params[i];
        }
        for(var x=0; x<node.length; x++){
            char = node.charCodeAt(x);
            h  =  ((h<<5)-h)+char;
            h & h; // Convert to 32bit integer
        }
        return h;
    };

    this.clear = function () {
       _connections_wires_collection = {};
      _connections_relations_by_objs = {};

    }
};
