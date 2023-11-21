/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/log', 'N/search', 'N/format', 'N/ui/serverWidget', 'N/render'],
    function(record, log, search, format, serverWidget, render) {

        function onRequest(context) {
            if (context.request.method === 'GET') {
               
                var form = serverWidget.createForm({
                    title: 'Invoice Filter Suitelet'
                });

                var customerField = form.addField({
                    id: 'custpage_customer',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Customer',
                    source: 'customer'
                });

                var fromDateField = form.addField({
                    id: 'custpage_from_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'From Date'
                });

                var toDateField = form.addField({
                    id: 'custpage_to_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'To Date'
                });

                var sublist = form.addSublist({
                    id: 'custpage_invoice_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Filtered Invoices'
                });

                sublist.addField({
                    id: 'custpage_checkbox',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Select'
                });

                sublist.addField({
                    id: 'custpage_invoice_number',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Invoice Number'
                });

                sublist.addField({
                    id: 'custpage_customer_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Customer Name'
                });

                sublist.addField({
                    id: 'custpage_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });

                sublist.addField({
                    id: 'custpage_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Amount'
                });

                form.addSubmitButton({
                    label: 'Submit'
                });

                context.response.writePage(form);
            } else {
              
                var customerId = context.request.parameters.custpage_customer;
                var fromDate = context.request.parameters.custpage_from_date;
                var toDate = context.request.parameters.custpage_to_date;

             
                var invoiceSearch = search.create({
                    type: search.Type.INVOICE,
                    filters: [
                        ['entity', 'anyof', customerId],
                        'AND',
                        ['trandate', 'within', fromDate, toDate]
                    ],
                    columns: ['internalid', 'tranid', 'entity', 'trandate', 'amount']
                });

            
                var form = serverWidget.createForm({
                    title: 'Filtered Invoices'
                });

            
                var sublist = form.addSublist({
                    id: 'custpage_invoice_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Filtered Invoices'
                });

                sublist.addField({
                    id: 'custpage_checkbox',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Select'
                });

                sublist.addField({
                    id: 'custpage_invoice_number',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Invoice Number'
                });

                sublist.addField({
                    id: 'custpage_customer_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Customer Name'
                });

                sublist.addField({
                    id: 'custpage_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });

                sublist.addField({
                    id: 'custpage_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Amount'
                });

               
                var resultIndex = 0;
                invoiceSearch.run().each(function(result) {
                    sublist.setSublistValue({
                        id: 'custpage_invoice_number',
                        line: resultIndex,
                        value: result.getValue('tranid')
                    });

                    sublist.setSublistValue({
                        id: 'custpage_customer_name',
                        line: resultIndex,
                        value: result.getText('entity')
                    });

                    sublist.setSublistValue({
                        id: 'custpage_date',
                        line: resultIndex,
                        value: result.getValue('trandate')
                    });

                    sublist.setSublistValue({
                        id: 'custpage_amount',
                        line: resultIndex,
                        value: result.getValue('amount')
                    });

                    resultIndex++;
                    return true;
                });

                context.response.writePage(form);
            }
        }

        return {
            onRequest: onRequest
        };

    });
