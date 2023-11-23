/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */ 
define(['N/ui/serverWidget'],
  function (serverWidget) {
    function beforeLoad(scriptContext) {
     var button_object =  scriptContext.form;
	 
	 button_object.addButton({
    id : 'custpage_buttonid',
    label : 'Widget Button'
});

    }

    return {
      beforeLoad: beforeLoad
    };
  });
// Deployed as AddButton.js or UE_AddButton
