/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(["N/email", "N/record", "N/runtime", "N/render"], function (
    email,
    record,
    runtime,
    render
  ) {
    function getInputData() {
    
      var selectedInvoices = runtime.getCurrentScript().getParameter({
        name: "custscript_so_id",
      });
      log.debug("Invoice IDs:", selectedInvoices);
  
      if (!selectedInvoices) {
        log.error("No invoices selected.");
        return [];
      }
  
      
      var invoiceIds = selectedInvoices.split(",");
      return invoiceIds;
    }
  
    function map(context) {
      var invoiceId = context.value;
      log.debug('map invoiceId' ,invoiceId)
  
     
      var invoiceRecord = record.load({
        type: record.Type.INVOICE,
        id: invoiceId,
        isDynamic: true,
      });
  
      
      var customerId = invoiceRecord.getValue({
        fieldId: "entity",
      });
      log.debug('customerId' , customerId)
  
      
      var transactionFile = render.transaction({
        entityId: parseInt(invoiceId),
        printMode: render.PrintMode.PDF,
        formId: 292,
        inCustLocale: true,
      });
  
      log.debug("transactionFile:", transactionFile);
      email.send({
        author: -5,
        recipients: -5,
        subject: "Invoice pdf attachment email",
        body: "PDF file attached, record(s) found.",
        attachments: [transactionFile]
      });
  
     
    //   context.write(customerId, 1);
    }
  
    function summarize(summary) {
     
      log.debug("Emails Sent Successfully!");
    }
  
    return {
      getInputData: getInputData,
      map: map,
      summarize: summarize,
    };
  });
  