/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/https', 'N/log', 'N/search', 'N/file'], function(record, https, log, search, file) {

    function loadConfig() {
        var configFile = file.load({
            id: '/SuiteScripts/api_config.json'
        });
        return JSON.parse(configFile.getContents());
    }

    function getSalesforceOrderUpdates(config) {
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.refreshToken
        };

        // Query for Orders and related Account Phone (assuming the phone number is stored in Account)
        var response = https.get({
            url: config.endpointUrl + '/services/data/v60.0/query/?q=' +
                encodeURIComponent('SELECT Id, ShippingAddress, Account.Phone, ExternalId__c FROM Order WHERE LastModifiedDate = LAST_N_DAYS:1'),
            headers: headers
        });

        if (response.code === 200) {
            return JSON.parse(response.body).records;
        } else {
            log.error('Salesforce Query Failed', response.body);
            return [];
        }
    }

    function updateNetSuiteSalesOrder(orderUpdate) {
        try {
            var salesOrderSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    ['custbody_salesforce_order_id', 'is', orderUpdate.Id]
                ],
                columns: ['internalid']
            });

            var searchResult = salesOrderSearch.run().getRange({ start: 0, end: 1 });
            if (searchResult.length === 0) {
                log.error('Sales Order not found', 'No NetSuite Sales Order found for Salesforce Order ID: ' + orderUpdate.Id);
                return { success: false, message: 'Sales Order not found' };
            }

            var salesOrderId = searchResult[0].getValue('internalid');
            var salesOrderRecord = record.load({
                type: record.Type.SALES_ORDER,
                id: salesOrderId
            });

            if (orderUpdate.ShippingAddress) {
                salesOrderRecord.setValue({
                    fieldId: 'shipaddress',
                    value: orderUpdate.ShippingAddress
                });
            }

            if (orderUpdate.Account && orderUpdate.Account.Phone) {
                salesOrderRecord.setValue({
                    fieldId: 'custbody_contact_number', // Adjust the field ID if needed
                    value: orderUpdate.Account.Phone
                });
            }

            salesOrderRecord.save();
            return { success: true };
        } catch (error) {
            log.error('Error updating sales order', error);
            return { success: false, message: error.message };
        }
    }

    function onRequest(context) {
        var config = loadConfig();
        var updates = getSalesforceOrderUpdates(config);

        updates.forEach(function(update) {
            updateNetSuiteSalesOrder(update);
        });

        context.response.write(JSON.stringify({ success: true, message: 'Updates applied successfully' }));
    }

    return {
        onRequest: onRequest
    };
});
