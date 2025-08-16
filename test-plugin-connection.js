import axios from 'axios';

async function testPluginConnection() {
  console.log('Testing WPM Bolt Plugin Connection');
  console.log('==================================');
  
  const baseURL = 'https://ascollegechincholi.com/wp-json/wrm/v1';
  const apiKey = 'D3gGZf4gvT6CHUtaUsggCd6GTJolfwV0';
  
  console.log(`Testing plugin at: ${baseURL}`);
  console.log(`Using API key: ${apiKey.substring(0, 8)}...`);
  
  const headers = {
    'X-WRM-API-Key': apiKey,
    'Content-Type': 'application/json',
    'User-Agent': 'WP-Maintenance-Dashboard/1.0'
  };
  
  // Test different endpoints to see which ones work
  const endpoints = [
    { name: 'Status', path: '/status' },
    { name: 'Updates', path: '/updates' },
    { name: 'Health', path: '/health' },
    { name: 'Plugins', path: '/plugins' },
    { name: 'Themes', path: '/themes' },
    { name: 'Users', path: '/users' }
  ];
  
  console.log('\n🔍 Testing Plugin Endpoints:');
  console.log('============================');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint.name} (${endpoint.path}):`);
      
      const response = await axios.get(`${baseURL}${endpoint.path}`, {
        headers,
        timeout: 10000
      });
      
      console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
      
      if (endpoint.name === 'Status' && response.data) {
        console.log(`   WordPress Version: ${response.data.wordpress_version || 'Unknown'}`);
        console.log(`   PHP Version: ${response.data.php_version || 'Unknown'}`);
        console.log(`   Plugins Found: ${response.data.plugins?.length || 0}`);
      }
      
      if (endpoint.name === 'Updates' && response.data) {
        console.log(`   Core Updates: ${response.data.wordpress?.update_available ? 'Available' : 'None'}`);
        console.log(`   Plugin Updates: ${response.data.plugins?.length || 0}`);
        console.log(`   Theme Updates: ${response.data.themes?.length || 0}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR (${error.response?.status || 'No response'})`);
      if (error.response?.data) {
        console.log(`   Error: ${error.response.data.message || error.response.data.code || 'Unknown error'}`);
      }
    }
  }
  
  // Test plugin information endpoint without API key to see basic accessibility
  console.log('\n🌐 Testing Basic Plugin Access:');
  console.log('===============================');
  
  try {
    const basicResponse = await axios.get(`${baseURL}/status`, {
      timeout: 5000
    });
    console.log('✅ Plugin accessible without authentication');
  } catch (error) {
    console.log('❌ Plugin requires authentication for all endpoints');
    if (error.response?.status === 401) {
      console.log('   This is expected for secure plugins');
    }
  }
  
  console.log('\n📊 Connection Summary:');
  console.log('======================');
  console.log(`Plugin URL: ${baseURL}`);
  console.log(`Authentication: API Key based`);
  console.log(`Key Format: ${apiKey.length} characters`);
  console.log('Status: Testing completed');
}

testPluginConnection();