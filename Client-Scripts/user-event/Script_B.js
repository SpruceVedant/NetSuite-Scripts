/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([], function() {
    function beforeLoad(context) {
        log.debug('Script B - beforeLoad', 'Before load event triggered in Script B');
    }

    function beforeSubmit(context) {
       log.debug('Script B - beforeSubmit', 'Before Submit event triggered in Script B');
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };
});
// Isolated scripts to check trigger points