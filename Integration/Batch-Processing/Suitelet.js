/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/task', 'N/runtime', 'N/log', 'N/url'], function(serverWidget, task, runtime, log, url) {

    function onRequest(context) {
        var form = serverWidget.createForm({
            title: 'Sync Data to Salesforce'
        });

        var selectField = form.addField({
            id: 'custpage_sync_option',
            type: serverWidget.FieldType.SELECT,
            label: 'Select Sync Option'
        });

        selectField.addSelectOption({
            value: 'sync_accounts',
            text: 'Sync Accounts'
        });
        selectField.addSelectOption({
            value: 'sync_customers',
            text: 'Sync Customers'
        });
        selectField.addSelectOption({
            value: 'sync_leads',
            text: 'Sync Leads'
        });
        selectField.addSelectOption({
            value: 'sync_items',
            text: 'Sync Items'
        });

        form.addSubmitButton({
            label: 'Sync'
        });

        if (context.request.method === 'POST') {
            var syncOption = context.request.parameters.custpage_sync_option;
            log.debug('Sync Option Selected', syncOption);

            try {
                var taskId = startScheduledScript(syncOption);
                log.debug('Scheduled Script Started', 'Task ID: ' + taskId);

                var statusField = form.addField({
                    id: 'custpage_sync_status',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                });

                statusField.defaultValue = '<p style="color: green;">Sync started successfully! Task ID: ' + taskId + '</p>';

                var processingUrl = url.resolveScript({
                    scriptId: runtime.getCurrentScript().id,
                    deploymentId: runtime.getCurrentScript().deploymentId,
                    params: {
                        taskId: taskId
                    }
                });

                statusField.defaultValue += '<script>setTimeout(function() { window.location = "' + processingUrl + '"; }, 5000);</script>';
                statusField.defaultValue += getLoaderHtml();
            } catch (error) {
                log.error('Sync Error', error.message);
                form.addField({
                    id: 'custpage_sync_status',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'custpage_sync_status'
                }).defaultValue = '<p style="color: red;">Sync failed: ' + error.message + '</p>';
            }
        } else if (context.request.parameters.taskId) {
            var taskId = context.request.parameters.taskId;
            var taskStatus = checkScheduledScriptStatus(taskId);
            log.debug('Task Status', 'Task ID: ' + taskId + ', Status: ' + taskStatus);

            var statusField = form.addField({
                id: 'custpage_sync_status',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'custpage_sync_status'
            });

            if (taskStatus === task.TaskStatus.COMPLETE) {
                statusField.defaultValue = '<p style="color: green;">Sync completed successfully!</p>';
            } else if (taskStatus === task.TaskStatus.FAILED) {
                statusField.defaultValue = '<p style="color: red;">Sync failed. Please check the logs for more details.</p>';
            } else {
                statusField.defaultValue = '<p style="color: blue;">Sync is in progress. Please wait...</p>';
                var processingUrl = url.resolveScript({
                    scriptId: runtime.getCurrentScript().id,
                    deploymentId: runtime.getCurrentScript().deploymentId,
                    params: {
                        taskId: taskId
                    }
                });
                statusField.defaultValue += '<script>setTimeout(function() { window.location = "' + processingUrl + '"; }, 5000);</script>';
                statusField.defaultValue += getLoaderHtml();
            }
        }

        context.response.writePage(form);
    }

    function startScheduledScript(syncOption) {
        log.debug('Starting Scheduled Script with Sync Option', syncOption);
        var scriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: 'customscript806', 
            deploymentId: 'customdeploy1', 
            params: {
                custscript_sync_option: syncOption
            }
        });

        log.debug('Scheduled Script Parameters', scriptTask.params);

        var taskId = scriptTask.submit();
        log.debug('Scheduled Script Submitted', 'Task ID: ' + taskId);
        return taskId;
    }

    function checkScheduledScriptStatus(taskId) {
        var scriptTaskStatus = task.checkStatus({
            taskId: taskId
        });

        log.debug('Scheduled Script Status', 'Task ID: ' + taskId + ', Status: ' + scriptTaskStatus.status);
        return scriptTaskStatus.status;
    }

    function getLoaderHtml() {
        return '<style>' +
                '.loader {' +
                    'border: 16px solid #f3f3f3;' +
                    'border-radius: 50%;' +
                    'border-top: 16px solid #3498db;' +
                    'width: 120px;' +
                    'height: 120px;' +
                    'animation: spin 2s linear infinite;' +
                    'position: fixed;' +
                    'left: 50%;' +
                    'top: 50%;' +
                    'transform: translate(-50%, -50%);' +
                '}' +
                '@keyframes spin {' +
                    '0% { transform: rotate(0deg); }' +
                    '100% { transform: rotate(360deg); }' +
                '}' +
                '</style>' +
                '<div class="loader"></div>';
    }

    return {
        onRequest: onRequest
    };
});
