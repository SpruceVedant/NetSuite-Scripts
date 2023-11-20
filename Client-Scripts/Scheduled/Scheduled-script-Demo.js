/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define([], function() {
    function execute(context) {
        log.debug({
            title: 'Scheduled Script Execution',
            details: 'Scheduled script executed successfully.'
        });
    }

    return {
        execute: execute
    };
});
