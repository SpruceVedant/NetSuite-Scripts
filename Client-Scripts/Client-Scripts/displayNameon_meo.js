/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord'], function(error) {
    function pageInit(context) {
        
    }

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var fieldId = context.fieldId;

        if (fieldId === 'entity') {
           
            var newCustomerName = currentRecord.getText({
                fieldId: 'entity'
            });

            currentRecord.setValue({
                fieldId: 'memo',
                value: "Selected Customer: " + newCustomerName
            });
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };
});
// Script to display selected customers name in the memo field
