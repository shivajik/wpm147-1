import { AuthService } from '../server/auth.js';
import { storage } from '../server/storage.js';

async function createDemoUser() {
  try {
    console.log('Creating demo user...');
    
    // Demo user credentials
    const demoUserData = {
      email: 'demo@wpmaintenance.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User'
    };

    // Check if demo user already exists
    const existingUser = await storage.getUserByEmail(demoUserData.email);
    if (existingUser) {
      console.log('Demo user already exists!');
      console.log('Email:', demoUserData.email);
      console.log('Password:', demoUserData.password);
      return;
    }

    // Create demo user using the AuthService
    const result = await AuthService.register(demoUserData);
    
    console.log('✅ Demo user created successfully!');
    console.log('Email:', demoUserData.email);
    console.log('Password:', demoUserData.password);
    console.log('User ID:', result.user.id);
    console.log('Token:', result.token);
    
    // Test login
    console.log('\n🔐 Testing login...');
    const loginResult = await AuthService.login({
      email: demoUserData.email,
      password: demoUserData.password
    });
    
    console.log('✅ Login test successful!');
    console.log('Login token:', loginResult.token);
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  }
}

createDemoUser();