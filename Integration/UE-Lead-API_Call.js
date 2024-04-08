/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log'], function(record, https, log) {

    function afterSubmit(context) {
        var leadNewRecord = context.newRecord;
        var internalID = leadNewRecord.id;
        var firstName = leadNewRecord.getValue('firstname'); // Adjust to the actual field id in NetSuite for the first name
        var lastName = leadNewRecord.getValue('lastname'); // Adjust to the actual field id in NetSuite for the last name
        var email = leadNewRecord.getValue('email'); // Adjust to the actual field id in NetSuite for the email

        // Construct the data to be sent to Salesforce
        var postData = JSON.stringify({
            "FirstName": firstName,
            "LastName": lastName,
            "Email": email,
            
        });

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <Your_Access_Token>' 
        };

        // Update this URL to the Salesforce API endpoint for creating leads
        var apiURL = 'https://<Your_Salesforce_Instance_URL>/services/data/vXX.0/sobjects/Lead/';

        try {
            var response = https.post({
                url: apiURL,
                headers: headers,
                body: postData
            });

            log.debug('HTTP Response Code', response.code);
            
            if (response.code === 200 || response.code === 201) {
                var responseBody = JSON.parse(response.body);
                var newSFID = responseBody.id;
                if (newSFID) {
                    record.submitFields({
                        type: leadNewRecord.type,
                        id: internalID,
                        values: {
                            // Update this with the actual NetSuite field where you want to store the Salesforce ID
                            'custentity_sf_lead_id': newSFID
                        }
                    });
                    log.debug('Success', 'Salesforce Lead ID updated in NetSuite: ' + newSFID);
                }
            } else {
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
