/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log', 'N/search'], function(record, https, log, search) {

    // Function to synchronize customer to Salesforce as an account
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
            'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQOEapLTToKRCq6ZY3TtnkXe00Imyjqu4twKq6bssaerGJLY3Dc1JykfydpLU9ClbhURi4fBWk_YWZeFQYgTKVzO_JPCW'
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

    // Function to ensure PriceBookEntry in Salesforce
    function ensurePriceBookEntry(sfProductId, unitPrice) {
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQOEapLTToKRCq6ZY3TtnkXe00Imyjqu4twKq6bssaerGJLY3Dc1JykfydpLU9ClbhURi4fBWk_YWZeFQYgTKVzO_JPCW'
        };

        // Query to find existing PriceBookEntry
        var queryUrl = 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/query/?q=' +
            encodeURIComponent('SELECT Id FROM PricebookEntry WHERE Product2Id = \'' + sfProductId + '\' AND Pricebook2Id = \'01s5g00000c5VfkAAE\'');

        var searchResponse = https.get({
            url: queryUrl,
            headers: headers
        });

        var searchResults = JSON.parse(searchResponse.body);
        if (!searchResults.records || searchResults.records.length === 0) {
            var priceBookEntryData = {
                "Pricebook2Id": "01s5g00000c5VfkAAE",
                "Product2Id": sfProductId,
                "UnitPrice": unitPrice,
                "IsActive": true
            };

            var pbeResponse = https.post({
                url: 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/sobjects/PricebookEntry/',
                headers: headers,
                body: JSON.stringify(priceBookEntryData)
            });

            if (pbeResponse.code === 200 || pbeResponse.code === 201) {
                return JSON.parse(pbeResponse.body).id;
            } else {
                log.error('PriceBookEntry Creation Failed', pbeResponse.body);
                return null;
            }
        } else {
            return searchResults.records[0].Id;
        }
    }

    // Function to sync items from NetSuite to Salesforce as products
    function syncItemsToSalesforceAsProducts(salesOrderRecord) {
        var itemMappings = {};
        var itemCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
        for (var i = 0; i < itemCount; i++) {
            var itemId = salesOrderRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

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
                'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQOEapLTToKRCq6ZY3TtnkXe00Imyjqu4twKq6bssaerGJLY3Dc1JykfydpLU9ClbhURi4fBWk_YWZeFQYgTKVzO_JPCW'
            };

            var response = https.post({
                url: 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/sobjects/Product2/',
                headers: headers,
                body: JSON.stringify(productData)
            });

            log.debug('HTTP Response Code for Item Mapping', response.code);
            if (response.code === 200 || response.code === 201) {
                var responseBody = JSON.parse(response.body);
                var sfProductId = responseBody.id;
                var priceBookEntryId = ensurePriceBookEntry(sfProductId, unitPrice);

                var quantity = salesOrderRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });

                itemMappings[itemId] = { sfProductId: sfProductId, priceBookEntryId: priceBookEntryId, quantity: quantity, unitPrice: unitPrice };
            } else {
                log.error('Salesforce Product Creation Failed', response.body);
                itemMappings[itemId] = null;
            }
        }

        return itemMappings;
    }

    // Function to create Salesforce order with associated items
    function createSalesforceOrder(salesOrderRecord, sfAccountId, itemMappings) {
        var orderData = {
            "AccountId": sfAccountId,
            "EffectiveDate": salesOrderRecord.getValue('trandate').toISOString().split('T')[0],
            "Status": "Draft",
            "Pricebook2Id": "01s5g00000c5VfkAAE" // Standard Price Book ID
        };

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQOEapLTToKRCq6ZY3TtnkXe00Imyjqu4twKq6bssaerGJLY3Dc1JykfydpLU9ClbhURi4fBWk_YWZeFQYgTKVzO_JPCW'
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
                if (mapping && mapping.priceBookEntryId) {
                    var orderItemData = {
                        "OrderId": sfOrderId,
                        "PricebookEntryId": mapping.priceBookEntryId,
                        "Quantity": mapping.quantity,
                        "UnitPrice": mapping.unitPrice // Set the unit price correctly
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

    // Main function triggered after record submission
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
