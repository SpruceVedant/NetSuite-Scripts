/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url'], function(url) {

    function pageInit(context) {
        
    }

    function redirectToUpload() {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript794', 
            deploymentId: 'customdeploy1', 
            returnExternalUrl: false
        });

        window.location.href = suiteletUrl;
    }

    return {
        pageInit: pageInit,
        redirectToUpload: redirectToUpload 
    };
});
