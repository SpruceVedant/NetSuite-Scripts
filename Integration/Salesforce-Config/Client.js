/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url', 'N/currentRecord'], function (url, currentRecord) {

    function pageInit(context) {
        var recordTypeField = document.getElementById('custpage_record_type');
        if (recordTypeField) {
            recordTypeField.addEventListener('change', refreshPage);
        }
    }

    function refreshPage() {
        var record = currentRecord.get();
        var recordType = record.getValue('custpage_record_type');
        var refreshUrl = url.resolveScript({
            scriptId: 'customscript794', // Update with your Suitelet script ID
            deploymentId: 'customdeploy1', // Update with your Suitelet deployment ID
            params: {
                custpage_record_type: recordType
            }
        });
        window.location.href = refreshUrl;
    }

    return {
        pageInit: pageInit
    };
});
