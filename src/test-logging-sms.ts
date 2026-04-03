/**
 * Test script to verify logging and SMS functionality
 * Run this with: npx ts-node src/test-logging-sms.ts
 */

import fs from 'fs';
import path from 'path';

// Test logging functionality
console.log('=== TESTING LOGGING FUNCTIONALITY ===');

try {
  // Test error logger
  const ErrorLogger = require('../db/core/logger/error-logger').default;
  
  const testLogData = {
    type: "test_log",
    message: "Testing logging functionality",
    timestamp: new Date().toISOString(),
    success: true
  };
  
  ErrorLogger.write(testLogData);
  console.log('✅ Error logger test successful');
  
  // Check if log file was created
  const logPath = path.join(__dirname, '../../logs/error-logs.log');
  if (fs.existsSync(logPath)) {
    const logContent = fs.readFileSync(logPath, 'utf8');
    console.log('✅ Log file exists and contains data');
    console.log('📄 Last few lines of log:');
    const lines = logContent.trim().split('\n');
    console.log(lines.slice(-3).join('\n'));
  } else {
    console.log('❌ Log file not found');
  }
  
} catch (error: any) {
  console.error('❌ Logging test failed:', error.message);
}

console.log('\n=== TESTING SMS FUNCTIONALITY ===');

try {
  // Test SMS service
  const { SmsService } = require('../services/sms.service');
  
  const testMobile = '9999999999'; // Test mobile number
  const testMessage = 'Test message from verification script';
  
  console.log('Testing SMS console fallback...');
  SmsService.sendSmsConsole(testMobile, testMessage)
    .then((result: any) => {
      console.log('✅ SMS console fallback test successful');
      console.log('Result:', result);
    })
    .catch((error: any) => {
      console.error('❌ SMS console fallback test failed:', error.message);
    });
  
  // Check SMS log file
  const smsLogPath = path.join(__dirname, '../../logs/smsEmailZano.log');
  setTimeout(() => {
    if (fs.existsSync(smsLogPath)) {
      const smsLogContent = fs.readFileSync(smsLogPath, 'utf8');
      if (smsLogContent.trim()) {
        console.log('✅ SMS log file has content');
        console.log('📄 Last few lines of SMS log:');
        const lines = smsLogContent.trim().split('\n');
        console.log(lines.slice(-2).join('\n'));
      } else {
        console.log('⚠️ SMS log file exists but is empty');
      }
    } else {
      console.log('❌ SMS log file not found');
    }
  }, 1000);
  
} catch (error: any) {
  console.error('❌ SMS test setup failed:', error.message);
}

console.log('\n=== TESTING DATABASE SMS CREDENTIALS ===');

try {
  // Test credential service
  const { getExternalCred } = require('../services/credentialService');
  const { ExternalEntity } = require('../utils/constant');
  
  getExternalCred({ type: ExternalEntity.SMS })
    .then((credentials: any) => {
      if (credentials) {
        console.log('✅ SMS credentials found in database');
        console.log('📋 Credentials summary:', {
          username: !!credentials.username,
          password: !!credentials.password,
          sender_id: !!credentials.sender_id,
          entity_id: !!credentials.entity_id,
          template_id: !!credentials.template_id,
          api_base_url: !!credentials.api_base_url
        });
      } else {
        console.log('❌ SMS credentials not found in database');
        console.log('💡 Solution: Add SMS credentials to External_account_details table');
      }
    })
    .catch((error: any) => {
      console.error('❌ SMS credentials test failed:', error.message);
      console.log('💡 This might be due to database connection issues');
    });
  
} catch (error: any) {
  console.error('❌ SMS credentials test setup failed:', error.message);
}

console.log('\n=== SUMMARY ===');
console.log('1. If logging works but SMS credentials are missing, add them to the database');
console.log('2. If both work, the issue might be in the API endpoints themselves');
console.log('3. Check the actual log files in the logs/ directory for detailed information');
