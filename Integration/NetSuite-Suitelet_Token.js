/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/redirect', 'N/config'], function(serverWidget, redirect, config) {
    
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget.createForm({
                title: 'Enter Salesforce Credentials'
            });
            
            form.addField({
                id: 'custpage_salesforce_token',
                type: serverWidget.FieldType.TEXT,
                label: 'Salesforce Access Token'
            });
            
            form.addSubmitButton({
                label: 'Save Token'
            });
            
            context.response.writePage(form);
        } else {
            
            var request = context.request;
            var token = request.parameters.custpage_salesforce_token;
            
            var scriptObj = config.load({
                type: config.Type.SCRIPT
            });
            scriptObj.setValue({
                fieldId: 'custscript_salesforce_token',
                value: token
            });
            scriptObj.save();
            
            
            var form = serverWidget.createForm({
                title: 'Success'
            });
            form.addField({
                id: 'custpage_message',
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            }).defaultValue = '<p>Token saved successfully.</p>';
            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});
