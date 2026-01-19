// Simple test script for exercises API
const axios = require('axios');

const API_BASE_URL = 'https://localhost:7295/api';

async function testExercisesAPI() {
  try {
    console.log('Testing GET /api/exercises...');
    const getResponse = await axios.get(`${API_BASE_URL}/exercises?pageNumber=1&pageSize=10`, {
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    console.log('GET success:', getResponse.status);
    console.log('Data count:', getResponse.data?.items?.length || 'N/A');

    console.log('\nTesting POST /api/exercises...');
    const testExercise = {
      type: 'Listening',
      title: 'Test Exercise',
      description: 'Test description',
      level: 'Beginner',
      questionCount: 1,
      isActive: true
    };

    console.log('Sending data:', JSON.stringify(testExercise, null, 2));

    const postResponse = await axios.post(`${API_BASE_URL}/exercises`, testExercise, {
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    console.log('POST success:', postResponse.status);
    console.log('Created exercise ID:', postResponse.data?.id);

  } catch (error) {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
  }
}

testExercisesAPI();
