/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    "N/currentRecord", "N/ui/serverWidget", "N/url", "N/https", "N/task", "N/search",] ,
     (currentRecord, serverWidget, url, http, task, search) => {
    function onRequest(scriptContext) {
      var invoice_sublist;
      if (scriptContext.request.method === "GET") {
        const customerId = scriptContext.request.parameters.custpage_customer;
        const onDate = scriptContext.request.parameters.custpage_on_date;
        const invoiceNumber = scriptContext.request.parameters.custpage_invoice_number;
   
        let form = serverWidget.createForm({
          title: "Filter Invoice",
        });
        form.clientScriptFileId = 8811;
   
        var customerField = form.addField({
          id: "custpage_customer",
          type: serverWidget.FieldType.SELECT,
          label: "Customer",
          source: "customer",
        });
   
        if (customerId) {
          customerField.defaultValue = customerId;
        }
        var onField = form.addField({
            id: 'custpage_on_date',
            type: serverWidget.FieldType.DATE,
            label: 'DATE'
        })

        if (onDate) {
            onField.defaultValue = onDate
        }

        form.addSubmitButton({
            label: "Search",
          });
          invoice_sublist = form.addSublist({id: "custpage_invoice_sublist", type: serverWidget.SublistType.LIST, label: "Invoices",});
          invoice_sublist.addField({ id: "custpage_checkbox", type: serverWidget.FieldType.CHECKBOX, label: "Select", });
          invoice_sublist.addField({ id: "custpage_tranid", type: serverWidget.FieldType.TEXT,label: "Invoice Number",});
          invoice_sublist.addField({ id: "custpage_internal_id",type: serverWidget.FieldType.TEXT,label: "Internal Id", });
          invoice_sublist.addField({ id: "custpage_customer_name",type: serverWidget.FieldType.TEXT,label: "Customer Name", });
          invoice_sublist.addField({ id: "custpage_trandate",type: serverWidget.FieldType.TEXT, label: "Transaction Date", });
          invoice_sublist.addField({ id: "custpage_amount",type: serverWidget.FieldType.TEXT,label: "Amount", });
          invoice_sublist.addField({ id: "custpage_status",type: serverWidget.FieldType.TEXT, label: "Status",});
   
        log.debug({
          title: "customer Id :",
          details: customerId,
        });
        
        if (customerId || onDate || invoiceNumber) {
            var filters = [["mainline", "is", "True"]];
            if (customerId) {
              filters.push("AND", ["entity", "anyof", customerId]);
            }
            if (onDate) {
              filters.push("AND", ["trandate", "on", onDate]);
            }
            if (invoiceNumber) {
              filters.push("AND", ["tranid", "is", invoiceNumber]);
            }
     
            var invoiceSearchObj = search.create({
              type: "invoice",
              filters: filters,
              columns: [
                search.createColumn({ name: "mainline", label: "*" }),
                                  search.createColumn({ name: "internalid", label: "Internal Id" }),
                                  search.createColumn({ name: "tranid", label: "Invoice Number" }),
                                  search.createColumn({ name: "trandate", label: "Date" }),
                                  search.createColumn({ name: "type", label: "Type" }),
                                  search.createColumn({ name: "entity", label: "Name" }),
                                  search.createColumn({ name: "amount", label: "Amount" }),
                                  search.createColumn({ name: "status", label: "Status" }),
              ],
            });
     
            var searchResultCount = invoiceSearchObj.runPaged().count;
            log.debug("invoiceSearchObj result count", searchResultCount);
     
            var resultSearch = invoiceSearchObj.run().getRange({ start: 0, end: 100 });
     
            resultSearch.forEach(function (result, i) {
              invoice_sublist.setSublistValue({
                id: "custpage_tranid",
                line: i,
                value: result.getValue({ name: "tranid" }),
              });
     
              invoice_sublist.setSublistValue({
                id: "custpage_trandate",
                line: i,
                value: result.getValue({ name: "trandate" }),
              });
     
              invoice_sublist.setSublistValue({
                id: "custpage_internal_id",
                line: i,
                value: result.getValue({ name: "internalid" }),
              });
     
              invoice_sublist.setSublistValue({
                  id: "custpage_customer_name",
                  line: i,
                  value: result.getText({ name: "entity" }),
                });
    
              invoice_sublist.setSublistValue({
                id: "custpage_amount",
                line: i,
                value: result.getValue({ name: "amount" }),
              });
  
              invoice_sublist.setSublistValue({
                  id: "custpage_status",
                  line: i,
                  value: result.getText({ name: "status" }),
                });
    
            });
     
            form.addSubmitButton({
              label: "Send Email",
            });
          }
        scriptContext.response.writePage(form);
      } else if (scriptContext.request.method === "POST") {
        var selectedInvoices = [];
        var lineCount = scriptContext.request.getLineCount({
          group: "custpage_invoice_sublist",
        });
   
        log.debug({
          title: "line",
          details: lineCount,
        });
   
        for (var i = 0; i < lineCount; i++) {
          var checkBox = scriptContext.request.getSublistValue({
            group: "custpage_invoice_sublist",
            name: "custpage_checkbox",
            line: i,
          });
          if (checkBox === "T") {
            var INV_num = scriptContext.request.getSublistValue({
              group: "custpage_invoice_sublist",
              name: "custpage_internal_id",
              line: i,
            });
            selectedInvoices.push(INV_num);
            log.debug("Internal Id of Invoice Selected", INV_num);
          }
        }
        // scriptContext.response.sendRedirect({
        //     type: 'SUITELET',
        //     identifier: 'customscript808',
        //     id: 'customdeploy1',
        //     parameters: {
        //         custpage_customer_name: customerName,
        //         custpage_on_date: onDate,
        //     }
        // });
        // if (selectedInvoices) {
        //     scriptContext.response.sendRedirect({
        //         type: 'SUITELET',
        //         identifier: 'customscript808',
        //         id: 'customdeploy1',
        //         parameters: {
        //             custpage_arr: selectedInvoices,

        //         }
        //     });
        // }
        var scheduledScriptTask = task.create({
          taskType: task.TaskType.SCHEDULED_SCRIPT,
          scriptId: "customscript832",
          deploymentId: "customdeploy1",
        });

        log.debug("Array: ",selectedInvoices);
   
        scheduledScriptTask.params = {
            custscript_invoice_arr: selectedInvoices.join(","),
        };
   
        var taskId = scheduledScriptTask.submit();
        log.debug("Scheduled Script Task ID", taskId);
   
        scriptContext.response.sendRedirect({
          type: "SUITELET",
          identifier: "customscript808",
          id: "customdeploy1",
        });
      }
    }
    return {
      onRequest: onRequest,
    };
  });