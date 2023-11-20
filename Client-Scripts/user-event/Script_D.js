/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([], function() {
    function beforeSubmit(context) {
        log.debug('Script D - beforeSubmit', 'Before Submit event triggered in Script D');
    }

    function afterSubmit(context) {
        log.debug('Script D - afterSubmit', 'After Submit event triggered in Script D');
    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});
