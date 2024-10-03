const https = require('https');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// OAuth 1.0a credentials
const oauth = OAuth({
    consumer: {
        key: 'your_consumer_key',
        secret: 'your_consumer_secret',
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
});

// Access token and secret
const token = {
    key: 'your_token_key',
    secret: 'your_token_secret',
};

// NetSuite RESTlet URL
const url = 'https://td2953323.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=812&deploy=1';

// OAuth headers
const request_data = {
    url: url,
    method: 'GET',
};

const headers = oauth.toHeader(oauth.authorize(request_data, token));
headers['Content-Type'] = 'application/json';
headers['Authorization'] += ', realm="https://td2953323.restlets.api.netsuite.com"';

const options = {
    method: 'GET',
    headers: headers,
};

// Making the request
const req = https.request(url, options, (res) => {
    let data = '';

    // Collecting data
    res.on('data', (chunk) => {
        data += chunk;
    });

    // Once the data is received
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Response:', data);
        } else {
            console.log(`Error: ${res.statusCode}`);
        }
    });
});

// Handling errors
req.on('error', (error) => {
    console.error(`Problem with request: ${error.message}`);
});

// Ending the request
req.end();
