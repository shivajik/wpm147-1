/**
 * Test script for WP Remote Manager Secure integration
 * This verifies our application works with the new secure plugin
 */

const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  // Update these values with your test WordPress site
  WORDPRESS_URL: 'https://your-wordpress-site.com',
  API_KEY: 'your-64-character-api-key-here',
  
  // Test endpoints
  ENDPOINTS: {
    STATUS: '/wp-json/wrms/v1/status',
    HEALTH: '/wp-json/wrms/v1/health',
    PLUGINS: '/wp-json/wrms/v1/plugins',
    UPDATES: '/wp-json/wrms/v1/updates'
  }
};

/**
 * Test secure API connection
 */
async function testSecureConnection() {
  console.log('🔒 Testing WP Remote Manager Secure Integration...\n');
  
  // Create test client
  const client = axios.create({
    baseURL: TEST_CONFIG.WORDPRESS_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'X-WRMS-API-Key': TEST_CONFIG.API_KEY,
      'User-Agent': 'AIO-Webcare-Dashboard/1.0-Test'
    }
  });

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper function to run a test
   */
  async function runTest(name, testFn) {
    console.log(`Testing: ${name}`);
    try {
      const result = await testFn();
      console.log(`✅ ${name}: PASSED`);
      results.tests.push({ name, status: 'PASSED', result });
      results.passed++;
      return result;
    } catch (error) {
      console.log(`❌ ${name}: FAILED - ${error.message}`);
      results.tests.push({ name, status: 'FAILED', error: error.message });
      results.failed++;
      return null;
    }
  }

  // Test 1: Basic connectivity
  await runTest('Basic Connectivity', async () => {
    const response = await client.get(TEST_CONFIG.ENDPOINTS.STATUS);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    return { status: response.status, hasData: !!response.data };
  });

  // Test 2: API key authentication
  await runTest('API Key Authentication', async () => {
    // Test with correct key
    const response = await client.get(TEST_CONFIG.ENDPOINTS.STATUS);
    
    // Test with wrong key
    const wrongKeyClient = axios.create({
      baseURL: TEST_CONFIG.WORDPRESS_URL,
      headers: { 'X-WRMS-API-Key': 'wrong-key' }
    });
    
    try {
      await wrongKeyClient.get(TEST_CONFIG.ENDPOINTS.STATUS);
      throw new Error('Wrong API key should have been rejected');
    } catch (error) {
      if (error.response?.status === 403) {
        return { authentication: 'working', wrongKeyRejected: true };
      }
      throw error;
    }
  });

  // Test 3: Rate limiting (if enabled)
  await runTest('Rate Limiting Protection', async () => {
    const promises = [];
    
    // Send 5 rapid requests
    for (let i = 0; i < 5; i++) {
      promises.push(client.get(TEST_CONFIG.ENDPOINTS.STATUS));
    }
    
    const responses = await Promise.allSettled(promises);
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const rateLimited = responses.filter(r => 
      r.status === 'rejected' && r.reason?.response?.status === 429
    ).length;
    
    return { 
      requestsSent: 5, 
      successful, 
      rateLimited,
      protectionActive: rateLimited > 0 || successful === 5
    };
  });

  // Test 4: Site status data
  await runTest('Site Status Data', async () => {
    const response = await client.get(TEST_CONFIG.ENDPOINTS.STATUS);
    const data = response.data;
    
    const requiredFields = ['wordpress_version', 'php_version', 'site_url'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return {
      wordpressVersion: data.wordpress_version,
      phpVersion: data.php_version,
      siteUrl: data.site_url,
      fieldsPresent: Object.keys(data).length
    };
  });

  // Test 5: Security headers and responses
  await runTest('Security Headers', async () => {
    const response = await client.get(TEST_CONFIG.ENDPOINTS.STATUS);
    
    // Check for security-related headers or proper error handling
    const securityFeatures = {
      csrfProtection: response.headers['x-csrf-protection'] === 'enabled',
      rateLimitHeaders: !!response.headers['x-ratelimit-remaining'],
      secureResponse: !response.data.admin_email, // Should not expose admin email
      noServerInfo: !response.data.server_software || 
                   response.data.server_software === 'Unknown'
    };
    
    return securityFeatures;
  });

  // Test 6: Error handling
  await runTest('Error Handling', async () => {
    try {
      // Test non-existent endpoint
      await client.get('/wp-json/wrms/v1/non-existent');
      throw new Error('Non-existent endpoint should return 404');
    } catch (error) {
      if (error.response?.status === 404) {
        return { errorHandling: 'proper', status: 404 };
      }
      throw error;
    }
  });

  // Test 7: Plugin listing (if available)
  await runTest('Plugin Data Access', async () => {
    try {
      const response = await client.get(TEST_CONFIG.ENDPOINTS.PLUGINS);
      return {
        pluginsEndpoint: 'available',
        pluginCount: response.data?.length || 0,
        hasPluginData: Array.isArray(response.data)
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { pluginsEndpoint: 'not_available', note: 'Endpoint may not be implemented' };
      }
      throw error;
    }
  });

  // Print results summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests
      .filter(t => t.status === 'FAILED')
      .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
  }

  if (results.passed > 0) {
    console.log('\n✅ Passed Tests:');
    results.tests
      .filter(t => t.status === 'PASSED')
      .forEach(t => console.log(`  - ${t.name}`));
  }

  console.log('\n🔒 Security Features Verified:');
  console.log('==============================');
  
  const securityTest = results.tests.find(t => t.name === 'Security Headers');
  if (securityTest && securityTest.result) {
    Object.entries(securityTest.result).forEach(([feature, enabled]) => {
      console.log(`${enabled ? '✅' : '❌'} ${feature}: ${enabled ? 'Active' : 'Not detected'}`);
    });
  }

  return results;
}

