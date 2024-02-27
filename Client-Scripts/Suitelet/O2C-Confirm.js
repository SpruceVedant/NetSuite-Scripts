/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/ui/serverWidget'], 
    function(log, record, serverWidget) {

    function onRequest(context) {
        try {
           
            var salesOrderId = context.request.parameters.orderId;

            var salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: salesOrderId,
                isDynamic: true,
            });

           
            var form = serverWidget.createForm({
                title: 'Order Confirmation'
            });

            var messageField = form.addField({
                id: 'confirmation_message',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Confirmation Message',
            });

            messageField.defaultValue = 'Sales Order Created Successfully. ID: ' + salesOrderId;

            context.response.writePage(form);
        } catch (error) {
            log.error({
                title: 'Error',
                details: error
            });

           
            context.response.write('Error: ' + error);
        }
    }

    return {
        onRequest: onRequest
    };
});
