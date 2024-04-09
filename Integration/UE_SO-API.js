/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log'], function(record, https, log) {

    function afterSubmit(context) {
        if (context.type !== context.UserEventType.CREATE) {
            return; // Only run on creation of a sales order
        }

        var salesOrderRecord = context.newRecord;
        var internalID = salesOrderRecord.id;
        var customerId = salesOrderRecord.getValue('entity');

        var accountId = fetchSalesforceAccountId(customerId);

        var orderData = {
            "AccountId": accountId,
            "EffectiveDate": salesOrderRecord.getValue('trandate').toISOString().split('T')[0], // Formatting date
            "Status": "Draft"
        };

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // You need to manage and replace YOUR_ACCESS_TOKEN appropriately
        };

        var orderResponse = https.post({
            url: 'https://your_instance.salesforce.com/services/data/vXX.0/sobjects/Order/',
            headers: headers,
            body: JSON.stringify(orderData)
        });

        if (orderResponse.code === 200 || orderResponse.code === 201) {
            var orderResponseBody = JSON.parse(orderResponse.body);
            var newSFOrderId = orderResponseBody.id;
            createSalesforceOrderItems(salesOrderRecord, newSFOrderId, headers, https);
            log.debug('Success', 'Salesforce Order and Order Items created');
        } else {
            log.error('Salesforce Order Creation Failed', 'Response: ' + orderResponse.body);
        }
    }

    function createSalesforceOrderItems(salesOrderRecord, newSFOrderId, headers, https) {
        var itemCount = salesOrderRecord.getLineCount({sublistId: 'item'});
        for (var i = 0; i < itemCount; i++) {
            var nsProductId = salesOrderRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });
            var quantity = salesOrderRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });

            var sfProductId = mapNetSuiteProductToSalesforce(nsProductId);
            if (!sfProductId) {
                log.error('Product Mapping Failed', 'No Salesforce Product ID for NetSuite Product ID: ' + nsProductId);
                continue;
            }

            var orderItemData = {
                "OrderId": newSFOrderId,
                "ProductId": sfProductId,
                "Quantity": quantity
            };

            var itemResponse = https.post({
                url: 'https://your_instance.salesforce.com/services/data/vXX.0/sobjects/OrderItem/',
                headers: headers,
                body: JSON.stringify(orderItemData)
            });

            if (itemResponse.code !== 200 && itemResponse.code !== 201) {
                log.error('Salesforce OrderItem Creation Failed', 'Response: ' + itemResponse.body);
            }
        }
    }

    function mapNetSuiteProductToSalesforce(nsProductId) {
        var productRecord = record.load({
            type: record.Type.INVENTORY_ITEM, // Adjust based on your item type
            id: nsProductId
        });
        var sfProductId = productRecord.getValue('custitem_sf_product2_id');
        return sfProductId ? sfProductId : null;
    }

    function fetchSalesforceAccountId(customerId) {
        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId
        });
        var sfAccountId = customerRecord.getValue('custentity_salesforce_account_id');
        return sfAccountId ? sfAccountId : null;
    }

    return {
        afterSubmit: afterSubmit
    };
});
