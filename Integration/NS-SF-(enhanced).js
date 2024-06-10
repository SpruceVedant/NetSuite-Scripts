/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/https', 'N/file', 'N/log'], function(https, file, log) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var formHtml = 
                '<html>' +
                '<head>' +
                '<style>' +
                'body {' +
                '    font-family: Arial, sans-serif;' +
                '    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);' +
                '    margin: 0;' +
                '    padding: 0;' +
                '    display: flex;' +
                '    justify-content: center;' +
                '    align-items: center;' +
                '    height: 100vh;' +
                '    overflow: hidden;' +
                '}' +
                '.container {' +
                '    background-color: #ffffff;' +
                '    padding: 20px;' +
                '    border-radius: 12px;' +
                '    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);' +
                '    width: 100%;' +
                '    max-width: 400px;' +
                '    box-sizing: border-box;' +
                '    text-align: center;' +
                '    transform: translateY(-50px);' +
                '    animation: fadeIn 1s ease-out forwards;' +
                '}' +
                '.logo {' +
                '    max-width: 100px;' +
                '    margin-bottom: 20px;' +
                '    animation: bounceIn 1s;' +
                '}' +
                'h1 {' +
                '    color: #333333;' +
                '    margin-bottom: 20px;' +
                '}' +
                'form {' +
                '    display: flex;' +
                '    flex-direction: column;' +
                '    align-items: center;' +
                '}' +
                'label {' +
                '    align-self: flex-start;' +
                '    margin-bottom: 5px;' +
                '    color: #555555;' +
                '}' +
                'input[type="text"], input[type="password"] {' +
                '    padding: 10px;' +
                '    margin-bottom: 15px;' +
                '    border: 1px solid #cccccc;' +
                '    border-radius: 4px;' +
                '    font-size: 16px;' +
                '    width: 100%;' +
                '    box-sizing: border-box;' +
                '    transition: box-shadow 0.3s;' +
                '}' +
                'input[type="text"]:focus, input[type="password"]:focus {' +
                '    box-shadow: 0 0 5px rgba(81, 203, 238, 1);' +
                '    border: 1px solid rgba(81, 203, 238, 1);' +
                '}' +
                'input[type="submit"] {' +
                '    padding: 10px;' +
                '    background-color: #4CAF50;' +
                '    border: none;' +
                '    border-radius: 4px;' +
                '    color: white;' +
                '    font-size: 16px;' +
                '    cursor: pointer;' +
                '    width: 100%;' +
                '    box-sizing: border-box;' +
                '    transition: background-color 0.3s, transform 0.3s;' +
                '}' +
                'input[type="submit"]:hover {' +
                '    background-color: #45a049;' +
                '    transform: scale(1.05);' +
                '}' +
                '@keyframes fadeIn {' +
                '    from {opacity: 0; transform: translateY(-50px);}' +
                '    to {opacity: 1; transform: translateY(0);}' +
                '}' +
                '@keyframes bounceIn {' +
                '    0%, 20%, 40%, 60%, 80%, 100% {transform: translateY(0);}' +
                '    50% {transform: translateY(-20px);}' +
                '}' +
                '</style>' +
                '</head>' +
                '<body>' +
                '<div class="container">' +
                '<img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" class="logo" alt="Logo"/>' +
                '<h1>Generate Access Token</h1>' +
                '<form method="POST">' +
                '<label for="clientId">Client ID:</label>' +
                '<input type="text" id="clientId" name="clientId" required/>' +
                '<label for="clientSecret">Client Secret:</label>' +
                '<input type="text" id="clientSecret" name="clientSecret" required/>' +
                '<label for="username">Username:</label>' +
                '<input type="text" id="username" name="username" required/>' +
                '<label for="password">Password:</label>' +
                '<input type="password" id="password" name="password" required/>' +
                '<label for="securityToken">Security Token:</label>' +
                '<input type="text" id="securityToken" name="securityToken" required/>' +
                '<input type="submit" value="Generate Access Token"/>' +
                '</form>' +
                '</div>' +
                '</body>' +
                '</html>';
            context.response.write(formHtml);
        } else {
            var clientId = context.request.parameters.clientId;
            var clientSecret = context.request.parameters.clientSecret;
            var username = context.request.parameters.username;
            var password = context.request.parameters.password + context.request.parameters.securityToken;

            var authEndpoint = 'https://login.salesforce.com/services/oauth2/token';
            var payload = {
                grant_type: 'password',
                client_id: clientId,
                client_secret: clientSecret,
                username: username,
                password: password
            };

            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            var response = https.post({
                url: authEndpoint,
                body: payload,
                headers: headers
            });

            if (response.code === 200) {
                var responseBody = JSON.parse(response.body);
                var accessToken = responseBody.access_token;

                log.debug({
                    title: 'Salesforce Access Token',
                    details: accessToken
                });

                var tokenData = {
                    access_token: accessToken,
                    instance_url: responseBody.instance_url,
                    issued_at: responseBody.issued_at
                };

                var folderId = -15;
                var fileName = 'salesforce_access_token.json';

                try {
                    var existingFile = file.load({
                        id: fileName,
                        folder: folderId
                    });

                    existingFile.contents = JSON.stringify(tokenData);
                    existingFile.save();

                    log.debug({
                        title: 'Updated File ID',
                        details: existingFile.id
                    });

                    context.response.write('<html><body><h1>Access Token Updated Successfully</h1><p>Access Token: ' + accessToken + '</p><p>File ID: ' + existingFile.id + '</p></body></html>');
                } catch (e) {
                    if (e.name === 'RCRD_DSNT_EXIST') {
                        var tokenFile = file.create({
                            name: fileName,
                            fileType: file.Type.JSON,
                            contents: JSON.stringify(tokenData),
                            folder: folderId
                        });

                        var fileId = tokenFile.save();

                        log.debug({
                            title: 'New File ID',
                            details: fileId
                        });

                        context.response.write('<html><body><h1>Access Token Generated Successfully</h1><p>Access Token: Check logs in NetSuite</p><p>File ID: ' + fileId + '</p></body></html>');
                    } else {
                        throw e;
                    }
                }
            } else {
                log.error({
                    title: 'Error generating access token',
                    details: response.body
                });

                context.response.write('<html><body><h1>Error Generating Access Token</h1><p>' + response.body + '</p></body></html>');
            }
        }
    }

    return {
        onRequest: onRequest
    };
});
