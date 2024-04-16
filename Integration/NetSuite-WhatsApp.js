/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/http'], function(record, http) {
    function afterSubmit(context) {
        if (context.type === context.UserEventType.CREATE) {
            var newRecord = context.newRecord;
            var orderId = newRecord.id;
            var customerName = newRecord.getValue({fieldId: 'entity'});

            // Prepare the message content
            var message = "A new Sales Order has been created. Order ID: " + orderId + " for Customer: " + customerName;

            // Call the WhatsApp API
            sendWhatsAppMessage(message);
        }
    }

    function sendWhatsAppMessage(message) {
        var response = http.request({
            method: http.Method.POST,
            url: 'https://your-whatsapp-api-endpoint/messages',
            body: JSON.stringify({
                phone_number: 'customer_phone_number',
                message: message
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your_access_token'
            }
        });

        log.debug({
            title: 'WhatsApp API Response',
            details: response.body
        });
    }

    return {
        afterSubmit: afterSubmit
    };
});
// it will be connected through a python Rest API which will connect through whatsapp
