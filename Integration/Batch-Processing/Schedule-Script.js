/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/https', 'N/log', 'N/search', 'N/file', 'N/runtime'], function(record, https, log, search, file, runtime) {

    function execute(context) {
        var scriptObj = runtime.getCurrentScript();
        var syncOption = scriptObj.getParameter({ name: 'custscript_sync_option' });
        log.debug('Sync Option Retrieved', syncOption);

        if (!syncOption) {
            log.error('Invalid Sync Option', 'No sync option provided.');
            return;
        }

        var config = loadConfig();
        log.debug('Configuration Loaded', config);

        try {
            switch (syncOption) {
                case 'sync_accounts':
                    log.debug('Syncing Accounts');
                    syncRecordsToSalesforce('customer', 'Account', 'companyname', {
                        'companyname': 'Name'
                    }, config);
                    break;
                case 'sync_customers':
                    log.debug('Syncing Customers');
                    syncRecordsToSalesforce('customer', 'Account', 'companyname', {
                        'companyname': 'Name'
                    }, config);
                    break;
                case 'sync_leads':
                    log.debug('Syncing Leads');
                    syncRecordsToSalesforce('lead', 'Lead', 'email', {
                        'companyname': 'Company',
                        'email': 'Email',
                        'phone': 'Phone'
                    }, config);
                    break;
                case 'sync_items':
                    log.debug('Syncing Items');
                    syncRecordsToSalesforce('inventoryitem', 'Product2', 'itemid', {
                        'itemid': 'Name',
                        'salesdescription': 'Description',
                        'baseprice': 'Price'
                    }, config);
                    break;
                default:
                    log.error('Invalid Sync Option', syncOption);
                    break;
            }
        } catch (error) {
            log.error('Sync Error', error.message);
        }
    }

    function loadConfig() {
        try {
            var configFile = file.load({
                id: '/SuiteScripts/salesforce_access_token.json'
            });
            var config = JSON.parse(configFile.getContents());
            log.debug('Config File Content', config);
            return config;
        } catch (error) {
            log.error('Configuration Load Error', error);
            throw new Error('Failed to load configuration file.');
        }
    }

    function findExistingSalesforceRecord(salesforceObject, uniqueField, uniqueValue, config) {
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.access_token
        };

        var queryUrl = config.instance_url + '/services/data/v60.0/query/?q=' +
            encodeURIComponent("SELECT Id FROM " + salesforceObject + " WHERE " + uniqueField + " = '" + uniqueValue + "'");

        var response = https.get({
            url: queryUrl,
            headers: headers
        });

        log.debug('Salesforce Query Response', response);

        if (response.code === 200) {
            var responseBody = JSON.parse(response.body);
            if (responseBody.records && responseBody.records.length > 0) {
                return responseBody.records[0].Id;
            }
        }
        return null;
    }

    function syncRecordsToSalesforce(recordType, salesforceObject, uniqueField, fieldsMapping, config) {
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.access_token
        };

        var searchResults = search.create({
            type: recordType,
            columns: Object.keys(fieldsMapping)
        }).runPaged({ pageSize: 1000 });

        searchResults.pageRanges.forEach(function(pageRange) {
            var page = searchResults.fetch({ index: pageRange.index });
            page.data.forEach(function(result) {
                var recordData = {};
                for (var nsField in fieldsMapping) {
                    recordData[fieldsMapping[nsField]] = result.getValue(nsField);
                }

                var uniqueValue = result.getValue(uniqueField);
                var existingRecordId = findExistingSalesforceRecord(salesforceObject, fieldsMapping[uniqueField], uniqueValue, config);

                if (existingRecordId) {
                    // Update existing record
                    var updateUrl = config.instance_url + '/services/data/v60.0/sobjects/' + salesforceObject + '/' + existingRecordId + '?_HttpMethod=PATCH';
                    var updateResponse = https.post({
                        url: updateUrl,
                        headers: headers,
                        body: JSON.stringify(recordData)
                    });

                    log.debug('Salesforce Update Response', updateResponse);

                    if (updateResponse.code === 204) {
                        log.debug('Salesforce ' + salesforceObject + ' Update Successful', 'ID: ' + existingRecordId);
                    } else {
                        log.error('Salesforce ' + salesforceObject + ' Update Failed', updateResponse.body);
                    }
                } else {
                    // Create new record
                    var createUrl = config.instance_url + '/services/data/v60.0/sobjects/' + salesforceObject + '/';
                    var createResponse = https.post({
                        url: createUrl,
                        headers: headers,
                        body: JSON.stringify(recordData)
                    });

                    log.debug('Salesforce Create Response', createResponse);

                    if (createResponse.code === 200 || createResponse.code === 201) {
                        log.debug('Salesforce ' + salesforceObject + ' Creation Successful', createResponse.body);
                    } else {
                        log.error('Salesforce ' + salesforceObject + ' Creation Failed', createResponse.body);
                    }
                }

               
                if (runtime.getCurrentScript().getRemainingUsage() < 100) {
                    log.debug('Usage Limit Exceeded', 'Pausing execution to prevent usage limit error.');
                    return false;
                }
            });
        });
    }

    return {
        execute: execute
    };
});
