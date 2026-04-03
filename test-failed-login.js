/**
 * Test script to verify failed login tracking and email notifications
 * Run with: node test-failed-login.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:9065';

async function testFailedLoginTracking() {
  console.log('=== TESTING FAILED LOGIN TRACKING SYSTEM ===\n');

  try {
    // Test 1: Simulate failed login attempts
    console.log('1. Testing failed login simulation...');
    
    const response = await axios.post(`${BASE_URL}/user/test-failed-login`, {
      userName: 'testuser@example.com',
      attempts: 6
    });
    
    console.log('✅ Failed login simulation successful');
    console.log('Response:', response.data);
    
    // Test 2: Check if security alert was triggered
    if (response.data.securityAlertTriggered) {
      console.log('✅ Security alert should have been sent');
    } else {
      console.log('❌ Security alert was not triggered');
    }
    
    // Test 3: Test actual failed login attempt
    console.log('\n2. Testing actual failed login...');
    
    try {
      await axios.post(`${BASE_URL}/user/login`, {
        userName: 'nonexistent@example.com',
        password: 'wrongpassword',
        __pii_encrypted: false // Skip encryption for testing
      });
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log('✅ Failed login properly caught and logged');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 4: Test multiple failed attempts
    console.log('\n3. Testing multiple failed attempts...');
    
    for (let i = 1; i <= 3; i++) {
      try {
        await axios.post(`${BASE_URL}/user/login`, {
          userName: `testuser${i}@example.com`,
          password: 'wrongpassword',
          __pii_encrypted: false
        });
      } catch (error) {
        console.log(`✅ Attempt ${i}: Failed login caught`);
      }
    }
    
    console.log('\n=== TESTING COMPLETED ===');
    console.log('\nNext steps:');
    console.log('1. Check logs/error-logs.log for failed login entries');
    console.log('2. Check logs/smsEmailZano.log for email notifications');
    console.log('3. Check your email for security alerts');
    console.log('4. Test with real login attempts from same user');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your server is running on port 9065');
      console.log('   Run: npm start');
    }
  }
}

// Run the test
testFailedLoginTracking();
