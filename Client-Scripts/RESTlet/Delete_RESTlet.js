// RESTlet to mimic 'DELETE' method to delete certain record in netsuite.
/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/record', 'N/log'], function (record, log) {
    return {
        get: function (parameters) {
            
        },

        put: function (data) {
         
        },

        delete: function (parameters) {
            try {
                log.debug({
                    title: 'RESTlet Execution Started',
                    details: 'Processing DELETE request...'
                })
                var contactId = parameters.contactId;
               if (contactId == undefined || contactId == null) {
                    throw {
                        name: 'InvalidRequestError',
                        message: 'Contact ID is missing in the request parameters.'
                    };
                }
                record.delete({
                    type: record.Type.CONTACT,
                    id: contactId
                });

                log.debug({
                    title: 'Contact Data Deleted',
                    details: 'Contact ID: ' + contactId
                });

                log.debug({
                    title: 'RESTlet Execution Completed',
                    details: 'Processed DELETE request.'
                });
                return JSON.stringify({ success: true, message: 'Contact data deleted successfully.' });
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
