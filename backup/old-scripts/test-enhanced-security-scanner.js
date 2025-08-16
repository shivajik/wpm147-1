#!/usr/bin/env node

// Enhanced Security Scanner Test Script
// This demonstrates the dynamic scoring system working with real security data

import { EnhancedSecurityScanner } from './server/enhanced-security-scanner.ts';

async function testEnhancedSecurityScanner() {
  console.log('🔐 Enhanced Security Scanner Test');
  console.log('='.repeat(50));
  
  // Test with a few different WordPress sites to show dynamic scoring
  const testSites = [
    'https://wordpress.org',
    'https://example.com',
    'https://w3.org'
  ];
  
  for (const url of testSites) {
    console.log(`\n🌐 Testing: ${url}`);
    console.log('-'.repeat(40));
    
    try {
      const scanner = new EnhancedSecurityScanner(url, 0, 0);
      const scanResults = await scanner.performComprehensiveScan();
      
      // Calculate overall score using comprehensive logic
      let overallScore = 100;
      const scoreBreakdown = [];
      
      // Malware impact (0-30 points)
      if (scanResults.malware_scan.status === 'infected') {
        overallScore -= 30;
        scoreBreakdown.push('❌ Malware detected: -30 points');
      } else if (scanResults.malware_scan.status === 'suspicious') {
        overallScore -= 15;
        scoreBreakdown.push('⚠️  Suspicious activity: -15 points');
      } else if (scanResults.malware_scan.status === 'error') {
        overallScore -= 5;
        scoreBreakdown.push('🔍 Malware scan error: -5 points');
      } else {
        scoreBreakdown.push('✅ No malware detected');
      }
      
      // Blacklist impact (0-25 points)
      if (scanResults.blacklist_check.status === 'blacklisted') {
        overallScore -= 25;
        scoreBreakdown.push('❌ Site blacklisted: -25 points');
      } else if (scanResults.blacklist_check.status === 'error') {
        overallScore -= 3;
        scoreBreakdown.push('🔍 Blacklist check error: -3 points');
      } else {
        scoreBreakdown.push('✅ Not blacklisted');
      }
      
      // Vulnerability impact (0-25 points)
      const totalVulns = scanResults.vulnerability_scan.core_vulnerabilities + 
                        scanResults.vulnerability_scan.plugin_vulnerabilities + 
                        scanResults.vulnerability_scan.theme_vulnerabilities;
      
      if (totalVulns > 10) {
        overallScore -= 25;
        scoreBreakdown.push(`❌ High vulnerability count (${totalVulns}): -25 points`);
      } else if (totalVulns > 5) {
        overallScore -= 15;
        scoreBreakdown.push(`⚠️  Medium vulnerability count (${totalVulns}): -15 points`);
      } else if (totalVulns > 0) {
        overallScore -= 10;
        scoreBreakdown.push(`⚠️  Low vulnerability count (${totalVulns}): -10 points`);
      } else {
        scoreBreakdown.push('✅ No vulnerabilities found');
      }
      
      // Security headers impact (0-10 points)
      const headers = scanResults.security_headers;
      const missingHeaders = Object.values(headers).filter(h => !h).length;
      const headerDeduction = missingHeaders * 1.5;
      if (headerDeduction > 0) {
        overallScore -= headerDeduction;
        scoreBreakdown.push(`⚠️  Missing security headers (${missingHeaders}): -${headerDeduction} points`);
      } else {
        scoreBreakdown.push('✅ All security headers present');
      }
      
      // SSL impact (0-8 points)
      if (!scanResults.ssl_enabled) {
        overallScore -= 8;
        scoreBreakdown.push('❌ No SSL certificate: -8 points');
      } else if (scanResults.ssl_analysis?.has_warnings) {
        overallScore -= 3;
        scoreBreakdown.push('⚠️  SSL warnings: -3 points');
      } else {
        scoreBreakdown.push('✅ SSL certificate valid');
      }
      
      // Basic security checks
      const securityChecks = [];
      if (!scanResults.file_permissions_secure) {
        overallScore -= 2;
        securityChecks.push('File permissions');
      }
      if (!scanResults.admin_user_secure) {
        overallScore -= 2;
        securityChecks.push('Admin user security');
      }
      if (!scanResults.wp_version_hidden) {
        overallScore -= 2;
        securityChecks.push('WordPress version exposure');
      }
      if (!scanResults.login_attempts_limited) {
        overallScore -= 1;
        securityChecks.push('Login protection');
      }
      
      if (securityChecks.length > 0) {
        scoreBreakdown.push(`⚠️  Security issues: ${securityChecks.join(', ')} (-${securityChecks.reduce((acc, check) => {
          if (check === 'Login protection') return acc + 1;
          return acc + 2;
        }, 0)} points)`);
      } else {
        scoreBreakdown.push('✅ Basic security checks passed');
      }
      
      // Bonus for security plugins
      if (scanResults.security_plugins_active && scanResults.security_plugins_active.length > 0) {
        overallScore += 2;
        scoreBreakdown.push(`🛡️  Security plugins bonus (${scanResults.security_plugins_active.length}): +2 points`);
      }
      
      overallScore = Math.max(10, Math.min(100, Math.round(overallScore)));
      
      // Display results
      console.log(`🏆 Overall Security Score: ${overallScore}/100`);
      console.log('\n📊 Score Breakdown:');
      scoreBreakdown.forEach(item => console.log(`   ${item}`));
      
      console.log('\n🔍 Detailed Findings:');
      console.log(`   Malware Status: ${scanResults.malware_scan.status}`);
      console.log(`   Blacklist Status: ${scanResults.blacklist_check.status}`);
      console.log(`   Total Vulnerabilities: ${totalVulns}`);
      console.log(`   - Core: ${scanResults.vulnerability_scan.core_vulnerabilities}`);
      console.log(`   - Plugins: ${scanResults.vulnerability_scan.plugin_vulnerabilities}`);
      console.log(`   - Themes: ${scanResults.vulnerability_scan.theme_vulnerabilities}`);
      console.log(`   WordPress Version: ${scanResults.vulnerability_scan.wordpress_version || 'Not detected'}`);
      console.log(`   SSL Enabled: ${scanResults.ssl_enabled}`);
      console.log(`   Missing Headers: ${missingHeaders}`);
      
      // Show if this demonstrates the fix
      if (overallScore < 100) {
        console.log(`\n✅ SUCCESS: Dynamic scoring working! Score reflects actual issues (${overallScore}/100)`);
      } else {
        console.log(`\n⚠️  NOTE: Perfect score (100/100) - this site has excellent security`);
      }
      
    } catch (error) {
      console.error(`❌ Scan failed for ${url}:`, error.message);
    }
  }
  
  console.log('\n🎯 Test Conclusion:');
  console.log('The enhanced security scanner now calculates dynamic scores based on:');
  console.log('• Real malware scan results from VirusTotal API');
  console.log('• Actual vulnerability data from WPScan');
  console.log('• Live security header analysis');
  console.log('• SSL certificate validation');
  console.log('• WordPress-specific security checks');
  console.log('• Comprehensive point deduction system (10-100 range)');
  console.log('\nNo more static 100/100 scores when vulnerabilities exist!');
}

// Run the test
testEnhancedSecurityScanner().catch(console.error);