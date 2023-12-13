/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["N/currentRecord", "N/format"], /**
 * @param{currentRecord} currentRecord
 */ function (currentRecord, format) {
  var customerId;
  var invoiceDate;
  var invoiceNumber;
 
  function fieldChanged(scriptContext) {
    if (
      scriptContext.fieldId == "custpage_customer" || scriptContext.fieldId == "custpage_invoice_date" || scriptContext.fieldId == "custpage_invoice_number"
    ) {
      var objRecord = scriptContext.currentRecord;
 
      customerId = objRecord.getValue({
        fieldId: "custpage_customer",
      });
 
      invoiceDate = objRecord.getValue({
        fieldId: "custpage_invoice_date",
      });
 
      invoiceNumber = objRecord.getValue({
        fieldId: "custpage_invoice_number",
      });
 
      if (invoiceDate) {
        var dateFormatted = format.format({
          value: invoiceDate,
          type: format.Type.DATE,
        });
      }
 
      var url =
        "https://tstdrv2816544.app.netsuite.com/app/site/hosting/scriptlet.nl?script=808&deploy=1";
 
      if (customerId) {
        url += "&custpage_customer=" + customerId;
      }
      if (invoiceDate) {
        url += "&custpage_invoice_date=" + dateFormatted;
      }
 
      if (invoiceNumber) {
        url += "&custpage_invoice_number=" + invoiceNumber;
      }
      window.open(url, "_self");
    }
  }
 
  return {
    fieldChanged: fieldChanged,
  };
});