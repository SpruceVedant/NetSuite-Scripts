// SuiteScript 2.x example to send a WhatsApp message directly

define(['N/https', 'N/log'], function(https, log) {

    function sendWhatsAppMessage() {
        var url = '';
        var headers = {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
        };
        var body = {
            messaging_product: "whatsapp",
            to: "CUSTOMER_PHONE_NUMBER",
            type: "text",
            text: {
                body: "Hello! This is a message from NetSuite."
            }
        };

        try {
            var response = https.post({
                url: url,
                headers: headers,
                body: JSON.stringify(body)
            });
            log.debug('WhatsApp API Response', response.body);
        } catch (e) {
            log.error('Error sending WhatsApp message', e.toString());
        }
    }

    return {
        sendWhatsAppMessage: sendWhatsAppMessage
    };
});
