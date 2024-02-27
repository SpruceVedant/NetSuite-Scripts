/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record'],
    function(log, record) {

    function afterSubmit(context) {
        try {
            if (context.type === context.UserEventType.CREATE) {
                var salesOrderId = context.newRecord.id;

                log.audit({
                    title: 'Sales Order Created',
                    details: 'Sales Order ID: ' + salesOrderId
                });
            }
        } catch (error) {
            log.error({
                title: 'Error',
                details: error
            });
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
