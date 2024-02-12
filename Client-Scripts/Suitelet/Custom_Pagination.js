/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/url', 'N/search'],

    (serverWidget, url, search) => {

        let salesorderSearchObj;

        function createSalesOrderSearch(fromDate, toDate, recordsPerPage, currentPage) {
            return search.create({
                type: "salesorder",
                filters:
                    [
                        ["mainline", "is", true],
                        "AND",
                        ["trandate", "within", fromDate, toDate]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal Id" }),
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "entity", label: "Name" }),
                        search.createColumn({ name: "status", label: "Status" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                    ]
            });
        }

        function onRequest(scriptContext) {
            if (scriptContext.request.method === 'GET') {
                try {
                    const fromDate = scriptContext.request.parameters.custpage_from_date;
                    const toDate = scriptContext.request.parameters.custpage_to_date;

                   
                    const recordsPerPage = parseInt(scriptContext.request.parameters.custpage_records_per_page) || 10;

                    const currentPage = parseInt(scriptContext.request.parameters.custpage_current_page) || 1;

                    let form = serverWidget.createForm({
                        title: 'Sales Order'
                    });

                    form.clientScriptFileId =  9201;

                    var primary = form.addFieldGroup({
                        id: 'primary',
                        label: 'Primary Information'
                    });
                    var secondary = form.addFieldGroup({
                        id: 'secondary',
                        label: 'Duration '
                    });

                   
                    var recordsPerPageField = form.addField({
                        id: 'custpage_records_per_page',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Records Per Page',
                        container: 'secondary'
                    });
                    recordsPerPageField.addSelectOption({
                        value: '10',
                        text: '10',
                        isSelected: recordsPerPage === 10
                    });
                    recordsPerPageField.addSelectOption({
                        value: '25',
                        text: '25',
                        isSelected: recordsPerPage === 25
                    });
                    recordsPerPageField.addSelectOption({
                        value: '50',
                        text: '50',
                        isSelected: recordsPerPage === 50
                    });

                    var fromField = form.addField({
                        id: 'custpage_from_date',
                        type: serverWidget.FieldType.DATE,
                        label: 'From',
                        container: 'secondary'
                    });

                    if (fromDate) {
                        fromField.defaultValue = fromDate;
                    }

                    var toField = form.addField({
                        id: 'custpage_to_date',
                        type: serverWidget.FieldType.DATE,
                        label: 'To',
                        container: 'secondary'
                    });

                    if (toDate) {
                        toField.defaultValue = toDate;
                    }

                    var sales_sublist = form.addSublist({
                        id: 'sales_order_sublist',
                        type: serverWidget.SublistType.LIST,
                        label: 'Sales Orders'
                    });

                    sales_sublist.addField({ id: "custpage_serial_number", type: serverWidget.FieldType.TEXT, label: "Serial Number" });
                    sales_sublist.addField({ id: "custpage_tranid", type: serverWidget.FieldType.TEXT, label: "Sales Order Number" });
                    sales_sublist.addField({ id: "custpage_entity", type: serverWidget.FieldType.TEXT, label: "Customer Name" });
                    sales_sublist.addField({ id: "custpage_trandate", type: serverWidget.FieldType.TEXT, label: "Date" });
                    sales_sublist.addField({ id: "custpage_amount", type: serverWidget.FieldType.TEXT, label: "Amount" });
                    sales_sublist.addField({ id: "custpage_status", type: serverWidget.FieldType.TEXT, label: "Status" });

                    if (!salesorderSearchObj && fromDate && toDate) {
                        salesorderSearchObj = createSalesOrderSearch(fromDate, toDate, recordsPerPage, currentPage);
                    }

                    if (salesorderSearchObj) {
                       
                        const startIndex = (currentPage - 1) * recordsPerPage;
                        const endIndex = startIndex + recordsPerPage;
                        var resultSearch = salesorderSearchObj.run().getRange({
                            start: startIndex,
                            end: endIndex
                        });

                        log.debug('Result Search:', resultSearch);

                        for (let i = 0; i < resultSearch.length; i++) {
                            var serialNumber = startIndex + i + 1;

                            sales_sublist.setSublistValue({
                                id: 'custpage_serial_number',
                                line: i,
                                value: serialNumber
                            });

                            sales_sublist.setSublistValue({
                                id: 'custpage_tranid',
                                line: i,
                                value: resultSearch[i].getValue({ name: 'tranid' })
                            });

                            sales_sublist.setSublistValue({
                                id: 'custpage_trandate',
                                line: i,
                                value: resultSearch[i].getValue({ name: 'trandate' })
                            });

                            sales_sublist.setSublistValue({
                                id: 'custpage_entity',
                                line: i,
                                value: resultSearch[i].getText({ name: 'entity' })
                            });

                            sales_sublist.setSublistValue({
                                id: 'custpage_status',
                                line: i,
                                value: resultSearch[i].getValue({ name: 'status' })
                            });

                            sales_sublist.setSublistValue({
                                id: 'custpage_amount',
                                line: i,
                                value: resultSearch[i].getValue({ name: 'amount' })
                            });
                        }

                        sales_sublist.addButton({
                            id: 'custpage_sublist_previous',
                            label: 'Previous',
                            functionName: `onButtonClick('previous', ${currentPage})`
                        });

                        sales_sublist.addButton({
                            id: 'custpage_sublist_next',
                            label: 'Next',
                            functionName: `onButtonClick('next', ${currentPage})`
                        });
                    }

                    form.addSubmitButton({
                        label: 'Search Sales Order',
                    });

                    scriptContext.response.writePage(form);
                } catch (ex) {
                    log.error('Error:', ex);
                    scriptContext.response.write('Error occurred. Please check the log for details.');
                }
            } else if (scriptContext.request.method === 'POST') {
                const delimiter = /\u0001/;
                const customerName = scriptContext.request.parameters.custpage_customer_name;
                const fromDate = scriptContext.request.parameters.custpage_from_date;
                const toDate = scriptContext.request.parameters.custpage_to_date;
                scriptContext.response.sendRedirect({
                    type: 'SUITELET',
                    identifier: 'customscript1085',
                    id: 'customdeploy1',
                    parameters: {
                        custpage_customer_name: customerName,
                        custpage_from_date: fromDate,
                        custpage_to_date: toDate
                    }
                });
            }
        }

        return {
            onRequest: onRequest,
        };
    });
