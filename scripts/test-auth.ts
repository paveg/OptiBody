import { hashPassword, verifyPassword } from '../src/lib/auth';

async function testAuth() {
  console.log('Testing authentication functions...\n');

  try {
    // Test password hashing
    const password = 'testPassword123';
    console.log('Original password:', password);
    
    const hashedPassword = await hashPassword(password);
    console.log('Hashed password:', hashedPassword);
    
    // Test password verification
    const isValid = await verifyPassword(password, hashedPassword);
    console.log('Password verification (correct):', isValid);
    
    const isInvalid = await verifyPassword('wrongPassword', hashedPassword);
    console.log('Password verification (incorrect):', isInvalid);
    
    console.log('\nAuthentication functions are working correctly!');
  } catch (error) {
    console.error('Error testing authentication:', error);
  }
}

testAuth();