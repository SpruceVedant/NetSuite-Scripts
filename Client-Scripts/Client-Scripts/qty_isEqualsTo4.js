/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message'],
  function(currentRecord, message) {
    var recordObject;
    var recordType;
    var alertDisplayed = false;

    function pageInit(scriptContext) {
      recordObject = currentRecord.get();
      recordType = recordObject.type;
      if (recordType === 'salesorder') {
        recordObject.setValue({
          fieldId: 'entity',
          value: 1111
        });
      }
    }

    function fieldChanged(scriptContext) {
      var objRecord = currentRecord.get();
      if (scriptContext.fieldId === 'entity') {
        var value = objRecord.getText({
          fieldId: 'entity'
        });
        recordObject.setValue({
          fieldId: 'memo',
          value: value
        });
      }

    
      var sublistId = 'item';
      var quantityFieldId = 'quantity';
      var quantity = objRecord.getCurrentSublistValue({
        sublistId: sublistId,
        fieldId: quantityFieldId
      });

      if (quantity < 3 && !alertDisplayed) {
        var alertMessage = message.create({
          title: 'Warning',
          message: 'The quantity should be not more than 3.',
          type: message.Type.WARNING
        });
        alertMessage.show();
        alertDisplayed = true;
      }
    }
    
   function validateDelete(scriptContext) {
        var rec_obj = currentRecord.get();
    var qty = rec_obj.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "quantity",
    });
 
   if (qty ==  4) {
      alert("items with 4 quantity wont be deleted");
      return false;
    }
    return true;
    }

    return {
      pageInit: pageInit,
      fieldChanged: fieldChanged,
      validateDelete : validateDelete,
    };
  });
