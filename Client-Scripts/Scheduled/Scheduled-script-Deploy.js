/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record'], function(record) {
  function updateSalesOrderMemo(context) {
    var salesOrderId = 741;
    var salesOrderRecord = record.load({
      type: record.Type.SALES_ORDER,
      id: salesOrderId
    });

    var customMessage = '';

    
    if (context.deploymentId === 'custom_deploy1') {
      customMessage = 'Deployment 1 message';
    } else if (context.deploymentId === 'custom_deploy2') {
      customMessage = 'Deployment 2 message';
    } else if (context.deploymentId === 'custom_deploy3') {
      customMessage = 'Deployment 3 message';
    } else if (context.deploymentId === 'custom_deploy4') {
      customMessage = 'Deployment 4 message';
    }

   
    salesOrderRecord.setValue({
      fieldId: 'memo',
      value: customMessage
    });

    salesOrderRecord.save();
  }

  return {
    execute: updateSalesOrderMemo
  };
});
