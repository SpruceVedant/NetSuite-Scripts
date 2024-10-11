/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope SameAccount
*/
define(['N/currentRecord', 'N/email', 'N/runtime', 'N/record', 'N/url', 'N/search'],
 
function(currentRecord, email, runtime, record, url, search) {
	var objRec = currentRecord.get();
	 function pageInit(scriptContext) {
		}
     function sendForApproval(scriptContext) {
		 var idRec = objRec.id;
		 log.debug('id:',objRec);
		  var otherId = record.submitFields({
				type: record.Type.PURCHASE_ORDER,
				id: idRec,
				values: {
					'custbody_app_status': 2,
					'approvalstatus': 1
				}
			});
 
       location.reload();
		 var user = runtime.getCurrentUser().id;
		 var fieldLookUp = search.lookupFields({
              type: search.Type.PURCHASE_ORDER,
              id: idRec,
              columns: ['tranid']
            });
		  var poId = fieldLookUp.tranid;
		   var senderId = user;
           var recipientId = -5;
		   var scheme = 'https://';
           var host = url.resolveDomain({
            hostType: url.HostType.APPLICATION
           });
		   var output = url.resolveRecord({
                recordType: 'purchaseorder',
                recordId: idRec,
                isEditMode: true
       });
 
       var sub = "#" +poId+ " is pending for Approval";
	    var myURL = scheme + host + output;
		var msg = "Pending POs: ";
        msg+= "<a href= "+myURL+">"+poId+"</a>"
 
	      log.debug('mailbody:', msg);
          log.debug('sub:', sub);
               email.send({
                author: senderId,
                recipients: recipientId,
                subject: sub,
                body: msg
            });


    }

	function approve_purchae_order(scriptContext) {
		 var objRec = currentRecord.get();
		 var idRec = objRec.id;		
		 var user = runtime.getCurrentUser().id;
		 log.debug('user:',user);

		var approve = record.submitFields({
				type: record.Type.PURCHASE_ORDER,
				id: idRec,
				values: {
					'custbody_app_status': 1,
					'approvalstatus': 2
				}
			});
         location.reload();

    }

	function reject_purchase_order(scriptContext) {
		 var objRec = currentRecord.get();
		 var idRec = objRec.id;
		 log.debug('id:',objRec);
		 var user = runtime.getCurrentUser().id;
		 log.debug('user:',user);
		var reason = prompt("Enter The Reason For Your Rejection")
		var reject = record.submitFields({
				type: record.Type.PURCHASE_ORDER,
				id: idRec,
				values: {
					'custbody_app_status': 3,
                    'approvalstatus': 3,
					'custbody2': reason
				}
			});
				location.reload();
			 var senderId = user;
             var recipientId = -5;
			email.send({
                author: senderId,
                recipients: recipientId,
                subject: "PO is rejected",
                body: 'Your PO'+ idRec + 'is rejected due to reason: '+ reason 
            });
 // experience Fun friday
    }

 
    return {
        pageInit: pageInit,
        sendForApproval: sendForApproval,
		approve_purchae_order: approve_purchae_order,
		reject_purchase_order: reject_purchase_order
		};
});
