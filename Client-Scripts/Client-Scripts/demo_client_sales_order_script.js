/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
*/
define(['N/currentRecord'],
function(currentRecord) {
	
	function pageInit(scriptContext) {
      var objRec = currentRecord.get();
       var Record_Type = objRec.type;
		if(Record_Type == 'salesorder'){
			objRec.setValue({
            fieldId : 'entity',
            value: 1111,
        });
		}

    }
	function fieldChanged(scriptContext) {
		if(scriptContext.fieldId == 'entity'){
				var value = objRecord.getText({
					fieldId: 'entity'
				});
				Record_Object.setValue({
					fieldId : 'memo',
					value: value,
				});
		}
    }
    return {
		pageInit : pageInit,
		fieldChanged : fieldChanged
    };
});