/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/query', 'N/log', 'N/ui/serverWidget'], function(query, log, serverWidget) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget.createForm({
                title: 'SuiteQL Query Results'
            });

            // Define the SuiteQL query
            var sql = 'SELECT id, tranid, entity, total FROM transaction WHERE mainline = \'T\' ORDER BY tranid ASC LIMIT 10';

            // Run the SuiteQL query
            var queryResults = query.runSuiteQL({
                query: sql
            });

            // Process the results
            var records = queryResults.asMappedResults();
            
            // Add a sublist to display the results
            var sublist = form.addSublist({
                id: 'custpage_sublist',
                type: serverWidget.SublistType.LIST,
                label: 'Transaction Results'
            });

            // Add fields to the sublist
            sublist.addField({
                id: 'custpage_id',
                type: serverWidget.FieldType.TEXT,
                label: 'ID'
            });
            sublist.addField({
                id: 'custpage_tranid',
                type: serverWidget.FieldType.TEXT,
                label: 'Transaction ID'
            });
            sublist.addField({
                id: 'custpage_entity',
                type: serverWidget.FieldType.TEXT,
                label: 'Entity'
            });
            sublist.addField({
                id: 'custpage_total',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Total'
            });

            // Populate the sublist with data
            for (var i = 0; i < records.length; i++) {
                sublist.setSublistValue({
                    id: 'custpage_id',
                    line: i,
                    value: records[i].id
                });
                sublist.setSublistValue({
                    id: 'custpage_tranid',
                    line: i,
                    value: records[i].tranid
                });
                sublist.setSublistValue({
                    id: 'custpage_entity',
                    line: i,
                    value: records[i].entity
                });
                sublist.setSublistValue({
                    id: 'custpage_total',
                    line: i,
                    value: records[i].total
                });
            }

            // Display the form
            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});
