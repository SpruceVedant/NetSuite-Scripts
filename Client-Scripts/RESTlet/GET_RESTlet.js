/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/record', 'N/log'], function (record, log) {
    return {
        get: function (parameters) {
            try {
                log.debug({
                    title: 'RESTlet Execution Started',
                    details: 'Processing GET request...'
                });

                var contactId = parameters.contactId;

               
                if (contactId == undefined || contactId == null) {
                    throw {
                        name: 'InvalidRequestError',
                        message: 'Contact ID is missing in the request parameters.'
                    };
                }

                var contactRecord = record.load({
                    type: record.Type.CONTACT,
                    id: contactId
                });

                var contactData = {
                    contactId: contactRecord.id,
                    firstname: contactRecord.getValue('firstname'),
                    lastname: contactRecord.getValue('lastname'),
                    email: contactRecord.getValue('email')
                };

                log.debug({
                    title: 'Contact Data Retrieved',
                    details: 'Contact ID: ' + contactData.contactId + ', First Name: ' + contactData.firstname
                });

                log.debug({
                    title: 'RESTlet Execution Completed',
                    details: 'Processed GET request.'
                });

                return JSON.stringify(contactData);
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
// To fetch contact details