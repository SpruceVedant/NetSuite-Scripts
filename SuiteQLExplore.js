//Suitelet which displays SuiteQL query results in a table using Suitelet functions        

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/query', 'N/ui/serverWidget', 'N/log'], function(query, serverWidget, log) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            createForm(context);
        } else {
            handleFormSubmission(context);
        }
    }

    function createForm(context) {
        var form = serverWidget.createForm({
            title: 'SuiteQL Tool'
        });

        form.addField({
            id: 'custpage_query',
            type: serverWidget.FieldType.TEXTAREA,
            label: 'SuiteQL Query'
        });

        form.addSubmitButton({
            label: 'Run Query'
        });

        context.response.writePage(form);
    }

    function handleFormSubmission(context) {
        var request = context.request;
        var suiteqlQuery = request.parameters.custpage_query;

        var form = serverWidget.createForm({
            title: 'SuiteQL Tool - Results'
        });

        form.addField({
            id: 'custpage_query',
            type: serverWidget.FieldType.TEXTAREA,
            label: 'SuiteQL Query'
        }).defaultValue = suiteqlQuery;

        try {
            var queryResult = query.runSuiteQL({
                query: suiteqlQuery
            });

            var results = queryResult.asMappedResults();

            var sublist = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'Results'
            });

            if (results.length > 0) {
                // Add columns dynamically
                var columns = Object.keys(results[0]);
                for (var i = 0; i < columns.length; i++) {
                    sublist.addField({
                        id: 'custpage_' + columns[i].toLowerCase(),
                        type: serverWidget.FieldType.TEXT,
                        label: columns[i]
                    });
                }

                // Add rows
                for (var row = 0; row < results.length; row++) {
                    for (var col = 0; col < columns.length; col++) {
                        sublist.setSublistValue({
                            id: 'custpage_' + columns[col].toLowerCase(),
                            line: row,
                            value: results[row][columns[col]]
                        });
                    }
                }
            } else {
                sublist.addField({
                    id: 'custpage_noresults',
                    type: serverWidget.FieldType.TEXT,
                    label: 'No Results'
                }).defaultValue = 'No data found for the given query.';
            }
        } catch (e) {
            log.error('Error running query', e);

            form.addField({
                id: 'custpage_error',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Error'
            }).defaultValue = '<p style="color: red;">Error running query: ' + e.message + '</p>';
        }

        form.addSubmitButton({
            label: 'Run Query'
        });

        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});
