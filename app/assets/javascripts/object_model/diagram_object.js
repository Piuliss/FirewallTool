/**
 *@author Raul Benitez
 *@email raulbeni@gmail.com
 *
 * Super Class of object model
 */
function DiagramObject (){
    var thiz = this;
    var _attribute_params, _type, _id, _index, _posX, _posY, _raphael, _src, _shape, _class;
    var _block_attr = ['id','posX','posY','type', 'created_at', 'updated_at', 'graphic_network_id'];
    var _items_for_context_menu = [{label: i8n_label('com.menucontext.remove_obj'),  icon:'/assets/context-menu-icons/cross.png',           action: function() { $('.contextMenuPlugin').remove(); thiz.remove(); } },
                                    null/* divider */ ];
    var init = function (raphael, type, id, posY, posX, attr_params){
        _attribute_params = attr_params ;
        _type = type;
        _id   = id;
        _posY = parseFloat(posY);
        _posX = parseFloat(posX);
        _raphael = raphael;
        _index = attr_params['index'] || type.toLowerCase() + '-' + _id;
        _src = COMPONENTS_IMAGES_SRC[thiz.getType()];
        createSvgObjectOnDiagram();
        thiz.afterCreateObject();
        return _index;
    };
    this.initialize = function (raphael, type, attr_params, klass) {
        _class = klass;
        _attribute_params = attr_params || DEFAULT_ATTR_PARAMS[type];
        return init(raphael, type, _attribute_params['id'], _attribute_params['posY'], _attribute_params['posX'], _attribute_params);
    };


    var createSvgObjectOnDiagram = function (){
        var r = thiz.getRaphael();
        var x = thiz.getPosX();
        var y = thiz.getPosY();
        var shape = r.image(_src, x, y, IMAGE_WIDTH,IMAGE_HEIGHT);
        var color = Raphael.getColor();
        shape.attr({id: 'tt',fill: color, stroke: color, "fill-opacity": 0, "stroke-width": 2, cursor: "move"});
        addSvgDragEvent(shape);
        var index = thiz.getIndex();
        shape.node.id = index;
        shape.node.setAttribute('class', thiz.getClass());
        var componentObj = $(shape.node);
        componentObj.attr('data-index',index);
        /*add double click event to each*/
        shape.dblclick(openModal);
        thiz.setShape(shape);
        addContextMenuEvent();


    };
    var openModal = function () {
            var index = thiz.getIndex();
            var modal = $('#modal-' +index);
            if(modal.length) modal.remove();
            $('#modal-section').append(thiz.createModal());
            modal = $('#modal-' +index);
            modal.modal('show');
            thiz.addModalEvents(modal);

    };

    this.createModal = function(){
        var index = this.getIndex();
        var html = '';
        var type = thiz.getType();
        var form_inputs = this.createForm();
        html = '<div id="modal-'+index+'" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
        html += '<form class="form-horizontal" data-index="'+index+'" >';
        html += '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button> ' +
                    '<h3 id="myModalLabel">' + thiz.name() + ' Form:</h3>' +
                '</div>';
        html += '<div class="modal-body">'+form_inputs+'</div>';
        html +='<div class="modal-footer">' +
                    '<a class="btn btn-warning btn-delete" value="remove" data-index="'+ index+'">Remove</a>' +
                    '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>' +
                    '<input type="submit" class="btn btn-primary btn-save" data-type="'+type+'" value= "Save Changes"/>' +
               '</div>';
        html += '</div>';
        html += '</form>';
        return html;
    };

    var addContextMenuEvent = function () {
        $(thiz.getShape().node).contextPopup({
            title: 'Menu ' + thiz.getType(),
            items: thiz.getItemsForContextMenu()
        });

    };


    /* SETTERS and GETTERS*/
    this.setItemsForContextMenu = function (items)  {
        _items_for_context_menu = items;
    };
    this.getItemsForContextMenu = function ()       {
        return _items_for_context_menu;
    };
    this.addItemForContextMenu  = function (item)   {
        _items_for_context_menu.push(item);
    };

    this.addItemsForContextMenu = function (items)  {
        for(var i in items){
            var item = items[i];
            thiz.addItemForContextMenu(item);
        }
    };
    this.setShape = function (shape) {
        _shape = shape;
    };
    this.getShape = function (){
        return _shape;
    }
    this.setAttributes = function(params){
        this.setPosX(params['posX'] || 0);
        this.setPosY(params['posY'] || 0);
        this.setId(params['id'] || 0);
        _attribute_params = params;
    };
    this.getAttributes = function (){
        _attribute_params['id'] = this.getId();
        _attribute_params['posX'] = this.getPosX();
        _attribute_params['posY'] = this.getPosY();
        return _attribute_params;
    };
    this.getAttrParam = function (key){
        return _attribute_params[key];
    }
    this.setAttrParam = function (key, value){
        _attribute_params[key] = value;
    };
    this.setRaphael = function (raphael){
        _raphael = raphael;
    }
    this.getRaphael = function () {
        return _raphael;
    };
    this.setType = function(type){
        _type = type;
    };
    this.getType = function () {
        return _type;
    }
    this.setPosY = function(y){
        _posY = y;
    };
    this.getPosY = function () {
        return _posY;
    };
    this.setPosX = function(x){
        _posX =  x;
    };
    this.getPosX = function () {
        return _posX;
    };
    this.setIndex = function (index) {
        _index = index;
    }
    this.getIndex = function () {
        return _index;
    }
    this.setId = function (id) {
        _id = id; 
    }
    this.getId = function () {
        return _id;
    };


    this.getBlockAttr = function () {
        return _block_attr;
    };

    this.getClass = function () { return _class;}
    this.setClass = function (klass) { _class = klass;};
    this.setClassToShape = function (klass) {
        _class = klass;
        this.getShape().node.setAttribute('class',_class);
    }
    this.addClassToShape = function (klass) {
        _class += ' '+klass;
        this.getShape().node.setAttribute('class',_class);
    }

     /*UTILS METHODS*/
    this.setPos = function(x,y){
        this.setPosX(x);
        this.setPosY(y);
    };
    this.addBlockAttrs = function (block_attrs){
        block_attrs.forEach( function(block_attr) {
            _block_attr.push(block_attr);
        });
    };
    this.addBlockAttr = function (block_attr){
        _block_attr.push(block_attr);
    };
    this.getSrc = function (){
        return _src;
    };
    this.removeObj = function () {
        thiz.getShape().remove();
        _controllerNetwork.remove(thiz.getIndex());
    };

    /*EVENTS METHODS*/
    /* Assign event to modal */
    this.addModalEvents = function (modal){
        addSubmitEvent(modal);
        addRemoveEvent();
        modal.find('form').validationEngine('attach');

    }
    var addSubmitEvent = function(modal){
        modal.find('form').submit(function(ev){
            ev.preventDefault();
            var elem        = $(this);
            if(elem.validationEngine('validate')){
                var form_data = elem.serializeObject();
                for(var k in form_data){
                    var value = form_data[k];
                    if(value != ''){
                        thiz.setAttrParam(k, value);
                    }

                };
                modal.modal('hide');
                thiz.afterSubmitModalEvent(thiz);
            }
;
        });
    }
    var addRemoveEvent = function () {
        $(".btn-delete").on('click',function () {
            var modal = $('#modal-' + thiz.getIndex());
            thiz.remove(modal);
            modal.modal('hide');
            modal.remove();

        });
    };

     /* Assign event to elem SVG DOM*/
    var addSvgDragEvent = function(elem){
        elem.drag(move, dragger, up);
    };
    /*
     * set methods for draggable events
     *
     */
    var _active_circle;
    var dragger = function () {
        var x = parseFloat(this.attr("x"));
        var y = parseFloat(this.attr("y"));
        this.ox = x;
        this.oy = y;
        if(_active_circle  == null) _active_circle = _raphael.circle(x+16,y+16,24).attr({stroke: 'blue'});

    };
    var move = function (dx, dy) {
        var elem    = this;
        var r       = thiz.getRaphael();
        var index   = elem.node.getAttribute('data-index');
        var x       = parseFloat(elem.ox) + parseFloat(dx);
        var y       = parseFloat(elem.oy) + parseFloat(dy);
        if((x >= 22 && y>=0) && ( y <= HOLDER_HEIGHT - 80 && x <= HOLDER_WIDTH-45 ) ){
            var att     = {x: parseFloat(x), y: parseFloat(y)} ;
            elem.attr(att);
            thiz.afterMoveEvent(x,y,index);
            var att_circle = {cx: parseFloat(thiz.getPosX()) + 16, cy: parseFloat(thiz.getPosY()) + 16};
            _active_circle.attr(att_circle);
            r.safari();

        }

    };
    var up = function () {
        if(_active_circle!= null) {
            _active_circle.remove();
        }

        _active_circle = null;
//        this.animate({"fill-opacity": 0}, 500);

    };

    this.getActiveCircle = function (){
        return _active_circle;
    }

    this.name = function () {
        return _type;
    }
};
DiagramObject.prototype.createForm = function(){
    var html = '';
    var i = 0;
    var attrs = this.getAttributes();
    var block_attr = this.getBlockAttr();
    var type = this.getType();
    for(var key in attrs){
        if ($.inArray(key, block_attr ) <= -1){
            var label = i8n_modal_labels(key) || key
            var klass_validation = key.indexOf('ip') > -1 ? 'validate[custom[ipv4]] numeric' : ''
            html += '<div class="control-group">' +
                '<label class="control-label" for="input-'+i+'">'+label+'</label>'+
                '<div class="controls"><input type="text" name="'+key+'" class="'+klass_validation+
                '" id="input-'+i+'" maxlength="26" value="'+ this.getAttrParam(key) +'" data-type="'+type+
                '"/></div> ' +
                '</div>';
            i++;
        }
    }
    return html;
};
DiagramObject.prototype.setAttributeParams = function(params){
    this.setAttributes(params);
};
DiagramObject.prototype.getAttributeParams = function(){
    return this.getAttributes();
};

DiagramObject.prototype.remove = function () {
    var ac = this.getActiveCircle();
    if(ac != null) ac.remove();
   this.removeObj();
   this.afterRemoveEvent();
}
DiagramObject.prototype.afterCreateObject = function (){
    /*re-implement*/
}
DiagramObject.prototype.afterRemoveEvent = function (){
    _listenerController.setChange();
}
DiagramObject.prototype.setPositions = function(x,y){
    this.setPos(x,y);
}
DiagramObject.prototype.afterMoveEvent = function (x, y, index){
    this.setPos(x,y);
}
DiagramObject.prototype.afterSubmitModalEvent = function (obj){
    _listenerController.setChange();
};
DiagramObject.prototype.init = function (raphael, type, attr_params, klass) {
   return this.initialize(raphael, type, attr_params, klass)
};