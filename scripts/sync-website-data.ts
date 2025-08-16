import { storage } from '../server/storage.js';

interface WRMStatusResponse {
  site_url: string;
  admin_email: string;
  wordpress_version: string;
  php_version: string;
  mysql_version: string;
  theme: {
    name: string;
    version: string;
  };
  plugins: Array<{
    name: string;
    version: string;
    active: boolean;
  }>;
  maintenance_mode: string;
  last_update_check: boolean;
  disk_usage: {
    used: string;
    free: string;
    total: string;
    percentage: number;
  };
  memory_usage: {
    current: string;
    peak: string;
    limit: string;
  };
  ssl_enabled: boolean;
  multisite: boolean;
  timestamp: string;
}

async function syncWebsiteData() {
  console.log('🔄 Starting website data sync for AS College Chincholi...');
  
  try {
    // Fetch status data from WP Remote Manager
    const response = await fetch('https://ascollegechincholi.com/wp-json/wrm/v1/status', {
      headers: {
        'X-WRM-API-Key': 'sVWd014sp0b1xmXZGUItiMYB1v7h3c3O',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WRMStatusResponse = await response.json();
    console.log('✅ Successfully fetched website data');
    
    // Count active plugins
    const activePlugins = data.plugins.filter(plugin => plugin.active);
    const inactivePlugins = data.plugins.filter(plugin => !plugin.active);
    
    // Prepare WordPress data object
    const wpData = {
      wordpress_version: data.wordpress_version,
      php_version: data.php_version,
      mysql_version: data.mysql_version,
      theme: data.theme,
      plugins: data.plugins,
      disk_usage: data.disk_usage,
      memory_usage: data.memory_usage,
      ssl_enabled: data.ssl_enabled,
      multisite: data.multisite,
      stats: {
        total_plugins: data.plugins.length,
        active_plugins: activePlugins.length,
        inactive_plugins: inactivePlugins.length,
        themes_count: 3, // As mentioned in the request
        pending_updates: 10, // As mentioned in the request
      },
      last_sync: new Date().toISOString()
    };

    // Update website data in database
    const website = await storage.getWebsite(1, 1); // websiteId=1, userId=1
    if (!website) {
      throw new Error('Website not found in database');
    }

    await storage.updateWebsite(1, {
      wpVersion: data.wordpress_version,
      lastSync: new Date(),
      connectionStatus: 'connected',
      healthStatus: 'good',
      wpData: JSON.stringify(wpData)
    }, 1); // userId=1

    console.log('📊 Website data summary:');
    console.log(`- WordPress: ${data.wordpress_version}`);
    console.log(`- PHP: ${data.php_version}`);
    console.log(`- MySQL: ${data.mysql_version}`);
    console.log(`- Theme: ${data.theme.name} v${data.theme.version}`);
    console.log(`- Total Plugins: ${data.plugins.length}`);
    console.log(`- Active Plugins: ${activePlugins.length}`);
    console.log(`- Inactive Plugins: ${inactivePlugins.length}`);
    console.log(`- SSL Enabled: ${data.ssl_enabled ? 'Yes' : 'No'}`);
    console.log(`- Disk Usage: ${data.disk_usage.used} of ${data.disk_usage.total} (${data.disk_usage.percentage.toFixed(1)}%)`);
    console.log(`- Memory Limit: ${data.memory_usage.limit}`);
    
    console.log('✅ Website data successfully synced to database');
    
  } catch (error) {
    console.error('❌ Error syncing website data:', error);
    throw error;
  }
}

// Run the sync
syncWebsiteData().catch(console.error);