/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/record', 'N/log'], function (record, log) {
    return {

        put: function (data) {
            try {
                log.debug({
                    title: 'RESTlet Execution Started',
                    details: 'Processing PUT request...'
                });

                var contactId = data.contactId;

               
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

               
                contactRecord.setValue({
                    fieldId: 'firstname', 
                    value: data.firstname
                });

                contactRecord.setValue({
                    fieldId: 'lastname', 
                    value: data.lastname 
                });

                var updatedContactId = contactRecord.save();

                log.debug({
                    title: 'Contact Data Updated',
                    details: 'Contact ID: ' + updatedContactId
                });

                log.debug({
                    title: 'RESTlet Execution Completed',
                    details: 'Processed PUT request.'
                });

                return JSON.stringify({ success: true, message: 'Contact data updated successfully.' });
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
// To update currently posted data