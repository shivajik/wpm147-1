# AI Agent Instructions: WP Remote Manager Backup Endpoints Implementation

## Task Overview
You need to add backup monitoring endpoints to an existing WordPress plugin called "WP Remote Manager". The backup creation functionality is working, but status monitoring fails because the plugin lacks proper REST API endpoints.

## Current Situation
- ✅ Database backup creation works correctly
- ✅ Manual trigger instructions are provided to users
- ❌ Backup status monitoring fails with "rest_no_route" error
- ❌ Missing backup endpoints in WRM plugin

## Your Mission
Add backup monitoring REST API endpoints to the existing WP Remote Manager WordPress plugin to enable real-time backup status tracking and UpdraftPlus integration.

## Required Files to Implement

### 1. Main Implementation File
**Source:** Use the complete code from `WP_REMOTE_MANAGER_BACKUP_ENDPOINTS.php` in the project root.

**Target Location:** Add this code to the existing WP Remote Manager plugin file:
```
wp-content/plugins/wp-remote-manager/wp-remote-manager.php
```

### 2. Implementation Strategy
- Locate the existing `add_action('rest_api_init', ...)` sections in the plugin
- Add the new backup endpoints AFTER the existing endpoint registrations
- Ensure the authentication function `wrm_verify_api_key` is compatible

## Endpoints to Implement

### Required REST API Endpoints:
1. **GET** `/wp-json/wrm/v1/backup/status` - Get current backup status
2. **GET** `/wp-json/wrm/v1/backup/list` - List available backups
3. **POST** `/wp-json/wrm/v1/backup/trigger` - Trigger backup (manual instructions)
4. **GET** `/wp-json/wrm/v1/backup/config` - Get backup configuration
5. **GET** `/wp-json/wrm/v1/backup/plugin-status` - Check UpdraftPlus status

### Key Functions to Add:
- `wrm_get_backup_status()` - Returns current backup job status
- `wrm_list_backups()` - Returns available backup history
- `wrm_trigger_backup()` - Provides manual trigger guidance
- `wrm_get_backup_config()` - Returns UpdraftPlus settings
- `wrm_get_backup_plugin_status()` - Checks plugin installation

## Integration Requirements

### Authentication Integration
The code includes a fallback authentication function, but you should:
1. Check if `wrm_authenticate_request()` already exists in the plugin
2. If it exists, use that function name in the permission callbacks
3. If not, use the provided `wrm_verify_api_key()` function

### UpdraftPlus Integration Points
The endpoints need to interact with:
- `get_option('updraft_backup_history')` - Backup history
- `get_option('updraft_interval')` - Backup settings
- `is_plugin_active('updraftplus/updraftplus.php')` - Plugin status
- `UpdraftPlus_Options::get_updraft_option()` - Active jobs (if available)

## Expected Responses

### Backup Status Response:
```json
{
  "success": true,
  "status": "idle|running",
  "active_jobs": [],
  "last_backup": {
    "timestamp": 1641234567,
    "date": "2024-01-01 12:00:00",
    "status": "completed",
    "size": 1048576
  },
  "plugin_version": "1.24.x"
}
```

### Plugin Status Response:
```json
{
  "success": true,
  "plugin_status": {
    "installed": true,
    "active": true,
    "version": "1.24.x"
  },
  "backup_ready": true
}
```

## Error Handling Requirements

### Plugin Not Available:
```json
{
  "success": false,
  "error": "UpdraftPlus plugin is not installed or active",
  "status": "plugin_not_available"
}
```

### Missing Authentication:
```json
{
  "error": {
    "code": "missing_api_key",
    "message": "API key is required"
  },
  "status": 401
}
```

## Testing Instructions

### 1. Test Plugin Status Endpoint
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
https://yoursite.com/wp-json/wrm/v1/backup/plugin-status
```

### 2. Test Backup Status Endpoint
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
https://yoursite.com/wp-json/wrm/v1/backup/status
```

### 3. Test List Backups Endpoint
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
https://yoursite.com/wp-json/wrm/v1/backup/list
```

## WordPress Plugin Context

### Plugin Structure Expected:
```php
<?php
/**
 * Plugin Name: WP Remote Manager
 * Description: Remote management for WordPress sites
 */

// Existing plugin code...

// Existing endpoint registrations...
add_action('rest_api_init', function() {
    // Existing endpoints...
});

// ADD NEW BACKUP ENDPOINTS HERE
// (Insert the complete code from WP_REMOTE_MANAGER_BACKUP_ENDPOINTS.php)

?>
```

## Critical Implementation Notes

### 1. WordPress Hooks Integration
- Use `add_action('rest_api_init', ...)` for endpoint registration
- Follow WordPress REST API standards
- Include proper permission callbacks

### 2. Data Sources
- Use WordPress `get_option()` for UpdraftPlus settings
- Check plugin status with `is_plugin_active()`
- Integrate with existing WRM authentication

### 3. Response Format
- Always return JSON responses
- Include `success` boolean field
- Provide meaningful error messages
- Use proper HTTP status codes

## Validation Checklist

After implementation, verify:
- [ ] All 5 endpoints respond without 404 errors
- [ ] Authentication works with existing API key system
- [ ] UpdraftPlus plugin status is detected correctly
- [ ] Backup history is retrieved from WordPress options
- [ ] Error handling works for missing plugins
- [ ] JSON responses follow expected format

## Integration with Dashboard

The dashboard expects these endpoint responses to:
1. Stop showing "rest_no_route" errors in logs
2. Enable real-time backup status monitoring
3. Update backup history automatically
4. Provide proper user feedback

## Success Criteria

✅ **Implementation Complete When:**
- Backup status monitoring works without errors
- Dashboard shows real-time backup progress
- UpdraftPlus integration is fully functional
- All endpoints return proper JSON responses
- Authentication works seamlessly

The goal is to enable the existing dashboard backup functionality to work with proper WordPress plugin backend support.