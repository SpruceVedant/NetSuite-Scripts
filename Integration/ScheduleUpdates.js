/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record', 'N/https', 'N/log', 'N/search', 'N/file'], function(record, https, log, search, file) {

    function loadConfig() {
        var configFile = file.load({
            id: '/SuiteScripts/api_config.json' 
        });
        return JSON.parse(configFile.getContents());
    }

    function getLastCheckTime() {
        try {
            var lastCheckFile = file.load({
                id: '/SuiteScripts/last_check_time.json'
            });
            var contents = lastCheckFile.getContents();
            var data = JSON.parse(contents);
            return data.lastCheckTime;
        } catch (e) {
            
            log.error('File not found', 'Creating new last_check_time.json file.');
            return '2023-01-01T00:00:00Z';
        }
    }

    function updateLastCheckTime(newCheckTime) {
        var data = {
            lastCheckTime: newCheckTime
        };
        var jsonString = JSON.stringify(data);

        try {
            var lastCheckFile = file.load({
                id: '/SuiteScripts/last_check_time.json'
            });
            lastCheckFile.append({
                contents: jsonString
            });
            lastCheckFile.save();
        } catch (e) {
           
            try {
                var newFile = file.create({
                    name: 'last_check_time.json',
                    fileType: file.Type.JSON,
                    contents: jsonString,
                    folder: -15 // SuiteScripts folder
                });
                
                var fileId = newFile.save();
                log.debug('File Saved Successfully', 'File ID: ' + fileId);
            } catch (ex) {
                log.error('Error Creating Last Check Time File', ex.toString());
            }
        }
    }

    function fetchUpdatedSalesforceOrders(config, lastCheckTime) {
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.refreshToken
        };


        var query = "SELECT Id, Status, TotalAmount, BillingCountry, ShippingCountry, Description, LastModifiedDate FROM Order WHERE LastModifiedDate > " + lastCheckTime;
        var queryUrl = config.endpointUrl + '/services/data/v60.0/query/?q=' + encodeURIComponent(query);

        var response = https.get({
            url: queryUrl,
            headers: headers
        });
        
        log.debug('Http Response Code:', response.code)
        if (response.code === 200) {
            var queryResults = JSON.parse(response.body);
            log.debug('Salesforce Query Results', JSON.stringify(queryResults, null, 2));
            return queryResults.records;
            // return JSON.parse(response.body).records;
        } else {
            log.error('Failed to fetch updated orders from Salesforce', response.body);
            return [];
        }
    }

    function updateNetSuiteOrders(updatedOrders) {
        updatedOrders.forEach(function(order) {
            try {
                var salesOrderSearch = search.create({
                    type: search.Type.SALES_ORDER,
                    filters: [
                        ['custbody_salesforce_order_id', 'is', order.Id]
                    ],
                    columns: ['internalid']
                });

                var searchResult = salesOrderSearch.run().getRange({ start: 0, end: 1 });
                log.debug('order ' , order );
                log.debug('typeof order ' , typeof order );

                if (searchResult.length > 0) {
                    var salesOrderId = searchResult[0].getValue('internalid');
                    var fieldsToUpdate = {
                        // status: order.Status,
                        // total: order.TotalAmount,
                        'memo': order.Description,
                        'shipaddress': order.ShippingCountry,
                        'custbody1': order.Status,
                        // custbody_custom_field: order.Custom_Field__c
                    };

                    /* 10
                    if(filed1 =  )
                     else
                       date
                       ' ' : updatedate
                     */
                    
                    record.submitFields({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        values: fieldsToUpdate
                    });
                    log.debug('Updated Sales Order', 'ID: ' + salesOrderId + ', Fields: ' + JSON.stringify(fieldsToUpdate));
                }
            } catch (e) {
                log.error('Error updating Sales Order', e.message);
            }
        });
    }

    function execute(context) {
        var config = loadConfig();

        var lastCheckTime = getLastCheckTime();
        var updatedOrders = fetchUpdatedSalesforceOrders(config, lastCheckTime);

        if (updatedOrders.length > 0) {
            updateNetSuiteOrders(updatedOrders);
            var newCheckTime = new Date().toISOString();
            updateLastCheckTime(newCheckTime);
        }
    }

    return {
        execute: execute
    };
});
