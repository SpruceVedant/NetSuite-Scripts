/**
* @NApiVersion 2.1
* @NScriptType ScheduledScript
*/
define(["N/log", "N/record", "N/runtime", "N/search"],

(log, record, runtime, search) => {
 
  const execute = (scriptContext) => {
	  var id_salesOrder = runtime.getCurrentScript().getParameter({
		  name: 'custscript1'
	  });
	  var memo_salesOrder = runtime.getCurrentScript().getParameter({
		  name: 'custscript2'
	  });
	  var salesOrder = record.load({
		  type: record.Type.SALES_ORDER,
		  id: id_salesOrder,
		  isDynamic: true,
	  })
	  log.debug('Sales Order: ', id_salesOrder);
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