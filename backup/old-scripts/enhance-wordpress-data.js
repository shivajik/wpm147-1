// Enhanced WordPress data retrieval script to get plugin authors and all themes
// This will help us understand what data is available from the WordPress site

import axios from 'axios';

const API_BASE = 'https://ascollegechincholi.com/wp-json';
const WRM_API_KEY = 'sVWd014sp0b1xmXZGUItiMYB1v7h3c3O';

async function enhanceWordPressData() {
  console.log('🔍 Analyzing WordPress site capabilities...\n');

  // Test available namespaces and routes
  try {
    console.log('📋 Available API namespaces:');
    const root = await axios.get(`${API_BASE}/`);
    const namespaces = root.data.namespaces || [];
    namespaces.forEach(ns => console.log(`  - ${ns}`));
    console.log('');
  } catch (error) {
    console.log('Failed to get API root info');
  }

  // Test WP Remote Manager status with detailed logging
  try {
    console.log('🔧 WP Remote Manager detailed status:');
    const response = await axios.get(`${API_BASE}/wrm/v1/status`, {
      headers: { 'X-WRM-API-Key': WRM_API_KEY }
    });
    
    const data = response.data;
    console.log(`WordPress: ${data.wordpress_version}`);
    console.log(`PHP: ${data.php_version}`);
    console.log(`Theme: ${data.theme?.name} v${data.theme?.version}`);
    console.log(`Plugins: ${data.plugins?.length || 0} total`);
    
    if (data.plugins && data.plugins.length > 0) {
      console.log('\n📦 Plugin details:');
      data.plugins.slice(0, 5).forEach((plugin, i) => {
        console.log(`  ${i+1}. ${plugin.name} v${plugin.version} (${plugin.active ? 'Active' : 'Inactive'})`);
        if (plugin.author) console.log(`     Author: ${plugin.author}`);
        if (plugin.description) console.log(`     Description: ${plugin.description.substring(0, 80)}...`);
      });
      if (data.plugins.length > 5) {
        console.log(`  ... and ${data.plugins.length - 5} more plugins`);
      }
    }
    
    console.log('');
  } catch (error) {
    console.log('❌ WRM status failed:', error.response?.status, error.response?.data?.message);
  }

  // Test theme discovery methods
  console.log('🎨 Theme discovery methods:');
  
  // Method 1: Try themes endpoint (usually restricted)
  try {
    const themes = await axios.get(`${API_BASE}/wp/v2/themes`);
    console.log(`✅ Found ${themes.data.length} themes via REST API`);
  } catch (error) {
    console.log('❌ Themes REST API blocked (normal)');
  }
  
  // Method 2: Try with authentication
  try {
    const themes = await axios.get(`${API_BASE}/wp/v2/themes`, {
      auth: { username: 'ascollegechincholi', password: 'hrG4 n3eL QrVe OWWt nOg9 6ksQ' }
    });
    console.log(`✅ Found ${themes.data.length} themes via authenticated REST API`);
    themes.data.forEach(theme => {
      console.log(`  - ${theme.name?.rendered || theme.name} v${theme.version} by ${theme.author?.rendered || theme.author}`);
    });
  } catch (error) {
    console.log('❌ Authenticated themes API failed:', error.response?.status);
  }

  console.log('\n🔍 Checking plugin data enrichment possibilities...');
  
  // Check if we can get more plugin details from the WordPress.org API
  try {
    const popularPlugin = 'contact-form-7';
    const pluginInfo = await axios.get(`https://api.wordpress.org/plugins/info/1.0/${popularPlugin}.json`);
    console.log(`✅ WordPress.org API available for plugin info`);
    console.log(`  Example: ${pluginInfo.data.name} by ${pluginInfo.data.author}`);
  } catch (error) {
    console.log('❌ WordPress.org plugin API not accessible');
  }
}

enhanceWordPressData().catch(console.error);