/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/record', 'N/search'], function(record, search) {

    function doGet(requestParams) {

        try {
            var salesOrderId = requestParams.salesOrderId;
            var salesOrderRecord = record.load({
                type: record.Type.SALES_ORDER,
                id: salesOrderId
            });

            return {
                status: 'success',
                data: salesOrderRecord
            };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    }

    function doPost(requestBody) {
        // Create a new sales order
        try {
            var salesOrderRecord = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });

           
            salesOrderRecord.setValue({
                fieldId: 'entity',
                value: requestBody.customerId
            });

      
            salesOrderRecord.selectNewLine({ sublistId: 'item' });
            salesOrderRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: requestBody.itemId
            });
            salesOrderRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: requestBody.quantity
            });
            salesOrderRecord.commitLine({ sublistId: 'item' });

            var salesOrderId = salesOrderRecord.save();

            return {
                status: 'success',
                data: { salesOrderId: salesOrderId }
            };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    }

    // function doPut(requestBody) {
    //     try {
    //         var salesOrderId = requestBody.salesOrderId;
    //         var salesOrderRecord = record.load({
    //             type: record.Type.SALES_ORDER,
    //             id: salesOrderId
    //         });

    //         salesOrderRecord.setValue({
    //             fieldId: 'memo',
    //             value: requestBody.memo
    //         });

    //         salesOrderRecord.save();

    //         return {
    //             status: 'success',
    //             message: 'Sales order updated successfully'
    //         };
    //     } catch (e) {
    //         return { status: 'error', message: e.message };
    //     }
    // }

    function doDelete(requestParams) {
        try {
            var salesOrderId = requestParams.salesOrderId;
            record.delete({
                type: record.Type.SALES_ORDER,
                id: salesOrderId
            });

            return { status: 'success', message: 'Sales order deleted successfully' };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    }
    return {
        get: doGet,
        post: doPost,
        put: doPut,
        delete: doDelete
    };
});
