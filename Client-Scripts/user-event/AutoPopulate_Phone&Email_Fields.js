/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
    function (record, search) {
        function beforeSubmit(scriptContext) {
            // if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                var currentRecord = scriptContext.newRecord;
                var customerId = currentRecord.getValue({
                    fieldId: 'entity',
                });

               
                    var customerLookup = record.load({
                        type: record.Type.CUSTOMER,
                        id: customerId
                    });

                    var email = customerLookup.getValue({
                        fieldId: 'email'
                    });


                    var phone = customerLookup.getValue({
                        fieldId: 'phone'
                    });

                    currentRecord.setValue({
                        fieldId: 'custbody_bfl_email',
                        value: email
                    });

                    currentRecord.setValue({
                        fieldId: 'custbody_bfl_pno',
                        value: phone
                    });
                
            
			log.debug('customer ' , customerId )
        }

        return {
            beforeSubmit: beforeSubmit
        };
    });

// This Script is used to populate the email and phone fields once the record is submitted