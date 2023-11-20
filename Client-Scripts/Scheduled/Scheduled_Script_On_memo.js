/**
* @NApiVersion 2.1
* @NScriptType ScheduledScript
*/
define(["N/log", "N/record", "N/runtime", "N/search"], /**
* @param{log} log
* @param{record} record
* @param{runtime} runtime
* @param{search} search
*/
(log, record, runtime, search) => {
  /**
   * Defines the Scheduled script trigger point.
   * @param {Object} scriptContext
   * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
   * @since 2015.2
   */
  const execute = (scriptContext) => {
	  var id_salesOrder = runtime.getCurrentScript().getParameter({
		  name: 'custscriptid_salesOrder'
	  });
	  var memo_salesOrder = runtime.getCurrentScript().getParameter({
		  name: 'custscriptmemo_salesOrder'
	  });
	  var salesorder = record.load({
		  type: record.Type.SALES_ORDER,
		  id: id_salesOrder,
		  isDynamic: true,
	  })
	  log.debug('Sales Order Loaded Success : ', id_salesOrder);
	  salesorder.setValue({
		  fieldId: 'memo',
		  value: memo_salesOrder,
	  })
	  salesorder.save({
		  enableSourcing: true,
		  ignoreMandatoryFields: true
	  });
	  log.debug('value set successfully');
  };
 
  return { execute };
});