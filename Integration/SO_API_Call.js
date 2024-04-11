/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log', 'N/search'], function(record, https, log, search) {

    function syncCustomerToSalesforceAsAccount(customerId) {
        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId
        });

        var companyName = customerRecord.getValue('companyname');
        var emailAddress = customerRecord.getValue('email');
        log.debug('HTTP Response Code for account', companyName);

        var accountData = {
            "Name": companyName
        };

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQEvtZdXp0Ts_kv8J8c5Mm8.DDnJ3t8z1Q4s_Qd8WgMEf8Mx45wFASqTMh8n_PQbgUmLUccQ0dTQnns2qA6t_GmyyFd8j'
        };

        var response = https.post({
            url: 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/sobjects/Account/',
            headers: headers,
            body: JSON.stringify(accountData)
        });

        log.debug('HTTP Response Code for account', response.code);
        if (response.code === 200 || response.code === 201) {
            var responseBody = JSON.parse(response.body);
            return responseBody.id;
        } else {
            log.error('Salesforce Account Creation Failed', response.body);
            return null;
        }
    }

    function syncItemsToSalesforceAsProducts(salesOrderRecord) {
        var itemMappings = {};
        var itemCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
        for (var i = 0; i < itemCount; i++) {
            var itemId = salesOrderRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            if (!itemMappings[itemId]) {
                var itemRecord = record.load({
                    type: record.Type.INVENTORY_ITEM,
                    id: itemId
                });

                var productName = itemRecord.getValue('displayname');
                var unitPrice = itemRecord.getValue('baseprice');
                log.debug('Product Name', productName);

                var productData = {
                    "Name": productName
                };

                var headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQEvtZdXp0Ts_kv8J8c5Mm8.DDnJ3t8z1Q4s_Qd8WgMEf8Mx45wFASqTMh8n_PQbgUmLUccQ0dTQnns2qA6t_GmyyFd8j'
                };

                var response = https.post({
                    url: 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/vXX.0/sobjects/Product2/',
                    headers: headers,
                    body: JSON.stringify(productData)
                });

                log.debug('HTTP Response Code for Item Mapping', response.code);
                if (response.code === 200 || response.code === 201) {
                    var responseBody = JSON.parse(response.body);
                    var sfProductId = responseBody.id;
                    var quantity = salesOrderRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    });

                    itemMappings[itemId] = { sfProductId: sfProductId, quantity: quantity };
                } else {
                    log.error('Salesforce Product Creation Failed', response.body);
                    itemMappings[itemId] = null;
                }
            }
        }

        return itemMappings;
    }

    function createSalesforceOrder(salesOrderRecord, sfAccountId, itemMappings) {
        var orderData = {
            "AccountId": sfAccountId,
            "EffectiveDate": salesOrderRecord.getValue('trandate').toISOString().split('T')[0],
            "Status": "Draft"
        };
        log.debug("Order Data:", orderData);

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQEvtZdXp0Ts_kv8J8c5Mm8.DDnJ3t8z1Q4s_Qd8WgMEf8Mx45wFASqTMh8n_PQbgUmLUccQ0dTQnns2qA6t_GmyyFd8j'
        };

        var response = https.post({
            url: 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/sobjects/Order/',
            headers: headers,
            body: JSON.stringify(orderData)
        });

        if (response.code === 200 || response.code === 201) {
            var responseBody = JSON.parse(response.body);
            var sfOrderId = responseBody.id;

            Object.keys(itemMappings).forEach(function(itemId) {
                var mapping = itemMappings[itemId];
                if (mapping && mapping.sfProductId) {
                    var orderItemData = {
                        "OrderId": sfOrderId,
                        "ProductId": mapping.sfProductId,
                        "Quantity": mapping.quantity
                    };

                    var itemResponse = https.post({
                        url: 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/sobjects/OrderItem/',
                        headers: headers,
                        body: JSON.stringify(orderItemData)
                    });

                    if (itemResponse.code !== 200 && itemResponse.code !== 201) {
                        log.error('Salesforce OrderItem Creation Failed', itemResponse.body);
                    }
                }
            });
        } else {
            log.error('Salesforce Order Creation Failed', response.body);
        }
    }

    function afterSubmit(context) {
        if (context.type !== context.UserEventType.CREATE) return;

        var salesOrderRecord = context.newRecord;
        var customerId = salesOrderRecord.getValue('entity');

        var sfAccountId = syncCustomerToSalesforceAsAccount(customerId);
        var itemMappings = syncItemsToSalesforceAsProducts(salesOrderRecord);

        if (sfAccountId && Object.keys(itemMappings).length) {
            createSalesforceOrder(salesOrderRecord, sfAccountId, itemMappings);
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
