/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
*/
define([ 'N/record' ],function(record){
    function afterSubmit(scriptContext){
        var sales_record = record.load({
				type: record.Type.SALES_ORDER,
				id: scriptContext.newRecord.id,
				isDynamic: true,// allowing to maipulate field values
			});
			var total = sales_record.getValue({
				fieldId:'total'
			});
			sales_record.selectNewLine({
				sublistId: 'item'
			});
			sales_record.setCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'item',
				value: 409
			});
			sales_record.setCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				value: 1
			});
			sales_record.setCurrentSublistValue({
				sublistId: 'item',
				fieldId: 'amount',
				value: total
			});
			sales_record.commitLine({
				sublistId: 'item'
			});
			sales_record.save();
    }
    return {
        afterSubmit: afterSubmit
    };
});

// script to add an other charge item at the end of the line to calculate the total amount of the sales order.