/**
 * Simple test script for verification endpoints
 * Run with: node src/test-verification.js (after server is started)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:9065';

async function testEndpoint(name, endpoint, data) {
  console.log(`\n🧪 Testing ${name}...`);
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibW9iaWxlIjoiOTg3NjU0MzIxMCIsInJvbGVJZCI6MSwidXNlclR5cGVEYXRhIjp7fSwiaWF0IjoxNzc0NzkyMzMzLCJleHAiOjE3NzQ4MzU1MzN9.8WtK5G5AcRqTjxXC7LIXn68vvm8V1sp_jIIf12zhY70',
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ ${name} - Success`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ ${name} - Failed`);
    console.log(`Error:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function main() {
  console.log('🚀 Starting Verification Tests');
  console.log('===============================');

  // Test Partner Mobile Verification
  await testEndpoint('Partner Mobile Verification', '/partner/mobile-verification', {
    mobile: '9876543210',
    userType: 4
  });

  // Test Investor Mobile Verification
  await testEndpoint('Investor Mobile Verification', '/partner/mobile-verification', {
    mobile: '9876543211',
    userType: 2
  });

  // Test BC Mobile Verification
  await testEndpoint('BC Mobile Verification', '/partner/mobile-verification', {
    mobile: '9876543212',
    userType: 6
  });

  // Test Email Verification
  await testEndpoint('Email Verification', '/partner/email-verification', {
    mobile: '9876543210',
    email: 'test@example.com'
  });

  console.log('\n🎉 Tests Completed!');
  console.log('\n📝 Check the following:');
  console.log('1. Server console for SMS sending logs');
  console.log('2. Your email for OTP messages');
  console.log('3. Database for OTP logs');
}

main().catch(console.error);
