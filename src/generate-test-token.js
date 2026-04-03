/**
 * Generate a test token for API testing
 */

const prosesjwt = require('proses-jwt').default;

// Generate a test token
const { generateToken } = prosesjwt;

const testPayload = {
  id: 1,
  mobile: '9876543210',
  roleId: 1,
  userTypeData: {}
};

try {
  const token = generateToken(testPayload);
  console.log('Generated Test Token:');
  console.log(token);
  console.log('\nUse this token in Authorization header as:');
  console.log(`Authorization: Bearer ${token}`);
  
  // Also update the test file with this token
  const fs = require('fs');
  const testFilePath = './src/test-verification.js';
  let testFileContent = fs.readFileSync(testFilePath, 'utf8');
  testFileContent = testFileContent.replace("'Bearer test-token'", `'Bearer ${token}'`);
  fs.writeFileSync(testFilePath, testFileContent);
  console.log('\n✅ Updated test-verification.js with valid token');
  
} catch (error) {
  console.error('Error generating token:', error);
}
