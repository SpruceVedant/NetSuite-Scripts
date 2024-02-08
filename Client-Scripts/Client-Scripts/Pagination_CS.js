/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/url'], function (url) {

    function onButtonClick(action, currentPage) {
        function pageInit(scriptContext) {
            
        }
        var newPage = currentPage;
        if (action === 'previous') {
            newPage = Math.max(1, currentPage - 1);
        } else if (action === 'next') {
            newPage = currentPage + 1;
        }

        var currentUrl = window.location.href;
        var newUrl = currentUrl.replace(/&custpage_current_page=\d+/g, '') + '&custpage_current_page=' + newPage;

        window.location.href = newUrl;
    }

    return {
        pageInit: pageInit,
        onButtonClick: onButtonClick
    };
});
