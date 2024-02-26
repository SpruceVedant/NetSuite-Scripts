/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/log'], function(record, log) {
    function onRequest(context) {
        try {
            // Extract data from the request parameters
            var customerId = context.request.parameters.customer;
            var itemId = context.request.parameters.item;
            var quantity = context.request.parameters.quantity;

            // Create a sales order record
            var salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });

            // Set fields on the sales order record
            salesOrder.setValue({
                fieldId: 'entity',
                value: customerId
            });

            // Add items to the sales order
            salesOrder.selectNewLine({
                sublistId: 'item'
            });
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: itemId
            });
            salesOrder.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: quantity
            });
            salesOrder.commitLine({
                sublistId: 'item'
            });

            // Save the sales order
            var salesOrderId = salesOrder.save();

            log.debug({
                title: 'Sales Order Created',
                details: 'Sales Order ID: ' + salesOrderId
            });

            // Redirect to a confirmation page or perform other actions as needed

        } catch (error) {
            log.error({
                title: 'Error',
                details: error
            });
        }
    }

    return {
        onRequest: onRequest
    };
});
