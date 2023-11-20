/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/log'],

function(search, record, log) {
    function getInputData() {
        return search.create({
            type: search.Type.CUSTOMER,
            filters: [['entityid', 'is', 'Cust015']],
            columns: ['internalid', 'entityid']
        });
    }

    function map(context) {
       
        var searchResult = JSON.parse(context.value);
        var customerId = searchResult.values.internalid;
        var customerName = searchResult.values.entityid;

        
        context.write({
            key: customerId,
            value: customerName
        });
    }

    function reduce(context) {
       
        var customerId = context.key;
        var customerName = context.values;

      
        log.debug({
            title: 'Customer ID: ' + customerId,
            details: 'Customer Name: ' + customerName
        });
    }

    function summarize(summary) {

        log.audit('Summary', 'Map/Reduce script has been executed');
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
