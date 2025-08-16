// Test script to verify Vercel Performance Scanner integration
const axios = require('axios');

const VERCEL_URL = 'https://your-vercel-deployment-url.vercel.app'; // Update with actual Vercel URL
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

async function testVercelPerformanceScanner() {
  console.log('🔥 Testing Vercel Performance Scanner Integration...\n');

  let authToken = null;
  let websiteId = null;

  try {
    // Step 1: Login to get auth token
    console.log('1️⃣ Authenticating user...');
    const loginResponse = await axios.post(`${VERCEL_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Authentication successful');

    // Step 2: Get websites to find a test website
    console.log('\n2️⃣ Fetching websites...');
    const websitesResponse = await axios.get(`${VERCEL_URL}/api/websites`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (websitesResponse.data.length === 0) {
      console.log('❌ No websites found. Please add a website first.');
      return;
    }
    
    websiteId = websitesResponse.data[0].id;
    console.log(`✅ Found website: ${websitesResponse.data[0].name} (ID: ${websiteId})`);

    // Step 3: Test performance scan history (should work now)
    console.log('\n3️⃣ Testing performance scan history...');
    try {
      const historyResponse = await axios.get(`${VERCEL_URL}/api/websites/${websiteId}/performance-scans`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Performance scan history loaded: ${historyResponse.data.length} scans found`);
      
      if (historyResponse.data.length > 0) {
        console.log(`   Latest scan score: ${historyResponse.data[0].pagespeedScore}/100`);
      }
    } catch (error) {
      console.log(`❌ Performance scan history failed: ${error.response?.data?.message || error.message}`);
    }

    // Step 4: Test latest performance scan endpoint
    console.log('\n4️⃣ Testing latest performance scan...');
    try {
      const latestResponse = await axios.get(`${VERCEL_URL}/api/websites/${websiteId}/performance-scans/latest`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Latest performance scan loaded: Score ${latestResponse.data.pagespeedScore}/100`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  No previous scans found (expected for new websites)');
      } else {
        console.log(`❌ Latest performance scan failed: ${error.response?.data?.message || error.message}`);
      }
    }

    // Step 5: Test Google PageSpeed API integration (the main test)
    console.log('\n5️⃣ Testing Google PageSpeed API integration...');
    console.log('   This test will take 20-30 seconds for real API calls...');
    
    const startTime = Date.now();
    try {
      const scanResponse = await axios.post(`${VERCEL_URL}/api/websites/${websiteId}/performance-scan`, {
        region: 'us-east-1'
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 60000 // 60 second timeout for real API calls
      });
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`✅ Performance scan completed in ${duration} seconds`);
      console.log(`   PageSpeed Score: ${scanResponse.data.pagespeedScore}/100`);
      console.log(`   YSlow Score: ${scanResponse.data.yslowScore}/100`);
      console.log(`   Core Web Vitals: ${scanResponse.data.coreWebVitalsGrade}`);
      console.log(`   LCP: ${scanResponse.data.lcpScore}ms`);
      console.log(`   CLS: ${scanResponse.data.clsScore}`);
      console.log(`   Recommendations: ${scanResponse.data.recommendations.length} found`);
      
      // Verify this was a real scan (not mock data)
      if (duration > 10) {
        console.log('✅ REAL API INTEGRATION CONFIRMED - Scan took realistic time');
      } else {
        console.log('⚠️  Quick response - verify this isn\'t mock data');
      }
      
    } catch (error) {
      console.log(`❌ Performance scan failed: ${error.response?.data?.message || error.message}`);
      console.log(`   Error details: ${error.response?.data?.error || 'Unknown error'}`);
    }

    // Step 6: Verify scan was saved to database
    console.log('\n6️⃣ Verifying scan was saved to database...');
    try {
      const updatedHistoryResponse = await axios.get(`${VERCEL_URL}/api/websites/${websiteId}/performance-scans`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Updated scan history: ${updatedHistoryResponse.data.length} scans total`);
      
      if (updatedHistoryResponse.data.length > 0) {
        const latestScan = updatedHistoryResponse.data[0];
        console.log(`   Latest saved scan: Score ${latestScan.pagespeedScore}/100, Region: ${latestScan.scanRegion}`);
      }
    } catch (error) {
      console.log(`❌ Failed to verify saved scan: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 Vercel Performance Scanner test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Check if API key is available
console.log('🔑 Google PageSpeed API Key Check:');
if (process.env.GOOGLE_PAGESPEED_API_KEY) {
  console.log('✅ API key is available');
} else {
  console.log('❌ GOOGLE_PAGESPEED_API_KEY not found in environment');
}

// Instructions for running the test
console.log('\n📋 INSTRUCTIONS:');
console.log('1. Update VERCEL_URL with your actual Vercel deployment URL');
console.log('2. Make sure you have a test user account and website set up');
console.log('3. Update TEST_EMAIL and TEST_PASSWORD with valid credentials');
console.log('4. Run: node test-vercel-performance-scanner.js\n');

if (process.argv.includes('--run')) {
  testVercelPerformanceScanner();
} else {
  console.log('Add --run flag to execute the test: node test-vercel-performance-scanner.js --run');
}