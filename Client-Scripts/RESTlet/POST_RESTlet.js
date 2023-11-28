/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/record', 'N/log'], function (record, log) {
    return {
        post: function (restletBody) {
            try {
                log.debug({
                    title: 'RESTlet Execution Started',
                    details: 'Processing incoming data...'
                });

                var restletData = restletBody.data;
                var responseArray = [];

                for (var contact in restletData) {
                    log.debug({
                        title: 'Processing Contact',
                        details: 'Contact: ' + contact
                    });

                    var objRecord = record.create({
                        type: record.Type.CONTACT,
                        isDynamic: true
                    });

                    var contactData = restletData[contact];
                    
                   
                    objRecord.setValue({
                        fieldId: 'subsidiary',
                        value: 1 
                    });

                    for (var key in contactData) {
                        if (contactData.hasOwnProperty(key)) {
                            log.debug({
                                title: 'Setting Field Value',
                                details: 'Field ID: ' + key + ', Value: ' + contactData[key]
                            });

                            objRecord.setValue({
                                fieldId: key,
                                value: contactData[key]
                            });
                        }
                    }

                    var recordId = objRecord.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: false
                    });

                    log.debug({
                        title: 'Record Created',
                        details: 'Contact: ' + contact + ', Record ID: ' + recordId
                    });

                    responseArray.push({
                        contact: contact,
                        recordId: recordId
                    });
                }

                log.debug({
                    title: 'RESTlet Execution Completed',
                    details: 'Processed all incoming data.'
                });

                return JSON.stringify(responseArray);
            } catch (e) {
                log.error({
                    title: 'Error in RESTlet Execution',
                    details: e
                });

                throw e; 
            }
        }
    };
});
// RESTlet to post Data in this case create a Contcat record in NetSuite