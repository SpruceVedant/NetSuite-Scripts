/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/ui/serverWidget'], 
    function(log, record, serverWidget) {

    function onRequest(context) {
        try {
            
            var form = serverWidget.createForm({
                title: 'Create Sales Order',
            });

           
            var customerField = form.addField({
                id: 'customer',
                type: serverWidget.FieldType.SELECT,
                label: 'Customer',
                source: 'customer',
                container: 'main',
            });

            
            var itemField = form.addField({
                id: 'item',
                type: serverWidget.FieldType.SELECT,
                label: 'Item',
                source: 'item',
                container: 'main',
            });

            
            var quantityField = form.addField({
                id: 'quantity',
                type: serverWidget.FieldType.INTEGER,
                label: 'Quantity',
                container: 'main',
            });

            form.addSubmitButton({
                label: 'Create Sales Order',
            });

           
            if (context.request.method === 'POST') {
                var customerId = context.request.parameters.customer;
                var itemId = context.request.parameters.item;
                var quantity = context.request.parameters.quantity;

                
                var salesOrder = record.create({
                    type: record.Type.SALES_ORDER,
                    isDynamic: true,
                });

                
                salesOrder.setValue({
                    fieldId: 'entity',
                    value: customerId,
                });

                
                salesOrder.selectNewLine({
                    sublistId: 'item'
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: itemId,
                });
                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: quantity,
                });
                salesOrder.commitLine({
                    sublistId: 'item'
                });

               
                var salesOrderId = salesOrder.save();

                log.debug({
                    title: 'Sales Order Created',
                    details: 'Sales Order ID: ' + salesOrderId
                });

                
                form.addPageInitMessage({
                    type: serverWidget.MessageType.CONFIRMATION,
                    title: 'Success',
                    message: 'Sales Order Created. ID: ' + salesOrderId,
                });

                var confirmationUrl = url.resolveScript({
                    scriptId: 'customscriptcustomscript_confirmation_so',
                    deploymentId: 'customdeploycustomdeploy_confirmation_su',
                    params: {
                        orderId: salesOrderId
                    }
                });
    
                context.response.sendRedirect({
                    type: url.RedirectType.SUITELET,
                    identifier: 'customscriptcustomscript_confirmation_so',
                    deploymentId: 'customdeploycustomdeploy_confirmation_su',
                    parameters: {
                        orderId: salesOrderId
                    }
                });
            }

            
            context.response.writePage(form);
        } catch (error) {
            log.error({
                title: 'Error',
                details: error
            });
        }
    }

    return {
        onRequest: onRequest
    };
});
