/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/task', 'N/runtime', 'N/log', 'N/url'], function(serverWidget, task, runtime, log, url) {

    function onRequest(context) {
        var form = serverWidget.createForm({
            title: 'Sync Data to Salesforce'
        });

        // Add Sync Option field
        var selectField = form.addField({
            id: 'custpage_sync_option',
            type: serverWidget.FieldType.SELECT,
            label: 'Select Sync Option'
        });

        if (selectField) {
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
        }

        // Add Date Range fields
        form.addField({
            id: 'custpage_date_from',
            type: serverWidget.FieldType.DATE,
            label: 'From Date'
        });

        form.addField({
            id: 'custpage_date_to',
            type: serverWidget.FieldType.DATE,
            label: 'To Date'
        });

        // Add Field Mapping field
        form.addField({
            id: 'custpage_field_mapping',
            type: serverWidget.FieldType.LONGTEXT,
            label: 'Field Mapping (JSON)'
        });

        // Add Sync Frequency field
        var syncFrequencyField = form.addField({
            id: 'custpage_sync_frequency',
            type: serverWidget.FieldType.SELECT,
            label: 'Sync Frequency'
        });

        if (syncFrequencyField) {
            syncFrequencyField.addSelectOption({
                value: 'daily',
                text: 'Daily'
            });
            syncFrequencyField.addSelectOption({
                value: 'weekly',
                text: 'Weekly'
            });
            syncFrequencyField.addSelectOption({
                value: 'monthly',
                text: 'Monthly'
            });
        }

        // Add Email Notifications field
        form.addField({
            id: 'custpage_email_notifications',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Email Notifications'
        });

        // Add Logging Level field
        var loggingLevelField = form.addField({
            id: 'custpage_logging_level',
            type: serverWidget.FieldType.SELECT,
            label: 'Logging Level'
        });

        if (loggingLevelField) {
            loggingLevelField.addSelectOption({
                value: 'basic',
                text: 'Basic'
            });
            loggingLevelField.addSelectOption({
                value: 'detailed',
                text: 'Detailed'
            });
        }

        // Add Error Handling field
        var errorHandlingField = form.addField({
            id: 'custpage_error_handling',
            type: serverWidget.FieldType.SELECT,
            label: 'Error Handling'
        });

        if (errorHandlingField) {
            errorHandlingField.addSelectOption({
                value: 'stop',
                text: 'Stop on First Error'
            });
            errorHandlingField.addSelectOption({
                value: 'continue',
                text: 'Continue with Warnings'
            });
        }

        // Add Retry Failed Syncs field
        form.addField({
            id: 'custpage_retry_failed_syncs',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Retry Failed Syncs'
        });

        form.addSubmitButton({
            label: 'Sync'
        });

        if (context.request.method === 'POST') {
            var syncOption = context.request.parameters.custpage_sync_option;
            var dateFrom = context.request.parameters.custpage_date_from;
            var dateTo = context.request.parameters.custpage_date_to;
            var fieldMapping = context.request.parameters.custpage_field_mapping;
            var syncFrequency = context.request.parameters.custpage_sync_frequency;
            var emailNotifications = context.request.parameters.custpage_email_notifications === 'T';
            var loggingLevel = context.request.parameters.custpage_logging_level;
            var errorHandling = context.request.parameters.custpage_error_handling;
            var retryFailedSyncs = context.request.parameters.custpage_retry_failed_syncs === 'T';

            log.debug('Sync Option Selected', syncOption);
            log.debug('Date Range', 'From: ' + dateFrom + ', To: ' + dateTo);
            log.debug('Field Mapping', fieldMapping);
            log.debug('Sync Frequency', syncFrequency);
            log.debug('Email Notifications', emailNotifications);
            log.debug('Logging Level', loggingLevel);
            log.debug('Error Handling', errorHandling);
            log.debug('Retry Failed Syncs', retryFailedSyncs);

            try {
                var taskId = startScheduledScript(syncOption, dateFrom, dateTo, fieldMapping, syncFrequency, emailNotifications, loggingLevel, errorHandling, retryFailedSyncs);
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
                statusField.defaultValue += getProcessingHtml();
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
                statusField.defaultValue += getProcessingHtml();
            }
        }

        context.response.writePage(form);
    }

    function startScheduledScript(syncOption, dateFrom, dateTo, fieldMapping, syncFrequency, emailNotifications, loggingLevel, errorHandling, retryFailedSyncs) {
        log.debug('Starting Scheduled Script with Parameters', {
            syncOption: syncOption,
            dateFrom: dateFrom,
            dateTo: dateTo,
            fieldMapping: fieldMapping,
            syncFrequency: syncFrequency,
            emailNotifications: emailNotifications,
            loggingLevel: loggingLevel,
            errorHandling: errorHandling,
            retryFailedSyncs: retryFailedSyncs
        });

        var scriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: 'customscript806', 
            deploymentId: 'customdeploy1', 
            params: {
                custscript_sync_option: syncOption,
                custscript_date_from: dateFrom,
                custscript_date_to: dateTo,
                custscript_field_mapping: fieldMapping,
                custscript_sync_frequency: syncFrequency,
                custscript_email_notifications: emailNotifications,
                custscript_logging_level: loggingLevel,
                custscript_error_handling: errorHandling,
                custscript_retry_failed_syncs: retryFailedSyncs
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

    function getProcessingHtml() {
        return '<style>' +
                '.sync-container {' +
                    'display: flex;' +
                    'align-items: center;' +
                    'justify-content: center;' +
                    'height: 100vh;' +
                '}' +
                '.icon {' +
                    'width: 100px;' +
                    'height: 100px;' +
                    'margin: 0 20px;' +
                '}' +
                '.line {' +
                    'width: 200px;' +
                    'height: 5px;' +
                    'background: linear-gradient(to right, #3498db 50%, #f3f3f3 50%);' +
                    'background-size: 200% 100%;' +
                    'animation: lineAnim 2s linear infinite;' +
                '}' +
                '@keyframes lineAnim {' +
                    '0% { background-position: 0 0; }' +
                    '100% { background-position: -100% 0; }' +
                '}' +
                '.progress-bar {' +
                    'width: 100%;' +
                    'background-color: #f3f3f3;' +
                '}' +
                '.progress-bar-fill {' +
                    'width: 0;' +
                    'height: 20px;' +
                    'background-color: #3498db;' +
                    'animation: fillProgress 10s linear infinite;' +
                '}' +
                '@keyframes fillProgress {' +
                    '0% { width: 0; }' +
                    '100% { width: 100%; }' +
                '}' +
                '</style>' +
                '<div class="sync-container">' +
                    '<img src="https://cdn.worldvectorlogo.com/logos/netsuite.svg" alt="NetSuite" class="icon">' +
                    '<div class="line"></div>' +
                    '<img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" alt="Salesforce" class="icon">' +
                '</div>' +
                '<div class="progress-bar">' +
                    '<div class="progress-bar-fill"></div>' +
                '</div>';
    }

    return {
        onRequest: onRequest
    };
});
