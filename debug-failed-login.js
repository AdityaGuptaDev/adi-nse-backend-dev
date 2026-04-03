/**
 * Debug script to identify why failed login tracking is not working
 * Run with: node debug-failed-login.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:9065';

async function debugFailedLoginSystem() {
  console.log('=== DEBUGGING FAILED LOGIN SYSTEM ===\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Checking server connectivity...');
    try {
      const response = await axios.get(`${BASE_URL}/user/test-all-logging`, { timeout: 5000 });
      console.log('✅ Server is running and responding');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running on port 9065');
        console.log('💡 SOLUTION: Start your server with "npm start"');
        return;
      } else {
        console.log('❌ Server error:', error.message);
        return;
      }
    }

    // Test 2: Check if failed login tracking endpoint works
    console.log('\n2. Testing failed login tracking endpoint...');
    try {
      const response = await axios.post(`${BASE_URL}/user/test-failed-login`, {
        userName: 'debug@test.com',
        attempts: 1
      });
      console.log('✅ Failed login tracking endpoint works');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Failed login tracking endpoint error:', error.response?.data || error.message);
    }

    // Test 3: Check if actual login failure triggers tracking
    console.log('\n3. Testing actual login failure...');
    try {
      await axios.post(`${BASE_URL}/user/login`, {
        userName: 'nonexistent@test.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Login failure caught by server');
        console.log('Status:', error.response.status);
        
        // Check if failed login tracking was called
        if (error.response.status === 500) {
          console.log('✅ Server error (500) - this should trigger failed login tracking');
        }
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 4: Check log files
    console.log('\n4. Checking log files...');
    const fs = require('fs');
    
    const logFiles = [
      'logs/error-logs.log',
      'logs/info.log',
      'logs/smsEmailZano.log'
    ];

    logFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          const lines = content.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          console.log(`✅ ${file}: ${lines.length} lines, last: ${lastLine.substring(0, 50)}...`);
          
          // Check for failed login entries
          if (content.includes('failed_login_attempt')) {
            console.log(`  🎯 Found failed_login_attempt entries in ${file}`);
          }
          if (content.includes('security_alert')) {
            console.log(`  🎯 Found security_alert entries in ${file}`);
          }
        } else {
          console.log(`❌ ${file}: File not found`);
        }
      } catch (error) {
        console.log(`❌ ${file}: Error reading - ${error.message}`);
      }
    });

    // Test 5: Simulate multiple failed attempts
    console.log('\n5. Simulating multiple failed attempts...');
    for (let i = 1; i <= 6; i++) {
      try {
        await axios.post(`${BASE_URL}/user/login`, {
          userName: `testuser${i}@test.com`,
          password: 'wrongpassword'
        });
      } catch (error) {
        console.log(`Attempt ${i}: ✅ Failed login caught`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n=== DEBUGGING COMPLETE ===');
    console.log('\n🔍 POSSIBLE ISSUES:');
    console.log('1. Server not restarted after code changes');
    console.log('2. Email configuration issues');
    console.log('3. Environment configuration problems');
    console.log('4. Middleware not properly loaded');
    
    console.log('\n💡 SOLUTIONS:');
    console.log('1. RESTART YOUR SERVER: npm start');
    console.log('2. Check email configuration in config.ts');
    console.log('3. Verify environment variables');
    console.log('4. Check console logs for error messages');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Run the debug
debugFailedLoginSystem();
