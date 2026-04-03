// Simple test file for email and SMS verification
// Run with: node src/test/verification-test.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Update if your server runs on different port

async function testMobileVerification() {
  console.log('Testing Mobile Verification...');
  
  try {
    // Test Partner Mobile Verification (userType: 4)
    console.log('\n1. Testing Partner Mobile Verification');
    const partnerResponse = await axios.post(`${BASE_URL}/partner/mobile-verification`, {
      mobile: '9876543210',
      userType: 4
    }, {
      headers: { 'Authorization': 'Bearer your-test-token' }
    });
    console.log('Partner Response:', partnerResponse.data);
    
    // Test Investor Mobile Verification (userType: 2)
    console.log('\n2. Testing Investor Mobile Verification');
    const investorResponse = await axios.post(`${BASE_URL}/partner/mobile-verification`, {
      mobile: '9876543211',
      userType: 2
    }, {
      headers: { 'Authorization': 'Bearer your-test-token' }
    });
    console.log('Investor Response:', investorResponse.data);
    
    // Test BC Mobile Verification (userType: 6)
    console.log('\n3. Testing BC Mobile Verification');
    const bcResponse = await axios.post(`${BASE_URL}/partner/mobile-verification`, {
      mobile: '9876543212',
      userType: 6
    }, {
      headers: { 'Authorization': 'Bearer your-test-token' }
    });
    console.log('BC Response:', bcResponse.data);
    
  } catch (error) {
    console.error('Mobile Verification Error:', error.response?.data || error.message);
  }
}

async function testEmailVerification() {
  console.log('\n\nTesting Email Verification...');
  
  try {
    // Test Email Verification
    console.log('\n1. Testing Email Verification');
    const emailResponse = await axios.post(`${BASE_URL}/partner/email-verification`, {
      mobile: '9876543210',
      email: 'test@example.com'
    }, {
      headers: { 'Authorization': 'Bearer your-test-token' }
    });
    console.log('Email Response:', emailResponse.data);
    
    // Test Email OTP Verification
    console.log('\n2. Testing Email OTP Verification');
    const emailOtpResponse = await axios.post(`${BASE_URL}/partner/email-otp-verification`, {
      mobile: '9876543210',
      email: 'test@example.com',
      otp: '123456', // You'll need to get the actual OTP from logs/email
      userTypeId: 4
    }, {
      headers: { 'Authorization': 'Bearer your-test-token' }
    });
    console.log('Email OTP Response:', emailOtpResponse.data);
    
  } catch (error) {
    console.error('Email Verification Error:', error.response?.data || error.message);
  }
}

async function testMobileOtpVerification() {
  console.log('\n\nTesting Mobile OTP Verification...');
  
  try {
    // Test Mobile OTP Verification
    console.log('\n1. Testing Mobile OTP Verification');
    const mobileOtpResponse = await axios.post(`${BASE_URL}/partner/mobile-otp-verification`, {
      mobile: '9876543210',
      userType: 4,
      otp: '123456' // You'll need to get the actual OTP from logs/SMS
    }, {
      headers: { 'Authorization': 'Bearer your-test-token' }
    });
    console.log('Mobile OTP Response:', mobileOtpResponse.data);
    
  } catch (error) {
    console.error('Mobile OTP Verification Error:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('Starting Verification Tests...\n');
  
  await testMobileVerification();
  await testEmailVerification();
  await testMobileOtpVerification();
  
  console.log('\n\nTests completed!');
}

// Run tests
runAllTests().catch(console.error);
