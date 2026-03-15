const axios = require('axios');
const API_BASE_URL = 'https://localhost:7295/api';

async function testSettingsAPI() {
    try {
        console.log('Testing GET /api/settings...');
        const response = await axios.get(`${API_BASE_URL}/settings`, {
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        console.log('GET success:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
}

testSettingsAPI();
