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
    /**
 * Delete an entire Sales Order or a specific item from the Sales Order (DELETE)
 */
function deleteSalesOrder(params) {
    log.debug('Delete Sales Order Query Params (DELETE)', JSON.stringify(params));

    try {
        // Validate salesOrderId
        if (!params.salesOrderId || isNaN(parseInt(params.salesOrderId))) {
            log.error('Invalid Sales Order ID (DELETE)', 'Sales Order ID is missing or invalid: ' + params.salesOrderId);
            throw error.create({
                name: 'INVALID_SALES_ORDER_ID',
                message: 'Invalid Sales Order ID provided: ' + params.salesOrderId
            });
        }

        // Check if the itemId is provided
        if (params.itemId && !isNaN(parseInt(params.itemId))) {
            // If itemId is provided, delete the specific item from the Sales Order
            log.debug('Deleting specific item from Sales Order (DELETE)', 'Item ID: ' + params.itemId);

            var salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: params.salesOrderId,
                isDynamic: true
            });

            var itemFound = false;
            var lineCount = salesOrder.getLineCount({ sublistId: 'item' });

            // Loop through items to find the one to delete
            for (var i = 0; i < lineCount; i++) {
                var existingItemId = salesOrder.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });

                // If the item ID matches, remove the line
                if (parseInt(existingItemId) === parseInt(params.itemId)) {
                    log.debug('Deleting Item Line (DELETE)', 'Item ID: ' + params.itemId + ' at line: ' + i);
                    salesOrder.removeLine({ sublistId: 'item', line: i });
                    itemFound = true;
                    break;
                }
            }

            if (!itemFound) {
                log.error('Item Not Found (DELETE)', 'Item ID: ' + params.itemId + ' not found in Sales Order ID: ' + params.salesOrderId);
                throw error.create({
                    name: 'ITEM_NOT_FOUND',
                    message: 'Item ID ' + params.itemId + ' not found in Sales Order ID ' + params.salesOrderId
                });
            }

            // Save the Sales Order after removing the item line
            var updatedSalesOrderId = salesOrder.save();
            log.debug('Sales Order Updated After Item Deletion (DELETE)', 'Updated Sales Order ID: ' + updatedSalesOrderId);

            return { status: 'success', salesOrderId: updatedSalesOrderId, deletedItemId: params.itemId };

        } else {
            // If no itemId is provided, delete the entire Sales Order
            log.debug('Deleting entire Sales Order (DELETE)', 'Sales Order ID: ' + params.salesOrderId);

            var deletedSalesOrderId = record.delete({
                type: record.Type.SALES_ORDER,
                id: params.salesOrderId
            });

            log.debug('Sales Order Deleted (DELETE)', 'Deleted Sales Order ID: ' + deletedSalesOrderId);

            return { status: 'success', deletedSalesOrderId: deletedSalesOrderId };
        }

    } catch (e) {
        log.error('Error in Sales Order Deletion (DELETE)', e.message);
        return error.create({
            name: 'SALES_ORDER_DELETE_ERROR',
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
