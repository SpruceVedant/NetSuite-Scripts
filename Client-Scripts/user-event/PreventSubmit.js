/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
    function () {
        function beforeSubmit(scriptContext) {
            if (scriptContext.type === scriptContext.UserEventType.CREATE || scriptContext.type === scriptContext.UserEventType.EDIT) {
                var newRecord = scriptContext.newRecord;
                var email = newRecord.getValue({ fieldId: 'email' });

                if (!email) {
                    throw new Error('The Customer record cannot be submitted without an email address.');
                }
            }
        }

        return {
            beforeSubmit: beforeSubmit
        };
    });
