/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/https', 'N/file'], function(https, file) {
    function onRequest(context) {
        // Load stored credentials
        var credentialsFile = file.load({
            id: 'SuiteScripts/credentials.json'
        });
        var credentials = JSON.parse(credentialsFile.getContents());

        var refreshToken = credentials.refresh_token;
        var clientId = credentials.client_id;
        var clientSecret = credentials.client_secret;

        var response = https.post({
            url: 'https://login.salesforce.com/services/oauth2/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: {
                grant_type: 'refresh_token',
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken
            }
        });

        if (response.code === 200) {
            var responseBody = JSON.parse(response.body);
            credentials.access_token = responseBody.access_token;

            // Update the stored credentials with the new access token
            var updatedCredentialsFile = file.create({
                name: 'credentials.json',
                fileType: file.Type.JSON,
                contents: JSON.stringify(credentials),
                folder: credentialsFile.folder
            });

            updatedCredentialsFile.save();
        } else {
            // Handle error
            log.error('Error refreshing access token', response.body);
        }
    }

    return {
        onRequest: onRequest
    };
});
