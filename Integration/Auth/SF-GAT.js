/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/https', 'N/record', 'N/redirect', 'N/log'], function(https, record, redirect, log) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var formHtml = '<html><body><form method="POST">' +
                'Client ID: <input type="text" name="clientId"/><br/>' +
                'Client Secret: <input type="text" name="clientSecret"/><br/>' +
                'Username: <input type="text" name="username"/><br/>' +
                'Password: <input type="password" name="password"/><br/>' +
                'Security Token: <input type="text" name="securityToken"/><br/>' +
                '<input type="submit" value="Generate Access Token"/>' +
                '</form></body></html>';
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

                context.response.write('<html><body><h1>Access Token Generated Successfully</h1><p>Access Token: ' + accessToken + '</p></body></html>');
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
