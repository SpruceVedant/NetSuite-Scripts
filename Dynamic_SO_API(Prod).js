/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log', 'N/search', 'N/file'], function(record, https, log, search, file) {
   
    function loadConfig() {
        var configFile = file.load({
            id: '/SuiteScripts/api_config.json' 
        });
        return JSON.parse(configFile.getContents());
    }

    function syncCustomerToSalesforceAsAccount(customerId, config) {
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
            'Authorization': 'Bearer ' + config.refreshToken
        };

        var response = https.post({
            url: config.endpointUrl + '/services/data/v60.0/sobjects/Account/',
            headers: headers,
            body: JSON.stringify(accountData)
        });

        log.debug('HTTP Response Code for Account', response.code);
        if (response.code === 200 || response.code === 201) {
            var responseBody = JSON.parse(response.body);
            return responseBody.id;
        } else {
            log.error('Salesforce Account Creation Failed', response.body);
            return null;
        }
    }

    function ensurePriceBookEntry(sfProductId, unitPrice, config) {
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.refreshToken
        };

        var queryUrl = config.endpointUrl + '/services/data/v60.0/query/?q=' +
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
                url: config.endpointUrl + '/services/data/v60.0/sobjects/PricebookEntry/',
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

    
    function syncItemsToSalesforceAsProducts(salesOrderRecord, config) {
        var itemCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
        var itemMappings = {};
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
            var unitPrice = salesOrderRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i
            });
            log.debug('Unit Price', unitPrice);
            log.debug('Product Name', productName)
            var productData = {
                "Name": productName
            };

            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config.refreshToken
            };

            var response = https.post({
                url: config.endpointUrl + '/services/data/v60.0/sobjects/Product2/',
                headers: headers,
                body: JSON.stringify(productData)
            });

            log.debug('HTTP Response Code for Product Mapping', response.code);
            if (response.code === 200 || response.code === 201) {
                var responseBody = JSON.parse(response.body);
                var sfProductId = responseBody.id;
                var priceBookEntryId = ensurePriceBookEntry(sfProductId, unitPrice, config);
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

   
    function createSalesforceOrder(salesOrderRecord, sfAccountId, itemMappings, config) {
        var orderData = {
            "AccountId": sfAccountId,
            "EffectiveDate": salesOrderRecord.getValue('trandate').toISOString().split('T')[0],
            "Status": "Draft",
            "Pricebook2Id": "01s5g00000c5VfkAAE" // Standard Price Book ID
        };

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.refreshToken
        };

        var response = https.post({
            url: config.endpointUrl + '/services/data/v60.0/sobjects/Order/',
            headers: headers,
            body: JSON.stringify(orderData)
        });

        if (response.code === 200 || response.code === 201) {
            var responseBody = JSON.parse(response.body);
            var sfOrderId = responseBody.id;
            log.debug('SAlesforce Order ID:',sfOrderId);
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
                        url: config.endpointUrl + '/services/data/v60.0/sobjects/OrderItem/',
                        headers: headers,
                        body: JSON.stringify(orderItemData)
                    });
                    log.debug("Sales Order Data", orderItemData);
                    if (itemResponse.code !== 200 && itemResponse.code !== 201) {
                        log.error('Salesforce OrderItem Creation Failed', itemResponse.body);
                    }
                }
            });
            
        } else {
            log.error('Salesforce Order Creation Failed', response.body);
            return null;
        }
    }

 
    function afterSubmit(context) {
        if (context.type !== context.UserEventType.CREATE) return;

        var config = loadConfig();
        var salesOrderRecord = context.newRecord;
        var customerId = salesOrderRecord.getValue('entity');
        var sfAccountId = syncCustomerToSalesforceAsAccount(customerId, config);
        if (sfAccountId) {
            var itemMappings = syncItemsToSalesforceAsProducts(salesOrderRecord, config);
            var sfOrderId = createSalesforceOrder(salesOrderRecord, sfAccountId, itemMappings, config);
            if (sfOrderId) {
                log.debug('Salesforce Order Creation Successful', 'Salesforce Order ID: ' + sfOrderId);
            }
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
