/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/log'], function (serverWidget, search, record, log) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget.createForm({
                title: 'NetSuite Utilities Dashboard'
            });

            // Record Search
            var searchFieldGroup = form.addFieldGroup({
                id: 'searchgroup',
                label: 'Record Search'
            });

            var recordTypeField = form.addField({
                id: 'recordtype',
                type: serverWidget.FieldType.SELECT,
                label: 'Record Type',
                container: 'searchgroup'
            });
            recordTypeField.addSelectOption({ value: '', text: '' });
            recordTypeField.addSelectOption({ value: 'customer', text: 'Customer' });
            recordTypeField.addSelectOption({ value: 'salesorder', text: 'Sales Order' });

            form.addField({
                id: 'recordid',
                type: serverWidget.FieldType.TEXT,
                label: 'Record ID or Transaction Number',
                container: 'searchgroup'
            });

            // Mass Update
            var massUpdateGroup = form.addFieldGroup({
                id: 'massupdategroup',
                label: 'Mass Update'
            });

            var recordTypeMassUpdateField = form.addField({
                id: 'recordtype_massupdate',
                type: serverWidget.FieldType.SELECT,
                label: 'Record Type',
                container: 'massupdategroup'
            });
            recordTypeMassUpdateField.addSelectOption({ value: '', text: '' });
            recordTypeMassUpdateField.addSelectOption({ value: 'customer', text: 'Customer' });
            recordTypeMassUpdateField.addSelectOption({ value: 'salesorder', text: 'Sales Order' });

            form.addField({
                id: 'fieldid',
                type: serverWidget.FieldType.TEXT,
                label: 'Field ID',
                container: 'massupdategroup'
            });
            form.addField({
                id: 'fieldvalue',
                type: serverWidget.FieldType.TEXT,
                label: 'Field Value',
                container: 'massupdategroup'
            });

            // Script Execution Log Viewer
            var logViewerGroup = form.addFieldGroup({
                id: 'logviewergroup',
                label: 'Script Execution Log Viewer'
            });
            form.addField({
                id: 'scriptid',
                type: serverWidget.FieldType.TEXT,
                label: 'Script ID',
                container: 'logviewergroup'
            });

            form.addSubmitButton({
                label: 'Execute'
            });

            context.response.writePage(form);
        } else {
            var request = context.request;
            var recordType = request.parameters.recordtype;
            var recordId = request.parameters.recordid;
            var recordTypeMassUpdate = request.parameters.recordtype_massupdate;
            var fieldId = request.parameters.fieldid;
            var fieldValue = request.parameters.fieldvalue;
            var scriptId = request.parameters.scriptid;

            if (recordType && recordId) {
                var internalId = getInternalId(recordType, recordId);
                if (internalId) {
                    var recordObj = record.load({
                        type: recordType,
                        id: internalId
                    });
                    context.response.write('Record Details: ' + JSON.stringify(recordObj));
                } else {
                    context.response.write('Record not found.');
                }
            }

            if (recordTypeMassUpdate && fieldId && fieldValue) {
                var searchResult = search.create({
                    type: recordTypeMassUpdate,
                    filters: [],
                    columns: ['internalid']
                }).run().getRange({
                    start: 0,
                    end: 1000
                });

                searchResult.forEach(function (result) {
                    var recordObj = record.load({
                        type: recordTypeMassUpdate,
                        id: result.id
                    });
                    recordObj.setValue({
                        fieldId: fieldId,
                        value: fieldValue
                    });
                    recordObj.save();
                });

                context.response.write('Mass Update Completed.');
            }

            if (scriptId) {
                try {
                    var scriptLogSearch = search.create({
                        type: search.Type.SCRIPT_DEPLOYMENT,
                        filters: [
                            ['script.scriptid', 'is', scriptId]
                        ],
                        columns: ['internalid', 'scriptid', 'title', 'status']
                    }).run().getRange({
                        start: 0,
                        end: 100
                    });

                    if (scriptLogSearch.length > 0) {
                        var scriptLogs = scriptLogSearch.map(function (result) {
                            return {
                                internalid: result.getValue('internalid'),
                                scriptid: result.getValue('scriptid'),
                                title: result.getValue('title'),
                                status: result.getValue('status')
                            };
                        });

                        context.response.write('Script Logs: ' + JSON.stringify(scriptLogs));
                    } else {
                        context.response.write('No logs found for script ID: ' + scriptId);
                    }
                } catch (e) {
                    log.error({
                        title: 'Error fetching script logs',
                        details: e
                    });
                    context.response.write('Error fetching script logs: ' + e.message);
                }
            }
        }
    }

    function getInternalId(recordType, recordIdOrTransNumber) {
        var internalId;
        if (isNaN(recordIdOrTransNumber)) {  // If not a numeric ID, assume it's a transaction number
            var searchResult = search.create({
                type: recordType,
                filters: [['tranid', 'is', recordIdOrTransNumber]],
                columns: ['internalid']
            }).run().getRange({
                start: 0,
                end: 1
            });
            if (searchResult.length > 0) {
                internalId = searchResult[0].getValue({ name: 'internalid' });
            }
        } else {
            internalId = recordIdOrTransNumber;
        }
        return internalId;
    }

    return {
        onRequest: onRequest
    };
});
