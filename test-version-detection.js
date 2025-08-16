const jwt = require('jsonwebtoken');

// Test script to check version detection
async function testVersionDetection() {
  try {
    // Generate JWT token for user ID 1 (demo@wpmaintenance.com)
    const token = jwt.sign(
      { id: 1, email: 'demo@wpmaintenance.com' },
      'your-secret-key-change-in-production'
    );
    
    console.log('Testing version detection for plugin update...');
    
    const response = await fetch('http://localhost:3000/api/websites/2/update-plugin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plugin: 'snapshot-backups/snapshot-backups.php'
      })
    });
    
    const result = await response.json();
    console.log('Update response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testVersionDetection();