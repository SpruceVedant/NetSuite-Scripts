/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/https', 'N/log'], function(record, https, log) {

    function afterSubmit(context) {
        var leadNewRecord = context.newRecord;
        var internalID = leadNewRecord.id;
      
        var lastName = leadNewRecord.getValue('lastname');
        var company = leadNewRecord.getValue('companyname'); 
        var email = leadNewRecord.getValue('email'); 
        var postData = {
            "LastName": lastName,
            "Company": company,
            "Email": email
        };
        postData = JSON.stringify(postData);

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 00D5g00000LNAsc!AR0AQHsNpUjEEjC6f12d2U2PsQxy7.hmylZd_PfsCrNc4YRul1l4NvNJrqiCWSPudsY9dI8GumTlvz7L3aEqgYOsTBuX4.6B' 
        };

        
        var apiURL = 'https://blueflamelabs-7d-dev-ed.develop.my.salesforce.com/services/data/v60.0/sobjects/Lead/';

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
                 
                    log.debug('Success', 'Lead created in Salesforce: ' + newSFID);
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
