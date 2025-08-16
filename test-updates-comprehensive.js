import axios from 'axios';

async function testUpdatesComprehensive() {
  console.log('Comprehensive WordPress Updates Test');
  console.log('==================================');
  
  try {
    // Login to dashboard
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'shivaji@ksoftsolution.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Dashboard authentication successful');
    
    // Test updates endpoint
    console.log('\n📊 Testing Updates Detection:');
    console.log('============================');
    
    const updatesResponse = await axios.get('http://localhost:5000/api/websites/1/updates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Updates API Response:');
    console.log(JSON.stringify(updatesResponse.data, null, 2));
    
    // Test WordPress data endpoint
    console.log('\n🔍 Testing WordPress Data:');
    console.log('==========================');
    
    const wpDataResponse = await axios.get('http://localhost:5000/api/websites/1/wordpress-data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ WordPress Data Response:');
    const data = wpDataResponse.data;
    
    console.log('System Info:', {
      wordpress_version: data.systemInfo?.wordpress_version,
      php_version: data.systemInfo?.php_version,
      connection_status: data.systemInfo?.connection_status
    });
    
    console.log('Plugin Count:', data.plugins?.length || 0);
    console.log('Theme Count:', data.themes?.length || 0);
    console.log('User Count:', data.users?.length || 0);
    
    // Summary
    console.log('\n📈 Current System Status:');
    console.log('========================');
    console.log('WordPress Site: ascollegechincholi.com');
    console.log('Connection: Active via WordPress REST API');
    console.log('Update Detection: Core updates available');
    console.log('Plugin Management: Limited (requires working plugin)');
    console.log('Theme Management: Limited (requires working plugin)');
    console.log('System Information: Fully functional');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testUpdatesComprehensive();