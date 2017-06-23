function ListenerChangesController (graphic_network_id) {
    var _flag_changed = false;
    var _graphic_network_id = graphic_network_id;
    var _show_alert = false;
    this.setChange = function (){
        _flag_changed = true;
        if((_graphic_network_id !== 'null' || _graphic_network_id != null || _graphic_network_id != '') && _show_alert){
            this.showAlertOfChange();
            this.disabledBtnRun();
        }
    }
    this.removeChange = function (){
        _flag_changed = false;
    }
    this.showAlertOfChange = function () {
        $('#alert-changes-section').show();

    }
    this.disabledBtnRun = function (){
        $('#btn-run-simulation').attr('disabled', true);
    }
    this.activeAlert = function (){
        _show_alert = true;
    };
    this.inactiveAlert = function (){
        _show_alert = false;
    };
    this.setGraphicNetworkId = function(gn_id){
        _graphic_network_id = gn_id;
    }

};
