import bcrypt from 'bcryptjs';
import { storage } from '../server/storage.js';

async function testExistingUsers() {
  try {
    console.log('Testing existing user credentials...');
    
    // Get existing users
    const users = await Promise.all([
      storage.getUserByEmail('test@example.com'),
      storage.getUserByEmail('shivaji@ksoftsolution.com')
    ]);
    
    for (const user of users) {
      if (user) {
        console.log(`\nUser: ${user.email}`);
        console.log(`Password hash: ${user.password.substring(0, 20)}...`);
        
        // Test common passwords that might have been used
        const testPasswords = ['password', 'test123', 'test', '123456', 'admin'];
        
        for (const testPassword of testPasswords) {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log(`✅ Found working password: "${testPassword}"`);
            break;
          }
        }
      }
    }
    
    console.log('\n📋 Demo credentials:');
    console.log('Email: demo@wpmaintenance.com');
    console.log('Password: demo123');
    
  } catch (error) {
    console.error('❌ Error testing users:', error);
  }
}

testExistingUsers();
