function Wire (objA, objB, shape_connection) {
    var _objA = objA;
    var _objB = objB;
    var _key;
    var _shape_connection = shape_connection;
    this.remove = function () {
        _shape_connection.line.remove();
        _objA = null;
        _objB = null;
    }

    this.setHashKey = function (hk){
        _key =hk;
    }
    this.getHashKey = function () {
        return _key;
    }
    this.getObjA = function () {
        return _objA;
    };
    this.getObjB = function () {
        return _objB;
    };
    this.getShapeConnection = function (){
        return _shape_connection;
    }

    this.setObjA = function (objA){
        _objA = objA;
    };
    this.setObjB = function (objB){
        _objB = objB;
    };
};