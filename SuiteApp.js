// Interactive Deduplication Suitelet

// Scheduled-Script
/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function(search, record) {
    function execute(context) {
        var duplicateCheck = search.create({
            type: search.Type.CONTACT,
            filters: [
                ['email', search.Operator.ISNOTEMPTY, '']
            ],
            columns: [
                search.createColumn({
                    name: 'email',
                    summary: search.Summary.GROUP
                }),
                search.createColumn({
                    name: 'internalid',
                    summary: search.Summary.COUNT
                })
            ]
        });

        var resultRange = duplicateCheck.run().getRange({
            start: 0,
            end: 1000
        });

        for (var i = 0; i < resultRange.length; i++) {
            var result = resultRange[i];
            var email = result.getValue({
                name: 'email',
                summary: search.Summary.GROUP
            });
            var count = result.getValue({
                name: 'internalid',
                summary: search.Summary.COUNT
            });

            if (count > 1) {
                // Log, notify, or take action on the detected duplicate
                log.debug('Duplicate Found', 'Email: ' + email + ', Count: ' + count);
            }
        }
    }

    return {
        execute: execute
    };
});

 // Suitelet for Review Interface
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search'], function(serverWidget, search) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget.createForm({
                title: 'Duplicate Review Interface'
            });

            var sublist = form.addSublist({
                id: 'custpage_duplicates',
                type: serverWidget.SublistType.LIST,
                label: 'Potential Duplicates'
            });

            sublist.addField({
                id: 'custpage_email',
                type: serverWidget.FieldType.TEXT,
                label: 'Email'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });

            sublist.addField({
                id: 'custpage_count',
                type: serverWidget.FieldType.TEXT,
                label: 'Count'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });

            // Populate the sublist with duplicates (this should be replaced with actual search results)
            sublist.setLineItemValue('custpage_email', 1, 'duplicate@example.com');
            sublist.setLineItemValue('custpage_count', 1, '2');

            form.addSubmitButton({
                label: 'Process Selected'
            });

            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});

