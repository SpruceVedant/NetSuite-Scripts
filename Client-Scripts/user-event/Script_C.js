/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([], function() {
    function afterSubmit(context) {
        log.debug('Script C - afterSubmit', 'After Submit event triggered in Script C');
    }

  

    return {
        afterSubmit: afterSubmit,
    };
});
