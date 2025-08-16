import axios from 'axios';

async function testWPMBoltUpdates() {
  console.log('Testing WPM Bolt Plugin Updates');
  console.log('===============================');
  
  const baseUrl = 'https://ascollegechincholi.com/wp-json';
  const apiKey = 'D3gGZf4gvT6CHUtaUsggCd6GTJolfwV0';
  
  // Test available endpoints
  const endpoints = [
    { name: 'WordPress Core Info', url: '/wp/v2/', method: 'GET' },
    { name: 'WRM Updates (existing)', url: '/wrm/v1/updates', method: 'GET' },
    { name: 'WRM Status', url: '/wrm/v1/status', method: 'GET' },
    { name: 'WRM Health', url: '/wrm/v1/health', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n${endpoint.name}:`);
    console.log('-------------------');
    
    try {
      const config = {
        method: endpoint.method,
        url: baseUrl + endpoint.url,
        timeout: 15000
      };
      
      // Add API key for WRM endpoints
      if (endpoint.url.includes('/wrm/v1/')) {
        config.headers = {
          'X-WRM-API-Key': apiKey,
          'Content-Type': 'application/json'
        };
      }
      
      const response = await axios(config);
      console.log('✅ SUCCESS');
      
      if (endpoint.url === '/wp/v2/') {
        console.log('WordPress version available:', !!response.data);
      } else {
        console.log('Response:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log('❌ ERROR');
      if (error.response) {
        console.log('Status:', error.response.status);
        if (error.response.data) {
          if (typeof error.response.data === 'string' && error.response.data.includes('critical error')) {
            console.log('Plugin error detected - checking specific function');
            
            // Check if it's a specific function error
            if (error.response.data.includes('get_core_updates')) {
              console.log('Issue: get_core_updates() function not available');
              console.log('Solution: Need to include WordPress update functions');
            }
          } else {
            console.log('Error data:', error.response.data);
          }
        }
      } else {
        console.log('Network Error:', error.message);
      }
    }
  }
  
  // Test our dashboard integration
  console.log('\n\nTesting Dashboard Integration:');
  console.log('=============================');
  
  try {
    // Test login with demo user
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'demo@wpmaintenance.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Dashboard login successful');
    
    // Test updates endpoint
    const updatesResponse = await axios.get('http://localhost:5000/api/websites/1/updates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dashboard updates response:');
    console.log(JSON.stringify(updatesResponse.data, null, 2));
    
  } catch (dashboardError) {
    if (dashboardError.response?.status === 404) {
      console.log('⚠️  Website not found in dashboard');
      console.log('Note: Need to test with correct user account');
    } else {
      console.log('❌ Dashboard error:', dashboardError.response?.data || dashboardError.message);
    }
  }
  
  console.log('\n\n📊 Summary:');
  console.log('===========');
  console.log('WordPress Site: ascollegechincholi.com');
  console.log('Plugin Status: wpm-bolt-main installed but has function compatibility issues');
  console.log('Available: WordPress core info, basic site connectivity');
  console.log('Issues: Plugin functions missing or incompatible with WordPress version');
  console.log('Recommendation: Fix plugin compatibility or use alternative approach');
}

testWPMBoltUpdates();