/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([],
    function () {
      function pageInit(scriptContext) {
        var suiteletURL = '/app/site/hosting/scriptlet.nl?script=808&customdeploy1';
        window.open(suiteletURL, '_blank');
      }
  
      return {
        pageInit: pageInit
      };
    });
