#!/usr/bin/env node

/**
 * KSoft Solution API Key Test Script
 * This script will test different API keys to find the correct one
 */

const https = require('https');

const baseUrl = 'https://ksoftsolution.com';
const endpoint = '/wp-json/wrms/v1/status';

// Current API key from dashboard
const dashboardKey = '6e11f3998be461a66018cc30fefbf964ded20b34549098160547aeaa4f34ad1f';

// Common WordPress API keys to try (often auto-generated)
const testKeys = [
    dashboardKey,
    // Add some other possible keys that might be generated
];

async function testApiKey(apiKey, headerName = 'X-WRM-API-Key') {
    return new Promise((resolve) => {
        const options = {
            hostname: 'ksoftsolution.com',
            port: 443,
            path: endpoint,
            method: 'GET',
            headers: {
                [headerName]: apiKey,
                'User-Agent': 'KSoft-API-Test/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        key: apiKey,
                        header: headerName,
                        status: res.statusCode,
                        success: res.statusCode === 200,
                        response: response
                    });
                } catch (e) {
                    resolve({
                        key: apiKey,
                        header: headerName,
                        status: res.statusCode,
                        success: false,
                        error: 'Invalid JSON response',
                        response: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                key: apiKey,
                header: headerName,
                status: 0,
                success: false,
                error: error.message
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                key: apiKey,
                header: headerName,
                status: 0,
                success: false,
                error: 'Timeout'
            });
        });

        req.end();
    });
}

async function checkPluginStatus() {
    console.log('🔍 Testing KSoft Solution WordPress Remote Manager Plugin');
    console.log('='.repeat(60));
    
    // First check if plugin is installed
    console.log('\n1. Checking plugin health (no auth required)...');
    const healthResult = await testApiKey('', 'X-No-Auth');
    
    // Modify for health endpoint
    const healthOptions = {
        hostname: 'ksoftsolution.com',
        port: 443,
        path: '/wp-json/wrms/v1/health',
        method: 'GET'
    };
    
    const healthCheck = await new Promise((resolve) => {
        const req = https.request(healthOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        response: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        response: data
                    });
                }
            });
        });
        req.on('error', (e) => resolve({ status: 0, error: e.message }));
        req.end();
    });
    
    console.log('Health Check Result:', JSON.stringify(healthCheck, null, 2));
    
    if (healthCheck.status === 200) {
        console.log('✅ Plugin is installed and active');
        console.log(`   Version: ${healthCheck.response.version}`);
        console.log(`   WordPress: ${healthCheck.response.wordpress_version}`);
    } else {
        console.log('❌ Plugin health check failed');
        return;
    }
    
    // Test API keys
    console.log('\n2. Testing API keys...');
    console.log(`Current dashboard API key: ${dashboardKey}`);
    
    const headers = ['X-WRM-API-Key', 'X-WRMS-API-Key'];
    
    for (const header of headers) {
        console.log(`\n   Testing with header: ${header}`);
        const result = await testApiKey(dashboardKey, header);
        
        if (result.success) {
            console.log(`   ✅ SUCCESS with ${header}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Response keys: ${Object.keys(result.response).join(', ')}`);
        } else {
            console.log(`   ❌ FAILED with ${header}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Error: ${result.response.message || result.error}`);
        }
    }
    
    // Check both namespaces
    console.log('\n3. Testing both API namespaces...');
    const namespaces = ['/wp-json/wrms/v1/status', '/wp-json/wrm/v1/status'];
    
    for (const namespace of namespaces) {
        console.log(`\n   Testing namespace: ${namespace}`);
        
        const namespaceOptions = {
            hostname: 'ksoftsolution.com',
            port: 443,
            path: namespace,
            method: 'GET',
            headers: {
                'X-WRM-API-Key': dashboardKey
            }
        };
        
        const result = await new Promise((resolve) => {
            const req = https.request(namespaceOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            response: JSON.parse(data)
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            response: data
                        });
                    }
                });
            });
            req.on('error', (e) => resolve({ status: 0, error: e.message }));
            req.setTimeout(5000, () => {
                req.destroy();
                resolve({ status: 0, error: 'Timeout' });
            });
            req.end();
        });
        
        if (result.status === 200) {
            console.log(`   ✅ ${namespace} - Working`);
        } else if (result.status === 403) {
            console.log(`   🔑 ${namespace} - Plugin found, API key invalid`);
        } else if (result.status === 404) {
            console.log(`   ❌ ${namespace} - Endpoint not found`);
        } else {
            console.log(`   ⚠️  ${namespace} - Status ${result.status}: ${result.response.message || result.error}`);
        }
    }
}

// Run the check
checkPluginStatus().then(() => {
    console.log('\n🏁 Test completed');
}).catch((error) => {
    console.error('Test failed:', error);
});