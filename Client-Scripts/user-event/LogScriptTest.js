/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([], function() {
    function beforeLoad(context) {
        log.debug('Event Type', 'Executing beforeLoad event');
    }

    function beforeSubmit(context) {
        log.debug('Event Type', 'Executing beforeSubmit event');
    }

    function afterSubmit(context) {
        log.debug('Event Type', 'Executing afterSubmit event');
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});
