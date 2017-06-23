/**
 * Trabajo Final de Grado - FirewallTool
 * Universidad Nacional de Itapua
 * Facultad de Ingenieria.
 * User: Raul Benitez Netto
 * Date: 18/01/14
 * Time: 16:21
 */
function NormalPackage(){
    Package.call(this, NORMAL_PACKAGE);
}
NormalPackage.prototype = new Package();
NormalPackage.prototype.init = function (raphael, attr_params) {
    delete attr_params['amount'];
    attr_params['simulation_type'] = SIMPLE_SIMULATION;
    attr_params['pre_configured_type'] = false;
    var index = Package.prototype.init.call(this,raphael, attr_params);
    this.setType(NORMAL_PACKAGE);
    return index;
};
