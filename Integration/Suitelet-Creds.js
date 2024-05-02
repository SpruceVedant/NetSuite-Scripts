/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/log', 'N/ui/serverWidget', 'N/file'], function(log, serverWidget, file) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget.createForm({title: 'API Configuration'});

            form.addField({
                id: 'custpage_url',
                type: serverWidget.FieldType.URL,
                label: 'Endpoint URL'
            });

            form.addField({
                id: 'custpage_token',
                type: serverWidget.FieldType.LONGTEXT,
                label: 'OAuth Refresh Token'
            });

            form.addSubmitButton({label: 'Save Configuration'});
            context.response.writePage(form);
        } else {
            var url = context.request.parameters.custpage_url;
            var token = context.request.parameters.custpage_token;

            log.debug('Data Received', 'URL: ' + url + ', Token: ' + token);

            if (url && token) {
                var data = {
                    endpointUrl: url,
                    refreshToken: token
                };
                var jsonString = JSON.stringify(data);

                try {
                    var filePath = '/SuiteScripts/api_config.json';
                    var configFile = file.create({
                        name: 'api_config.json',
                        fileType: file.Type.JSON,
                        contents: jsonString,
                        folder: -15 
                    });
                    var fileId = configFile.save();
                    log.debug('File Saved Successfully', 'File ID: ' + fileId);
                } catch (e) {
                    log.error('Error Saving File', e.toString());
                }
            } else {
                log.error('Missing Data', 'URL or Token is missing.');
            }

            var form = serverWidget.createForm({title: 'Configuration Saved'});
            var successMessage = form.addField({
                id: 'custpage_success_msg',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Success Message'
            });
            successMessage.defaultValue = '<h2>Configuration saved successfully!</h2>';
            form.addButton({
                id: 'custpage_ok_button',
                label: 'OK',
                functionName: 'document.location.reload(true)'
            });
            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});
