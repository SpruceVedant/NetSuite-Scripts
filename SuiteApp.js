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


