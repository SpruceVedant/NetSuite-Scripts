/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/ui/serverWidget', 'N/url'], 
    function(log, record, serverWidget, url) {

    function createSalesOrder(customerId, itemId, quantity) {
        // Create a new sales order
        var salesOrder = record.create({
            type: record.Type.SALES_ORDER,
            isDynamic: true,
        });

        // Set customer on the sales order
        salesOrder.setValue({
            fieldId: 'entity',
            value: customerId,
        });

        // Add item to the sales order
        salesOrder.selectNewLine({
            sublistId: 'item'
        });
        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: itemId,
        });
        salesOrder.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: quantity,
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

        return salesOrderId;
    }

    function onRequest(context) {
        try {
            // Get parameters from the request
            var customerId = context.request.parameters.customer;
            var itemId = context.request.parameters.item;
            var quantity = context.request.parameters.quantity;

            // Create a sales order
            var salesOrderId = createSalesOrder(customerId, itemId, quantity);

            // Redirect to confirmation page
            var confirmationUrl = url.resolveScript({
                scriptId: 'customscript_confirmation_suitelet',
                deploymentId: 'customdeploy_confirmation_suitelet',
                params: {
                    orderId: salesOrderId
                }
            });

            context.response.sendRedirect({
                type: url.RedirectType.SUITELET,
                identifier: 'customscript_confirmation_suitelet',
                deploymentId: 'customdeploy_confirmation_suitelet',
                parameters: {
                    orderId: salesOrderId
                }
            });
        } catch (error) {
            log.error({
                title: 'Error',
                details: error
            });

            // Display error message
            context.response.write('Error: ' + error);
        }
    }

    return {
        onRequest: onRequest
    };
});
