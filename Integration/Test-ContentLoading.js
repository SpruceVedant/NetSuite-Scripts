/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log', 'N/search', 'N/file'], function(record, https, log, search, file) {

    function getAPIConfig() {
        var filePath = '/SuiteScripts/APIConfigurations/api_config.txt';
        var configFile = file.load({path: filePath});
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
        var emailAddress = customerRecord.getValue('email');
        log.debug('HTTP Response Code for account', companyName);

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

    // Continue modifying other functions similarly where the endpoint and token are used

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
