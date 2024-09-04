require(['N/record', 'N/log'], function(record, log) {
   
        var salesOrder = record.load({
            type: record.Type.SALES_ORDER,
            id: 22087
        });
        var fieldIds = salesOrder.getFields();
  
        fieldIds.forEach(function(fieldId) {
            if (fieldId.startsWith('custbody_salesforce_account_id')) {
                var fieldValue = salesOrder.getValue({ fieldId: fieldId });
                console.log('Custom Field: ' + fieldId, 'Value: ' + fieldValue);
            }
        });
});
