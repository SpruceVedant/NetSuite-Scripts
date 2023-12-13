/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(["N/email", "N/record", "N/runtime", "N/render", "N/file"], function (
    email,
    record,
    runtime,
    render,
    file
  ) {
    function execute(context) {
      var selectedInvoices = runtime.getCurrentScript().getParameter({
        name: "custscript_invoice_arr",
      });
   
      log.debug("Selected Invoices:", selectedInvoices);
      if (!selectedInvoices) {
        log.error("No invoices selected.");
        return;
      }
      var invoiceIds = selectedInvoices.split(",");
      log.debug("Invoice IDs:", invoiceIds);
   
      var firstInvoiceId = invoiceIds[0];
      var invoiceRecord = record.load({
        type: record.Type.INVOICE,
        id: firstInvoiceId,
        isDynamic: true,
      });
   
      var customerId = invoiceRecord.getValue({
        fieldId: "entity",
      });

      var attachments = [];
      var bodyMail = "These are the invoices: ";
   
      for (var i = 0; i < invoiceIds.length; i++) {
        log.debug("Processing Invoice ID:", invoiceIds[i]);
        var transactionFile = render.transaction({
          entityId: parseInt(invoiceIds[i]),
          printMode: render.PrintMode.PDF,
          formId: 292,
          inCustLocale: true,
        });
        log.debug("pdf file:", transactionFile);
        email.send({
          author: -5,
          recipients: -5,
          subject: "Invoice pdf attachment email",
          body: "PDF file attached, record(s) found.",
          attachments: [transactionFile],
        });
      }
   
      log.debug("Email Sent Successfully!");
    }
   
    return { execute: execute };
  });
   