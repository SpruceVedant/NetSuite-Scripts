function syncItemsToSalesforceAsProducts(salesOrderRecord) {
    var itemMappings = {};
    var itemCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
    for (var i = 0; i < itemCount; i++) {
        var itemId = salesOrderRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            line: i
        });

        var productName = salesOrderRecord.getSublistText({
            sublistId: 'item',
            fieldId: 'item',
            line: i
        });
        
        var unitPrice = salesOrderRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'rate',  // Fetching unit price directly from the sales order line
            line: i
        });
        
        log.debug('Product Name', productName);
        log.debug('Unit Price', unitPrice);

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
