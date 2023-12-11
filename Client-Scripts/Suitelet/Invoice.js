/**
* @NApiVersion 2.1
* @NScriptType Suitelet
*/
define(['N/currentRecord', 'N/ui/serverWidget', 'N/url', 'N/https', 'N/task', 'N/search'],

    (currentRecord, serverWidget, url, http, task, search) => {

        function onRequest(scriptContext) {
            if (scriptContext.request.method === 'GET') {

                const customerName = scriptContext.request.parameters.custpage_customer_name;
                const onDate = scriptContext.request.parameters.custpage_on_date;
                const invoice_arr = scriptContext.request.parameters.custpage_arr;
                log.debug({
                    title: 'sales_rder_arr',
                    details: 'salesorderarr' + invoice_arr
                });
                var form = serverWidget.createForm({
                    title: 'Invoices'
                });
                form.clientScriptFileId = 8807;
                log.debug({
                    title: 'id',
                    details: 'debug id' + form.clientScriptFileId
                })
                var primary = form.addFieldGroup({
                    id: 'primary',
                    label: 'Primary Information'
                });

                var secondary = form.addFieldGroup({
                    id: 'secondary',
                    label: 'Duration '
                });

                var customerField = form.addField({
                    id: 'custpage_customer_name',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Customer',
                    source: 'customer',
                    container: 'primary'
                });

                if (customerName) {
                    customerField.defaultValue = customerName
                }
                log.debug({
                    title: 'Cust name',
                    details: 'name' + customerName
                })

                var onField = form.addField({
                    id: 'custpage_on_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'DATE'
                })

                if (onDate) {
                    onField.defaultValue = onDate
                }

                var sales_sublist = form.addSublist({
                    id: 'invoice_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Invoices'
                })
                sales_sublist.addField({ id: "custpage_checkbox", type: serverWidget.FieldType.CHECKBOX, label: "Select" });
                sales_sublist.addField({ id: "custpage_tranid", type: serverWidget.FieldType.TEXT, label: "Invoice ID" });
                sales_sublist.addField({ id: "invoice_number", type: serverWidget.FieldType.TEXT, label: "Invoice Number" });
                sales_sublist.addField({ id: "custpage_entity", type: serverWidget.FieldType.TEXT, label: "Customer Name" });
                sales_sublist.addField({ id: "custpage_trandate", type: serverWidget.FieldType.TEXT, label: "Date" }),
                    sales_sublist.addField({ id: "custpage_amount", type: serverWidget.FieldType.TEXT, label: "Amount" });
                sales_sublist.addField({ id: "custpage_status", type: serverWidget.FieldType.TEXT, label: "Status" });

                if (customerName && onDate) {
                    var salesorderSearchObj = search.create({
                        type: search.Type.INVOICE,
                        filters:
                            [
                                ["mainline", "is", true],
                                "AND",
                                ["entity", "anyof", customerName],
                                "AND",
                                ["trandate", "On", onDate]

                            ],

                        columns:
                            [
                                search.createColumn({
                                    name: "salesorder",
                                    sort: search.Sort.ASC,
                                    label: "Sales Order"
                                }),
                                search.createColumn({ name: "mainline", label: "*" }),
                                search.createColumn({ name: "internalid", label: "Internal Id" }),
                                search.createColumn({ name: "tranid", label: "Invoice Number" }),
                                search.createColumn({ name: "trandate", label: "Date" }),
                                search.createColumn({ name: "type", label: "Type" }),
                                search.createColumn({ name: "entity", label: "Name" }),
                                search.createColumn({ name: "amount", label: "Amount" }),
                                search.createColumn({ name: "status", label: "Status" }),


                            ]
                    });

                    var resultSearch = salesorderSearchObj.run().getRange({ start: 0, end: 100 });

                    resultSearch.forEach(function (result, i) {
                        sales_sublist.setSublistValue({
                            id: 'custpage_tranid',
                            line: i,
                            value: result.getValue({ name: 'internalid' })
                        });

                        sales_sublist.setSublistValue({
                            id: 'invoice_number',
                            line: i,
                            value: result.getValue({ name: 'tranid' })
                        });

                        sales_sublist.setSublistValue({
                            id: 'custpage_trandate',
                            line: i,
                            value: result.getValue({ name: 'trandate' })
                        });

                        sales_sublist.setSublistValue({
                            id: 'custpage_entity',
                            line: i,
                            value: result.getText({ name: 'entity' })
                        });

                        sales_sublist.setSublistValue({
                            id: 'custpage_status',
                            line: i,
                            value: result.getValue({ name: 'status' })
                        });

                        sales_sublist.setSublistValue({
                            id: 'custpage_amount',
                            line: i,
                            value: result.getValue({ name: 'amount' })
                        });
                    });
                }
                form.addSubmitButton({
                    label: 'Search',
                });

                form.addButton({
                    id: 'custpage_set_memo_button',
                    label: 'Send Email',
                    functionName: 'sendEmail'
                });


                scriptContext.response.writePage(form);

                if (invoice_arr) {
                    log.debug('invoice_arr', invoice_arr)
                    var scheduledScript = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT
                    });
                    scheduledScript.scriptId = 'customscript_so_id';
                    log.debug({
                        title: 'schedule script id',
                        details: 'scriptID' + scheduledScript.scriptId
                    })
                    scheduledScript.deploymentId = 'customdeploy1';
                    scheduledScript.params = {
                        'custscript_so': invoice_arr
                    };
                    var scriptTaskId = scheduledScript.submit();
                    log.debug("id", scriptTaskId);
                }
                log.debug('Script Execution arr', 'Exiting onRequest function which contains sc');

            }
            else if (scriptContext.request.method === 'POST') {

                const delimiter = /\u0001/;
                const customerName = scriptContext.request.parameters.custpage_customer_name;
                const onDate = scriptContext.request.parameters.custpage_on_date
                const invoice_arr = scriptContext.request.parameters.custpage_arr;

                scriptContext.response.sendRedirect({
                    type: 'SUITELET',
                    identifier: 'customscript808',
                    id: 'customdeploy1',
                    parameters: {
                        custpage_customer_name: customerName,
                        custpage_on_date: onDate,
                    }
                });
                if (invoice_arr) {
                    scriptContext.response.sendRedirect({
                        type: 'SUITELET',
                        identifier: 'customscript808',
                        id: 'customdeploy1',
                        parameters: {
                            custpage_arr: invoice_arr,

                        }
                    });
                }
            }
            log.debug('Script Execution for POST', 'Exiting onRequest POST function');
        }
        return {
            onRequest: onRequest,

        };
    });