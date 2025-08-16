import bcrypt from 'bcryptjs';
import { storage } from '../server/storage.js';

async function fixUserPassword() {
  console.log('🔑 Fixing user password...');
  
  try {
    // Hash the password properly using the same method as the auth service
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
    console.log('Generated hash:', hashedPassword);
    
    // Update the user password directly in the database
    const user = await storage.getUserByEmail('admin@ascollegechincholi.com');
    if (!user) {
      throw new Error('User not found');
    }
    
    await storage.updateUserProfile(user.id, {
      password: hashedPassword
    });
    
    console.log('✅ Password updated successfully');
    console.log('You can now login with:');
    console.log('Email: admin@ascollegechincholi.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

fixUserPassword();