/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/https', 'N/file', 'N/log',  "N/ui/serverWidget"], function(https, file, log, serverWidget) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
  
            try {
                var fileId = ; 

                var developerToken = '';
                var fileObj = file.load({
                    id: fileId
                });
                
                var fileContent = fileObj.getContents();
                var boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
                var headers = {
                    'Authorization': 'Bearer ' + developerToken,
                    'Content-Type': 'multipart/form-data; boundary=' + boundary
                };

                var attributes = JSON.stringify({
                    name: fileObj.name,
                    parent: { id: '0' } 
                });

                var body = '--' + boundary + '\r\n';
                body += 'Content-Disposition: form-data; name="attributes"\r\n\r\n';
                body += attributes + '\r\n';
                body += '--' + boundary + '\r\n';
                body += 'Content-Disposition: form-data; name="file"; filename="' + fileObj.name + '"\r\n';
                body += 'Content-Type: ' + fileObj.fileType + '\r\n\r\n';
                body += fileContent + '\r\n';
                body += '--' + boundary + '--';

                var response = https.post({
                    url: 'https://upload.box.com/api/2.0/files/content',
                    headers: headers,
                    body: body
                });

                log.debug('Upload Response Code', response.code);
                log.debug('Upload Response Body', response.body);

                if (response.code === 200 || response.code === 201) {
                    context.response.write(response.body);
                } else {
                    log.error('Upload Error', response.body);
                    context.response.write(JSON.stringify({
                        status: 'Error',
                        message: response.body
                    }));
                }
            } catch (error) {
                log.error('Error in Suitelet', error);
                context.response.write(JSON.stringify({
                    status: 'Error',
                    message: error.message
                }));
            }
        }
    }
    return {
        onRequest: onRequest
    };
});
