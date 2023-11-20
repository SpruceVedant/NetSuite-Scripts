/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime'], function(runtime) {
    function beforeLoad(scriptcontext) {
        var executionContext = runtime.executionContext;
        log.debug('Execution Context', 'Current execution context: ' + executionContext);
    }

    function afterSubmit(scriptcontext) {
        var executionContext = runtime.executionContext;
        log.debug('Execution Context', 'Current execution context: ' + executionContext);
    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
});