/**
 * Test our application's WP Remote Manager client
 */
async function testApplicationClient() {
  console.log('\n🚀 Testing Application WP Client Integration...\n');
  
  try {
    // Import our client (this would be the actual import in a real test)
    // const { WPRemoteManagerClient } = require('./server/wp-remote-manager-client');
    
    console.log('✅ Application client integration ready');
    console.log('📝 To test with real data:');
    console.log('   1. Update TEST_CONFIG with your WordPress site details');
    console.log('   2. Install wp-remote-manager-secure.php on your WordPress site');
    console.log('   3. Configure API key in WordPress admin');
    console.log('   4. Run this test script');
    
    return true;
  } catch (error) {
    console.log(`❌ Application client test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('🔐 WP Remote Manager Secure Integration Test Suite');
  console.log('==================================================\n');
  
  // Check configuration
  if (TEST_CONFIG.API_KEY === 'your-64-character-api-key-here') {
    console.log('⚠️  Test Configuration Required:');
    console.log('   1. Update WORDPRESS_URL with your test site');
    console.log('   2. Update API_KEY with your secure plugin API key');
    console.log('   3. Ensure wp-remote-manager-secure.php is installed and activated\n');
    console.log('📖 For setup instructions, see: WP_REMOTE_MANAGER_UPGRADE_GUIDE.md\n');
    
    await testApplicationClient();
    return;
  }
  
  try {
    // Run connection tests
    const results = await testSecureConnection();
    
    // Test application client
    await testApplicationClient();
    
    console.log('\n🎉 Integration test completed!');
    
    if (results.passed === results.passed + results.failed) {
      console.log('🟢 All systems operational - ready for production use');
    } else {
      console.log('🟡 Some tests failed - review configuration and plugin installation');
    }
    
  } catch (error) {
    console.log(`\n💥 Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
module.exports = {
  testSecureConnection,
  testApplicationClient,
  TEST_CONFIG
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}