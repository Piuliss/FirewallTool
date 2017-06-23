/**
 * Trabajo Final de Grado - FirewallTool
 * Universidad Nacional de Itapua
 * Facultad de Ingenieria.
 * User: Raul Benitez Netto
 * Date: 18/01/14
 * Time: 16:21
 */
function AttackPackage(){
    Package.call(this, ATTACK_PACKAGE);
    this.setAmount = function (amount) {
        this.setAttrParam('amount',amount);
    }
    this.getAmount = function () {
        return this.getAttrParam('amount');
    };
}
AttackPackage.prototype = new Package();
AttackPackage.prototype.init = function (raphael, attr_params) {
    if ( attr_params['amount'] === undefined || attr_params['amount'] === '' || attr_params['amount'] === null) attr_params['amount'] = 2;
    attr_params['pre_configured_type'] = false;
    attr_params['simulation_type'] = ATTACK_SIMULATION;
    var index = Package.prototype.init.call(this,raphael, attr_params);
    this.setType(ATTACK_PACKAGE);
    return index
};