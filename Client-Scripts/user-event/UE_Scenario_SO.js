/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/ui/message', 'N/error'],

function(record, log, message, error) {

    function beforeSubmit(context) {
        var newRecord = context.newRecord;
        var salesOrderAmount = parseFloat(newRecord.getValue({
            fieldId: 'total'
        }));

        if (salesOrderAmount >= 1000 && salesOrderAmount <= 5000) {
            
            var confirmMessage = message.create({
                title: 'Warning',
                message: 'Sales Order amount is between 1000 and 5000. Do you want to proceed?',
                type: message.Type.CONFIRM
            });

            confirmMessage.show();

            confirmMessage
                .promise
                .then(function(result) {
                    if (result) {
                        return;
                    } else {
                        context.cancel = true;
                        return;
                    }
                });
        }
		
        if (salesOrderAmount > 5000) {
           
            var errorMessage = 'Need approval to save this sales order.';
            var messageOptions = {
                title: 'Error',
                message: errorMessage,
                type: message.Type.ERROR
            };

            message.create(messageOptions);
            context.cancel = true;

            log.error({
                title: 'Sales Order Save Error',
                details: errorMessage
            });

            throw error.create({
                name: 'SALES_ORDER_SAVE_ERROR',
                message: errorMessage
            });
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
})
