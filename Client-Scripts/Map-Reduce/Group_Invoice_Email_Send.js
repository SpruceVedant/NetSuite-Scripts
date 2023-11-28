/**
* @NApiVersion 2.1
* @NScriptType MapReduceScript
*/
define(['N/record', 'N/runtime', 'N/search', 'N/email'],
 /**
* @param{record} record
*/
    (record, runtime, search, email) => {
        const getInputData = (inputContext) => {
            var searchObject = search.create({
                type: "transaction",
                // filters of saved search
                filters:
                    [
                        ["type", "anyof", "CustInvc"]// type: the type of record , anyof: condition, CustInvc: customer invoice
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal Id" }),
                        search.createColumn({ name: "ordertype", sort: search.Sort.ASC, label: "Order Type" }),
                        search.createColumn({ name: "mainline", label: "*" }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "asofdate", label: "As-Of Date" }),
                        search.createColumn({ name: "type", label: "Type" }),
                        search.createColumn({ name: "entity", label: "Name" }),
                        search.createColumn({ name: "account", label: "Account" }),
                        search.createColumn({ name: "memo", label: "Memo" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                    ]
            });

            var myInvoices = searchObject.run();
            var resultRange = myInvoices.getRange({
                start: 0,
                end: 50
            });
            return resultRange;
        }

        const map = (mapContext) => {
            var mapValue = JSON.parse(mapContext.value);
            var customerId = mapValue.values.entity[0].value;
            var customerName = mapValue.values.entity[0].text;
            var invoiceNo = mapValue.values.internalid[0].value;
            var amount = mapValue.values.amount;
            var tranDate = mapValue.values.trandate;
            mapContext.write({
                key: customerId,
                value: {
                    'custpage_customerid': customerId,
                    'custpage_customername': customerName,
                    'custpage_invoiceno': invoiceNo,
                    'custpage_amount': amount,
                    'custpage_trandate': tranDate
                }
            });

        }

        const reduce = (reduceContext) => {
          
            var reduceValue = reduceContext.values;
           // reduceContext : state
           // first value is being parsed assuming 
            var customerName = JSON.parse(reduceContext.values[0]).custpage_customername;
            log.debug("custName", customerName);
            var cust_id = JSON.parse(reduceContext.values[0]).custpage_customerid;
            log.debug("cust_id", cust_id);
            var mailBody = 'Hello, These are the due Invoices: '
            var subject = 'Invoices of: ' + customerName;
            for (var i = 0; i < reduceValue.length; i++) {
                var customerInvoice = JSON.parse(reduceContext.values[i]);
                var custId = customerInvoice.custpage_customerid;
                var InvoiceNumber = customerInvoice.custpage_invoiceno;
                mailBody += ' , ' + InvoiceNumber + ' , '
                var amount = customerInvoice.custpage_amount;
                var date = customerInvoice.custpage_trandate;
            }
            mailBody += 'Dear Customer'
            log.debug('mailBody', mailBody)
            var custEmail = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: cust_id,
                columns: ['email']
            });
            var senderId = -5;
            var recipientId = cust_id;
            log.debug('recipientId', recipientId)
            email.send({
                author: senderId,
                recipients: recipientId,
                subject: subject,
                body: mailBody
            });
            log.debug('email sent', 'email sent')
        }



        const summarize = (summaryContext) => {
        }
        return { getInputData, map, reduce, summarize }

    });
// : Create a Map-Reduce Script which is used to group the invoice by customer 
// and send the email to the customer