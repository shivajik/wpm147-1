import axios from 'axios';

async function debugPluginData() {
  try {
    // Test the actual endpoint our app is using
    const response = await axios.get('http://localhost:3000/api/websites/2/wrm-plugins', {
      headers: {
        'Cookie': 'connect.sid=s%3AeQf5gNuYdl36r2zfGKGruwE5kHWOkf3M.HQl%2FJSwP13CUsQVlm6eKsm1sOo9%2BAFhUFcPpUKQfP9o'
      }
    });
    
    console.log('Raw API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.plugins && response.data.plugins.length > 0) {
      console.log('\nFirst plugin structure:');
      console.log(JSON.stringify(response.data.plugins[0], null, 2));
      
      console.log('\nAvailable fields in first plugin:');
      console.log(Object.keys(response.data.plugins[0]));
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugPluginData();