/**
 * Test script to verify all logging systems are working
 * Run with: node test-logging-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== TESTING LOGGING SYSTEMS ===\n');

// Test 1: Check if log files exist
console.log('1. Checking log files exist...');
const logFiles = [
  'logs/error-logs.log',
  'logs/info.log', 
  'logs/smsEmailZano.log'
];

logFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Test writing to log files directly
console.log('\n2. Testing direct log file writing...');

try {
  // Test error log
  const errorLogPath = 'logs/error-logs.log';
  const testErrorLog = `[${new Date().toISOString()}] TEST: Error log direct write test\n`;
  fs.appendFileSync(errorLogPath, testErrorLog);
  console.log('✅ Error log direct write successful');
} catch (error) {
  console.log('❌ Error log direct write failed:', error.message);
}

try {
  // Test info log
  const infoLogPath = 'logs/info.log';
  const testInfoLog = `[${new Date().toISOString()}] TEST: Info log direct write test\n`;
  fs.appendFileSync(infoLogPath, testInfoLog);
  console.log('✅ Info log direct write successful');
} catch (error) {
  console.log('❌ Info log direct write failed:', error.message);
}

try {
  // Test SMS log
  const smsLogPath = 'logs/smsEmailZano.log';
  const testSmsLog = `[${new Date().toISOString()}] TEST: SMS log direct write test\n`;
  fs.appendFileSync(smsLogPath, testSmsLog);
  console.log('✅ SMS log direct write successful');
} catch (error) {
  console.log('❌ SMS log direct write failed:', error.message);
}

// Test 3: Check log file contents
console.log('\n3. Checking log file contents...');

logFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      console.log(`✅ ${file}: ${lines.length} lines, last: ${lastLine.substring(0, 50)}...`);
    } else {
      console.log(`❌ ${file}: File not found`);
    }
  } catch (error) {
    console.log(`❌ ${file}: Error reading - ${error.message}`);
  }
});

console.log('\n=== TESTING COMPLETED ===');
console.log('\nNext steps:');
console.log('1. Start your server: npm start');
console.log('2. Test the endpoint: POST http://localhost:9065/user/test-all-logging');
console.log('3. Check the log files for new entries');
