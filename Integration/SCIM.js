const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(express.json());

const CONFIG_PATH = path.resolve(__dirname, 'config.json');


const loadConfig = () => {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    console.log('Looking for configuration at:', CONFIG_PATH);

  } else {
    console.log('Looking for configuration at:', CONFIG_PATH);

    console.error('Configuration file not found. Please set up authentication keys.');
    process.exit(1);
  }
};

const config = loadConfig();


const generateOAuthHeaders = (url, method, payload) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(
    `oauth_consumer_key=${config.CONSUMER_KEY}&oauth_nonce=${nonce}&oauth_signature_method=HMAC-SHA256&oauth_timestamp=${timestamp}&oauth_token=${config.TOKEN_ID}&oauth_version=1.0`
  )}`;

  const signingKey = `${config.CONSUMER_SECRET}&${config.TOKEN_SECRET}`;
  const signature = crypto.createHmac('sha256', signingKey).update(baseString).digest('base64');

  return {
    Authorization: `OAuth oauth_consumer_key="${config.CONSUMER_KEY}",oauth_token="${config.TOKEN_ID}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${encodeURIComponent(
      signature
    )}"`,
    'Content-Type': 'application/json',
  };
};

// Endpoint to Handle Azure Provisioning
app.post('/provision', async (req, res) => {
  const user = req.body;

  // Map Azure Payload to NetSuite Employee Schema
  const employeePayload = {
    firstname: user.name.givenName,
    lastname: user.name.familyName,
    email: user.emails[0].value,
    isinactive: user.active === false,
    jobtitle: user.jobTitle || 'N/A', // Optional field
  };

  const netsuiteUrl = `https://${config.ACCOUNT_ID}.suitetalk.api.netsuite.com/rest/record/v1/employee`;

  try {

    const headers = generateOAuthHeaders(netsuiteUrl, 'POST', employeePayload);

    
    const response = await axios.post(netsuiteUrl, employeePayload, { headers });

    console.log('User provisioned successfully:', response.data);
    res.status(201).send({ status: 'success', data: response.data });
  } catch (error) {
    console.error('Error provisioning user in NetSuite:', error.response?.data || error.message);
    res.status(500).send({ status: 'failure', error: error.response?.data || error.message });
  }
});

// Start the Middleware Server
app.listen(3000, () => console.log('Middleware running on port 3000'));
