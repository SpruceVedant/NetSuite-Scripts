const https = require('https');

// NetSuite RESTlet URL
const url = 'https://td2953323.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=812&deploy=1&salesOrderId=8509';

// Request options, including headers
const options = {
    method: 'GET',  // Assuming it's a GET request as per your cURL example
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Your_Authorization_Token_Here',  // Replace with the actual token
    },
};

// Sending the request
const req = https.request(url, options, (res) => {
    let data = '';

    // Collect data chunks
    res.on('data', (chunk) => {
        data += chunk;
    });

    // End of response
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Response:', JSON.parse(data));
        } else {
            console.error(`Request failed with status: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });
});

// Handling request error
req.on('error', (error) => {
    console.error(`Request error: ${error.message}`);
});

// End the request
req.end();
