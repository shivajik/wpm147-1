// Test script to verify client creation on Vercel
const VERCEL_URL = 'https://your-app.vercel.app'; // Replace with your actual Vercel URL

async function testClientCreation() {
  try {
    // First, test registration to get a token
    console.log('Testing registration...');
    const registerResponse = await fetch(`${VERCEL_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });

    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status} ${registerResponse.statusText}`);
    }

    const registerData = await registerResponse.json();
    console.log('Registration successful, token received');

    // Now test client creation
    console.log('Testing client creation...');
    const clientResponse = await fetch(`${VERCEL_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${registerData.token}`
      },
      body: JSON.stringify({
        name: 'Test Client',
        email: 'test.client@example.com',
        phone: '123-456-7890',
        company: 'Test Company',
        status: 'active'
      })
    });

    if (!clientResponse.ok) {
      const errorData = await clientResponse.json();
      throw new Error(`Client creation failed: ${clientResponse.status} ${clientResponse.statusText} - ${JSON.stringify(errorData)}`);
    }

    const clientData = await clientResponse.json();
    console.log('Client creation successful:', clientData);

    // Test getting clients
    console.log('Testing get clients...');
    const getClientsResponse = await fetch(`${VERCEL_URL}/api/clients`, {
      headers: {
        'Authorization': `Bearer ${registerData.token}`
      }
    });

    if (!getClientsResponse.ok) {
      throw new Error(`Get clients failed: ${getClientsResponse.status} ${getClientsResponse.statusText}`);
    }

    const clients = await getClientsResponse.json();
    console.log('Get clients successful, count:', clients.length);

    console.log('✅ All tests passed! Client creation is working on Vercel.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Usage instructions
console.log('Vercel Client Creation Test');
console.log('===========================');
console.log('1. Replace VERCEL_URL with your actual Vercel deployment URL');
console.log('2. Run: node test-vercel-client-creation.js');
console.log('');

if (VERCEL_URL === 'https://your-app.vercel.app') {
  console.log('⚠️  Please update VERCEL_URL in this script with your actual Vercel URL');
} else {
  testClientCreation();
}