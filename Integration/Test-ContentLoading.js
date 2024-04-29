/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log', 'N/search', 'N/file'], function(record, https, log, search, file) {

    function getAPIConfig() {
        var filePath = '/SuiteScripts/APIConfigurations/api_config.txt';
        var configFile = file.load({ path: filePath });
        var contents = configFile.getContents();
        var configLines = contents.split('\n');
        var endpointUrl = configLines[0].split(': ')[1].trim();
        var oauthToken = configLines[1].split(': ')[1].trim();

        return { endpointUrl: endpointUrl, oauthToken: oauthToken };
    }

    function syncCustomerToSalesforceAsAccount(customerId) {
        var config = getAPIConfig();
        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: customerId
        });

        var companyName = customerRecord.getValue('companyname');
        var accountData = {
            "Name": companyName
        };

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.oauthToken
        };

        var response = https.post({
            url: config.endpointUrl + 'services/data/v60.0/sobjects/Account/',
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

    function ensurePriceBookEntry(sfProductId, unitPrice) {
        var config = getAPIConfig();
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.oauthToken
        };

        var queryUrl = config.endpointUrl + 'services/data/v60.0/query/?q=' +
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
                url: config.endpointUrl + 'services/data/v60.0/sobjects/PricebookEntry/',
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

    function syncItemsToSalesforceAsProducts(salesOrderRecord) {
        var config = getAPIConfig();
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

            var productData = {
                "Name": productName
            };

            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config.oauthToken
            };

            var response = https.post({
                url: config.endpointUrl + 'services/data/v60.0/sobjects/Product2/',
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

    function createSalesforceOrder(salesOrderRecord, sfAccountId, itemMappings) {
        var config = getAPIConfig();
        var orderData = {
            "AccountId": sfAccountId,
            "EffectiveDate": salesOrderRecord.getValue('trandate').toISOString().split('T')[0],
            "Status": "Draft",
            "Pricebook2Id": "01s5g00000c5VfkAAE" // Standard Price Book ID
        };

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.oauthToken
        };

        var response = https.post({
            url: config.endpointUrl + 'services/data/v60.0/sobjects/Order/',
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
                        "UnitPrice": mapping.unitPrice 
                    };

                    var itemResponse = https.post({
                        url: config.endpointUrl + 'services/data/v60.0/sobjects/OrderItem/',
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
