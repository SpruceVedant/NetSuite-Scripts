/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/log', 'N/currentRecord'], 
    function(record, log, currentRecord) {

        function pageInit(context) {
           
        }
        function lineInit(context) {
            
            if (context.sublistId === 'item') {
    
                var currentRecordObj = currentRecord.get();
                var lineCount = currentRecordObj.getLineCount({
                    sublistId: 'item'
                });

                var runningTotal = 0;

                for (var i = 0; i < lineCount; i++) {
                    var amount = currentRecordObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i
                    });
                    runningTotal += amount;
                }
		
                currentRecordObj.setValue({
                    fieldId: 'custbody_bfl_sum',
                    value: runningTotal
                });
            }
        }

        return {
            pageInit: pageInit,
            lineInit: lineInit
        };
    }
);

// SCript to calculate running sum of items in custom running sum field