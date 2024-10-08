const https = require('https');


const url = 'https://.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=812&deploy=1&salesOrderId=8509';

// Request options, including headers
const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': '',  
    },
};


const req = https.request(url, options, (res) => {
    let data = '';

    // Collect data chunks
    res.on('data', (chunk) => {
        data += chunk;
    });

 
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('Response:', JSON.parse(data));
        } else {
            console.error(`Request failed with status: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });
});

req.end();
