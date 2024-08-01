const axios = require('axios');


const ACCESS_TOKEN = "";
const BASE_URL = "";

async function fetchOrders() {
    try {
        const response = await axios.get(`${BASE_URL}/services/data/v52.0/query`, {
            params: {
                q: 'SELECT Id, OrderNumber, Status, AccountId, EffectiveDate, TotalAmount FROM Order'
            },
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });

        console.log('Orders fetched successfully:', response.data);
    } catch (error) {
        console.error('Error fetching orders', error.response ? error.response.data : error.message);
    }
}

async function main() {
    await fetchOrders();
}

main();
