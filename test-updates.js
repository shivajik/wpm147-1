import axios from 'axios';

async function testUpdates() {
  try {
    console.log('Testing WordPress updates endpoint...');
    
    // First authenticate (using demo user)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'demo@test.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Get updates for website ID 1
    const updatesResponse = await axios.get('http://localhost:5000/api/websites/1/updates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n📊 WordPress Updates Results:');
    console.log('=====================================');
    console.log(`Website: ${updatesResponse.data.website_name}`);
    console.log(`URL: ${updatesResponse.data.website_url}`);
    console.log(`Timestamp: ${updatesResponse.data.timestamp}`);
    console.log('\n🔄 Available Updates:');
    
    const updates = updatesResponse.data.updates;
    console.log(`WordPress Core Update: ${updates.core_update_available ? '✅ Available' : '❌ Not Available'}`);
    if (updates.new_version) {
      console.log(`New Version: ${updates.new_version}`);
    }
    console.log(`Plugin Updates: ${updates.plugin_updates}`);
    console.log(`Theme Updates: ${updates.theme_updates}`);
    console.log(`Translation Updates: ${updates.translation_updates}`);
    
    console.log('\n🎯 Update Summary:');
    const totalUpdates = updates.plugin_updates + updates.theme_updates + (updates.core_update_available ? 1 : 0);
    console.log(`Total Updates Available: ${totalUpdates}`);
    
    if (totalUpdates === 0) {
      console.log('🎉 Your WordPress site is up to date!');
    } else {
      console.log('⚠️  Updates are available and should be applied.');
    }
    
  } catch (error) {
    console.error('❌ Error testing updates:', error.response?.data || error.message);
  }
}

testUpdates();