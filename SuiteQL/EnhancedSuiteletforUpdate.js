/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/query', 'N/record', 'N/log'], function(serverWidget, query, record, log) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            createForm(context);
        } else if (context.request.method === 'POST') {
            handleUpdate(context);
        }
    }

    function createForm(context) {
        var form = serverWidget.createForm({
            title: 'Update Records'
        });

        form.addField({
            id: 'custpage_update_statement',
            type: serverWidget.FieldType.TEXTAREA,
            label: 'Update Statement'
        }).isMandatory = true;

        form.addSubmitButton({
            label: 'Execute'
        });

        context.response.writePage(form);
    }

    function handleUpdate(context) {
        var form = serverWidget.createForm({
            title: 'Update Records'
        });

        var updateStatement = context.request.parameters.custpage_update_statement;
        log.debug('Request Statement', updateStatement);

        var statusField = form.addField({
            id: 'custpage_status',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Status'
        });

        try {
            var parsedStatement = parseUpdateStatement(updateStatement);

            if (parsedStatement) {
                var recordType = parsedStatement.table;
                if (!isValidRecordType(recordType)) {
                    throw new Error('Invalid record type: ' + recordType);
                }

                var invalidFields = [];
                parsedStatement.setFields.forEach(function(field) {
                    if (!isValidField(recordType, field.fieldId)) {
                        invalidFields.push(field.fieldId);
                    }
                });

                if (invalidFields.length > 0) {
                    throw new Error('Invalid fields: ' + invalidFields.join(', '));
                }

                var sql = 'SELECT id FROM ' + sanitize(recordType) + ' WHERE ' + parsedStatement.where;
                log.debug('Generated SQL', sql);
                var results = query.runSuiteQL({
                    query: sql
                }).asMappedResults();

                log.debug('Query Results', results);

                if (results.length === 0) {
                    statusField.defaultValue = '<p style="color: red;">No records found matching the criteria.</p>';
                } else {
                    results.forEach(function(result) {
                        var recordId = result.id;

                        var rec = record.load({
                            type: recordType,
                            id: recordId
                        });

                        parsedStatement.setFields.forEach(function(field) {
                            rec.setValue({
                                fieldId: sanitize(field.fieldId),
                                value: field.value
                            });
                        });

                        rec.save();
                        log.debug('Record Updated', 'Record ID: ' + recordId);
                    });

                    statusField.defaultValue = '<p style="color: green;">Records updated successfully.</p>';
                }
            } else {
                statusField.defaultValue = '<p style="color: red;">Invalid update statement.</p>';
            }
        } catch (e) {
            log.error('Error Updating Records', e.toString());
            statusField.defaultValue = '<p style="color: red;">Error updating records: ' + e.toString() + '</p>';
        }

        context.response.writePage(form);
    }

    function parseUpdateStatement(statement) {
        var updateRegex = /UPDATE\s+(\w+)\s+SET\s+(.+)\s+WHERE\s+(.+);?/i;
        var match = statement.match(updateRegex);
        if (match) {
            var table = match[1];
            var setClause = match[2];
            var whereClause = match[3];

            var setFields = setClause.split(',').map(function(setField) {
                var parts = setField.split('=');
                return {
                    fieldId: parts[0].trim(),
                    value: parts[1].trim().replace(/'/g, '')
                };
            });

            return {
                table: table,
                setFields: setFields,
                where: whereClause
            };
        }
        return null;
    }

    function sanitize(input) {
        return input.replace(/[^a-zA-Z0-9_\.]/g, '');
    }

    function isValidRecordType(recordType) {
        // Convert the allowed record types to an array
        var allowedRecordTypes = ['customer', 'salesorder', 'invoice'];
        return allowedRecordTypes.includes(recordType);
    }

    function isValidField(recordType, fieldId) {
        // Define valid fields for each record type
        var allowedFields = {
            customer: ['entityid', 'companyname'],
            salesorder: ['status', 'total'],
            invoice: ['amount', 'status']
        };
        return allowedFields[recordType] && allowedFields[recordType].includes(fieldId);
    }

    return {
        onRequest: onRequest
    };
});
