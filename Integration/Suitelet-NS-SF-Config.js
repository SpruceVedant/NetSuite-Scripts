/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/file', 'N/log'], function(serverWidget, file, log) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create the form
            var form = serverWidget.createForm({
                title: 'Salesforce Integration Configuration'
            });

            // Add fields to the form
            form.addField({
                id: 'custpage_client_id',
                type: serverWidget.FieldType.TEXT,
                label: 'Client ID'
            });

            form.addField({
                id: 'custpage_client_secret',
                type: serverWidget.FieldType.TEXT,
                label: 'Client Secret'
            });

            form.addField({
                id: 'custpage_username',
                type: serverWidget.FieldType.TEXT,
                label: 'Username'
            });

            form.addField({
                id: 'custpage_password',
                type: serverWidget.FieldType.PASSWORD,
                label: 'Password'
            });

            form.addField({
                id: 'custpage_security_token',
                type: serverWidget.FieldType.TEXT,
                label: 'Security Token'
            });

            form.addField({
                id: 'custpage_sync_accounts',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Sync Accounts'
            });

            form.addField({
                id: 'custpage_sync_contacts',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Sync Contacts'
            });

            form.addField({
                id: 'custpage_sync_opportunities',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Sync Opportunities'
            });

            form.addSubmitButton({
                label: 'Save Configuration'
            });

            context.response.writePage(form);

        } else {
            // Handle the form submission
            var clientId = context.request.parameters.custpage_client_id;
            var clientSecret = context.request.parameters.custpage_client_secret;
            var username = context.request.parameters.custpage_username;
            var password = context.request.parameters.custpage_password;
            var securityToken = context.request.parameters.custpage_security_token;
            var syncAccounts = context.request.parameters.custpage_sync_accounts === 'T';
            var syncContacts = context.request.parameters.custpage_sync_contacts === 'T';
            var syncOpportunities = context.request.parameters.custpage_sync_opportunities === 'T';

            var configData = {
                clientId: clientId,
                clientSecret: clientSecret,
                username: username,
                password: password,
                securityToken: securityToken,
                syncAccounts: syncAccounts,
                syncContacts: syncContacts,
                syncOpportunities: syncOpportunities
            };

            // Save the configuration to a JSON file
            var configFile = file.create({
                name: 'salesforce_integration_config.json',
                fileType: file.Type.JSON,
                contents: JSON.stringify(configData),
                folder: -15 // Use appropriate folder ID here
            });

            var fileId = configFile.save();

            log.debug('Configuration File ID', fileId);

            context.response.write('<html><body><h1>Configuration Saved Successfully</h1><p>Configuration file ID: ' + fileId + '</p></body></html>');
        }
    }

    return {
        onRequest: onRequest
    };
});
