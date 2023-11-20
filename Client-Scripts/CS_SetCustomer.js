          /**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error'], function(error) {
    function pageInit(context) {
        if (context.mode == 'create')
            return;
        var currentRecord = context.currentRecord;
        currentRecord.setValue({
            fieldId: 'entity',
            value: 1111
        });
    }
  
    
    return {
        pageInit: pageInit,
    };
}); 

        