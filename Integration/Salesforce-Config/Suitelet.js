/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/file', 'N/search', 'N/log'], function (serverWidget, record, file, search, log) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create a form
            var form = serverWidget.createForm({
                title: 'Salesforce Configuration'
            });

            // Add Record Type dropdown
            var recordTypeField = form.addField({
                id: 'custpage_record_type',
                type: serverWidget.FieldType.SELECT,
                label: 'Select Record Type'
            });

            // Add options for Record Type dropdown
            recordTypeField.addSelectOption({ value: '', text: '' });
            recordTypeField.addSelectOption({ value: 'salesorder', text: 'Sales Order' });
            recordTypeField.addSelectOption({ value: 'opportunity', text: 'Opportunity' });
            recordTypeField.addSelectOption({ value: 'lead', text: 'Lead' });

            // Add Pricebook ID field
            form.addField({
                id: 'custpage_pricebook_id',
                type: serverWidget.FieldType.TEXT,
                label: 'Pricebook ID'
            });

            // Add sublist for field mappings
            var sublist = form.addSublist({
                id: 'custpage_field_mappings',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Field Mappings'
            });

            sublist.addField({
                id: 'custpage_ns_field',
                type: serverWidget.FieldType.SELECT,
                label: 'NetSuite Field'
            });

            sublist.addField({
                id: 'custpage_sf_field',
                type: serverWidget.FieldType.TEXT,
                label: 'Salesforce Field'
            });

            // Populate NetSuite fields if Record Type is selected
            if (context.request.parameters.custpage_record_type) {
                populateNetSuiteFields(sublist, context.request.parameters.custpage_record_type);
                recordTypeField.defaultValue = context.request.parameters.custpage_record_type;
            }

           
            form.addSubmitButton({
                label: 'Save Configuration'
            });

            // Client script for refresh button
            form.clientScriptModulePath = './CS-Salesforce-config.js';

            // Display the form
            context.response.writePage(form);

        } else if (context.request.method === 'POST') {
            // Get the submitted data
            var pricebookId = context.request.parameters.custpage_pricebook_id;

            var fieldMappings = {};
            var lineCount = context.request.getLineCount({ sublistId: 'custpage_field_mappings' });
            for (var i = 0; i < lineCount; i++) {
                var nsField = context.request.getSublistValue({
                    sublistId: 'custpage_field_mappings',
                    fieldId: 'custpage_ns_field',
                    line: i
                });
                var sfField = context.request.getSublistValue({
                    sublistId: 'custpage_field_mappings',
                    fieldId: 'custpage_sf_field',
                    line: i
                });

                if (nsField && sfField) {
                    fieldMappings[nsField] = sfField;
                }
            }

            // Create the configuration object
            var config = {
                pricebookId: pricebookId,
                fieldMappings: fieldMappings
            };

            // Convert the configuration object to JSON
            var configJSON = JSON.stringify(config);

           
            var configFile = file.create({
                name: 'salesforce_user_settings.json',
                fileType: file.Type.JSON,
                contents: configJSON,
                folder: -15 // Internal ID of the SuiteScripts folder
            });

            configFile.save();

            // Send a success message
            context.response.write('Configuration saved successfully!');
        }
    }

    function populateNetSuiteFields(sublist, recordType) {
        try {
            var recordInstance = record.create({
                type: recordType
            });

            var fieldNames = recordInstance.getFields();
            fieldNames.forEach(function (fieldName) {
                sublist.getField('custpage_ns_field').addSelectOption({
                    value: fieldName,
                    text: fieldName
                });
            });
        } catch (e) {
            log.error('Error populating fields', e.toString());
        }
    }

    return {
        onRequest: onRequest
    };
});
