$.fn.diagramTooltip = function (options) {

    createTip = function (options) {
        var attrs = options['attrs'];
        var inner = '';
        for(var k in attrs){
            var label = i8n_modal_labels(k) || k;
            inner += "<div class='wrap-data-"+k+"'>" +
                        "<span>"+ label +": </span>"+
                        "<span class='content'>"+ attrs[k]+"</span>" +
                      "</div>";
        }
        var tTip = "<div style='position: absolute; left:"+options['posX']+"px; top:"+options['posY']+"px;' class='tooltip fade top in tooltip-info' data-index='"+options['index']+"'>" +
//                "<div class='arrow-up'></div>" +
                "<div class='tooltip-inner'>" + inner  +
                "</div>" +
            "</div>";
        return tTip;
    };

    updateTip = function (options){
        var tooltip = $(".tooltip-info[data-index='"+options['index']+"']");
        tooltip.css({ 'position': 'absolute', left: options['posX']+'px', top: options['posY']+'px'   });
        for(var k in options['attrs']){
            tooltip.find('.tooltip-inner .wrap-data-'+k+' span.content').html(options['attrs'][k]);
        }


    };
    destroyTooltip = function (options){
        var tooltip = $(".tooltip-info[data-index='"+options['index']+"']");
        tooltip.remove();
    }
    $(this).each(function(){
        var $this = $(this);
        options['index'] = $this.data('index');
        options['posX'] = parseFloat(options['posX']) + 75;
        options['posY'] = parseFloat(options['posY']) + 35;

        if(options['update']===true){
            updateTip(options);
        }else if (options['destroy'] === true) {
            destroyTooltip(options);
        }
        else{
            $("body #holder").prepend(createTip(options));
        }


    });
    /* Setup the options for the tooltip that can be
     accessed from outside                      */

//    var defaults = {
//        speed: 200,
//        delay: 300
//    };
//
//    var options = $.extend(defaults, options);
//
////    <div class="tooltip fade top in" style="top: 161px; left: 399.71875px; display: block;">
////        <div class="tooltip-arrow"></div>
////        <div class="tooltip-inner">Esto es un title</div>
////    </div>
//    getTip = function() {
//        var tTip =
//            "<div class='tooltip fade top in'>" +
//                "<div class='tooltip-arrow'>"+
//                "</div>" +
//                "<div class='tooltip-inner'></div>" +
//                "</div>";
//        return tTip;
//    }
//    $("body").prepend(getTip());
//
//    /* Give each item with the class associated with
//     the plugin the ability to call the tooltip    */
//    $(this).each(function(){
//
//        var $this = $(this);
//        var tip = $('.tooltip');
//        var tipInner = $('.tooltip .tooltip-inner');
//
//        var tTitle = $this.attr('title');
//        this.title = "";
//
//        var offset = $(this).offset();
//        var tLeft = offset.left;
//        var tTop = offset.top;
//        var tWidth = $this.width();
//        var tHeight = $this.height();
//
//        /* Mouse over and out functions*/
//        $this.hover(function() {
//                tipInner.html(tTitle);
//                setTip(tTop, tLeft);
//                setTimer();
//            },
//            function() {
//                stopTimer();
//                tip.hide();
//            }
//        );
//
//        /* Delay the fade-in animation of the tooltip */
//        setTimer = function() {
//            $this.showTipTimer = setInterval("showTip()", defaults.delay);
//        }
//
//        stopTimer = function() {
//            clearInterval($this.showTipTimer);
//        }
//
//        /* Position the tooltip relative to the class
//         associated with the tooltip                */
//        setTip = function(top, left){
//            var topOffset = tip.height();
//            var xTip = (left-30)+"px";
//            var yTip = (top-topOffset-10)+"px";
//            tip.css({'top' : yTip, 'left' : xTip});
//        }
//
//        /* This function stops the timer and creates the
//         fade-in animation                          */
//        showTip = function(){
//            stopTimer();
//            tip.animate({ "opacity": "toggle"}, defaults.speed);
//        }
//    });



};