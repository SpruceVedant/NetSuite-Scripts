/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define([],
   function() {
	   function beforeLoad(scriptContext) {
		    log.debug('Script A - beforeLoad', 'Before load event triggered in Script A');
	   }
	   
	   function afterSubmit(scriptContext) {
		    log.debug('Script A - afterSubmit', 'After submit event triggered in Script A');
	   }
	   
	   return{
		   beforeLoad : beforeLoad,
		   afterSubmit : afterSubmit
	   }
   }
 );
 // Isolated scripts to check trigger points