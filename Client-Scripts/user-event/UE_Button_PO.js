/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(["N/record", "N/ui/serverWidget", "N/runtime"], /**
 * @param{record} record
 */ (record, serverWidget, runtime) => {
  const beforeLoad = (scriptContext) => {
    var Record_obj = scriptContext.newRecord;
    var user = runtime.getCurrentUser().id;
    var checkBoxValue = Record_obj.getValue({
      fieldId: "custbody_bfl_dropship",
    });
 
    var form = scriptContext.form;
    var user_role = runtime.getCurrentUser().role;
 
    form.clientScriptFileId = 8809;
 
    var sendForApprovalValue = form.addButton({
      id: "custpage_approvalrequest",
      label: "Send PO For Approval",
      functionName: "sendForApproval()",
    });
 
    if (scriptContext.type === "view" && checkBoxValue === true) {
      sendForApprovalValue.isHidden = false;
    } else {
      sendForApprovalValue.isHidden = true;
    }
    if (user_role == 1110) {
      var approvePOValue = form.addButton({
        id: "custpage_approve_button",
        label: "Approve PO",
        functionName: "approve_purchae_order()",
      });
 
      var rejectPOValue = form.addButton({
        id: "custpage_reject_button",
        label: "Reject PO",
        functionName: "reject_purchase_order()",
      });
    }
  };
 
  const beforeSubmit = (scriptContext) => {
    var user = runtime.getCurrentUser().id;
 
    var newRecord = scriptContext.newRecord;
    newRecord.setValue({
      fieldId: "employee",
      value: user,
    });
  };
 
  const afterSubmit = (scriptContext) => {};
 
  return { 
  beforeLoad,
  beforeSubmit,
  afterSubmit };
});
 