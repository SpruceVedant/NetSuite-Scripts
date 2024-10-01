/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record', 'N/log'], function(record, log) {

    /**
     * Fetch Sales Order Data (GET)
     */
    function getSalesOrderData(params) {
        log.debug('Fetching Sales Order Data (GET)', JSON.stringify(params));

        try {
            // Validate salesOrderId
            if (!params.salesOrderId || isNaN(parseInt(params.salesOrderId))) {
                log.error('Invalid Sales Order ID (GET)', 'Sales Order ID is missing or invalid: ' + params.salesOrderId);
                throw error.create({
                    name: 'INVALID_SALES_ORDER_ID',
                    message: 'Invalid Sales Order ID provided: ' + params.salesOrderId
                });
            }

            // Load the Sales Order record
            log.debug('Loading Sales Order (GET)', 'Sales Order ID: ' + params.salesOrderId);
            var salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: params.salesOrderId
            });

            // Prepare the response data
            var responseData = {
                id: salesOrder.id,
                entity: salesOrder.getValue({ fieldId: 'entity' }),
                location: salesOrder.getValue({ fieldId: 'location' }),
                currency: salesOrder.getValue({ fieldId: 'currency' }),
                items: []
            };

            var lineCount = salesOrder.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < lineCount; i++) {
                responseData.items.push({
                    itemId: salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }),
                    quantity: salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                    rate: salesOrder.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i })
                });
            }

            log.debug('Sales Order Data Fetched (GET)', JSON.stringify(responseData));
            return responseData;

        } catch (e) {
            log.error('Error Fetching Sales Order Data (GET)', e.message);
            return error.create({
                name: 'SALES_ORDER_FETCH_ERROR',
                message: e.message
            });
        }
    }

    // RESTlet entry points for GET, POST, PUT, DELETE
    return {
        get: getSalesOrderData,    // GET - Fetch Sales Order Data
        post: createSalesOrder,    // POST - Create Sales Order
        put: updateSalesOrder,     // PUT - Update Sales Order
        delete: deleteSalesOrder   // DELETE - Delete Sales Order or Item
    };

});
