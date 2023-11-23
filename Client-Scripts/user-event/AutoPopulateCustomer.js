/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
*/
define(['N/record', 'N/search'],  function(record, search){
    function beforeLoad(scriptContext){
        var record_object = scriptContext.newRecord;
        var i_customerId = 1111; 
        log.debug('customer Id = ', i_customerId);
        var customer_object = search.lookupFields({type: 'customer', id: i_customerId, columns: ['email', 'phone']});
        log.debug('email = ', customer_object.email);
        log.debug('email = ', customer_object.phone);
        record_object.setValue({fieldId: 'entity', value: 1111 })
        record_object.setValue({fieldId: 'custbody_bfl_email', value: customer_object.email})
        record_object.setValue({fieldId: 'custbody_bfl_pno', value: customer_object.phone})

    }

    return {beforeLoad :beforeLoad}

});
// Script to Autopopulate Customer name , email ,phone in Invoice transaction record.
// This is deployed with the name AutoPopulateCustomer.js in NetSuite
