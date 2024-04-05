/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log'], function(record, https, log) {

    function afterSubmit(context) {
        var prodNewRecord = context.newRecord;
        var internalID = prodNewRecord.id;
        var productCode = prodNewRecord.getValue('itemid');
        var postData = {
            "internalID": internalID,
            "productCode": productCode
        };
        postData = JSON.stringify(postData);

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQGyw8q4qJMPTtOEkKgquuhhawX_d378qBlP9KprTKOiGNMod3UFXaiw5j.4c8VznMbLI9XN5AXyDYqdIf6J0djDxG3pr' // Replace with your actual access token
        };

        var apiURL = 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/limits'; // Update this URL

        try {
            var response = https.get({
                url: apiURL,
                headers: headers,
                body: postData
            });

            // Check the status code of the response
            log.debug('HTTP Response Code', response.code);
            
            if (response.code === 200 || response.code === 201) {
                // Handle successful response
                var responseBody = JSON.parse(response.body);
                var newSFID = responseBody.id;
                if (newSFID) {
                    record.submitFields({
                        type: prodNewRecord.type,
                        id: internalID,
                        values: {
                            'custitem_sf_id': newSFID
                        }
                    });
                    log.debug('Success', 'Salesforce ID updated in NetSuite: ' + newSFID);
                }
            } else {
                // Handle other HTTP responses
                log.error('HTTP Error', 'Status Code: ' + response.code + ', Body: ' + response.body);
            }
        } catch (error) {
            log.error('ERROR', JSON.stringify(error));
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
