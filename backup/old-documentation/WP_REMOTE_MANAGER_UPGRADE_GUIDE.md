# WP Remote Manager Secure Upgrade Guide

## Quick Start

### 1. Replace the Plugin File
1. **Download** the secure plugin: `wp-remote-manager-secure.php`
2. **Backup** your current plugin file
3. **Replace** the old plugin with the secure version
4. **Reactivate** the plugin in WordPress admin

### 2. Configure API Key
1. Go to **WordPress Admin → Settings → Remote Manager Secure**
2. **Generate a new API key** (recommended)
3. **Copy the API key** for use in your dashboard
4. **Update** the API key in your WordPress Maintenance Dashboard

### 3. Update Dashboard Configuration
In your WordPress Maintenance Dashboard:
1. Navigate to **Website Details**
2. **Update the API key** with the new one from WordPress
3. **Test the connection** to ensure it works

---

## Detailed Migration Steps

### Step 1: Backup Current Setup
```bash
# Backup the current plugin
cp /path/to/wordpress/wp-content/plugins/wp-remote-manager.php wp-remote-manager-backup.php

# Backup WordPress database (if using UpdraftPlus)
# Or backup manually through your hosting provider
```

### Step 2: Install Secure Plugin

#### Option A: Manual Installation
1. Upload `wp-remote-manager-secure.php` to `/wp-content/plugins/`
2. Deactivate the old plugin
3. Delete the old plugin file
4. Activate the new secure plugin

#### Option B: Replace in Place
1. Deactivate the current plugin
2. Replace `wp-remote-manager.php` with `wp-remote-manager-secure.php`
3. Rename the file to `wp-remote-manager.php` (optional, for compatibility)
4. Reactivate the plugin

### Step 3: Security Configuration

#### Generate New API Key
1. Navigate to **Settings → Remote Manager Secure**
2. Click **"Generate New API Key"**
3. Confirm the regeneration
4. Copy the new 64-character API key

#### Configure Security Settings
The secure plugin automatically enables:
- ✅ CSRF Protection
- ✅ Rate Limiting (60 requests/minute)
- ✅ Enhanced Input Validation
- ✅ Audit Logging
- ✅ Secure API Key Management

### Step 4: Update Dashboard Connection

#### Update API Credentials
1. Open your WordPress Maintenance Dashboard
2. Go to **Websites** → Select your site → **Settings**
3. Update the **API Key** field with the new key
4. Save changes

#### Test Connection
1. Navigate to the **Website Overview** page
2. Click **"Sync WordPress Data"**
3. Verify all sections load correctly:
   - System Information
   - Health Check
   - Available Updates
   - Plugin/Theme Lists

---

## Troubleshooting

### Common Issues

#### 1. "API key not configured" Error
**Cause:** The secure plugin requires explicit API key configuration
**Solution:**
1. Go to WordPress Admin → Settings → Remote Manager Secure
2. Generate a new API key
3. Copy and update in your dashboard

#### 2. "Invalid API key" Error
**Cause:** API key mismatch between plugin and dashboard
**Solution:**
1. Regenerate API key in WordPress admin
2. Update the key in your dashboard settings
3. Ensure no extra spaces or characters

#### 3. "Rate limit exceeded" Error
**Cause:** Too many requests in a short time (security feature)
**Solution:**
1. Wait 1 minute before retrying
2. The limit is 60 requests per minute per API key
3. Normal usage should not trigger this

#### 4. Endpoints Not Found (404)
**Cause:** Plugin not activated or old endpoint URLs cached
**Solution:**
1. Verify plugin is activated
2. Clear any caches (WordPress, hosting, CDN)
3. Check WordPress permalink settings

### Compatibility Check

#### WordPress Version
- ✅ WordPress 5.0+
- ✅ WordPress 6.0+
- ✅ WordPress 6.8+ (tested)

#### PHP Version
- ✅ PHP 7.4+
- ✅ PHP 8.0+
- ✅ PHP 8.1+
- ✅ PHP 8.2+

#### Required Functions
The plugin checks for these WordPress functions:
- `wp_generate_password()` - For secure key generation
- `wp_verify_nonce()` - For CSRF protection
- `get_plugins()` - For plugin management
- `activate_plugin()` - For plugin activation

---

## Security Features Overview

### 🔒 Enhanced Security Features

#### 1. **Secure API Key Management**
- No hardcoded fallback keys
- 64-character cryptographically secure keys
- Automatic rotation reminders
- Creation timestamp tracking

#### 2. **CSRF Protection**
- WordPress nonce verification
- Secure form submissions
- Protection against cross-site attacks

#### 3. **Rate Limiting**
- 60 requests per minute per API key
- IP-based tracking
- Automatic violation logging
- Graceful error responses

#### 4. **Input Validation**
- Regex pattern validation for paths
- Directory traversal protection
- Sanitization of all inputs
- Type checking for parameters

#### 5. **Audit Logging**
- All API requests logged
- Security events tracked
- Failed authentication attempts
- Admin interface for log review

#### 6. **Limited Information Disclosure**
- Removed sensitive server details
- No admin email exposure
- Minimal error information
- Secure error handling

### 🛡️ Backward Compatibility

The secure plugin maintains compatibility with:
- ✅ All existing API endpoints
- ✅ Same response data structures
- ✅ UpdraftPlus backup integration
- ✅ Existing dashboard connections (after API key update)

---

## Performance Impact

### Resource Usage
- **Memory**: +2-3MB (for security features)
- **Database**: 1 additional table for security logs
- **Performance**: <5ms additional processing per request
- **Storage**: Security logs auto-rotate (max 100 entries)

### Network Impact
- **Headers**: 2 additional headers per request
- **Response Size**: Unchanged for data endpoints
- **Rate Limiting**: May slow rapid successive requests (security feature)

---

## Monitoring & Maintenance

### Security Event Monitoring
1. **WordPress Admin → Settings → Remote Manager Secure**
2. View **"Recent Security Events"** section
3. Monitor for:
   - Failed authentication attempts
   - Rate limit violations
   - Invalid API key usage

### API Key Rotation
**Recommended Schedule**: Every 30 days

**Process:**
1. Generate new API key in WordPress
2. Update dashboard configuration
3. Test all connections
4. Monitor for 24 hours

### Log Management
- Logs auto-rotate (100 entries max)
- Export logs for external analysis if needed
- Monitor patterns for security insights

---

## Support & Updates

### Getting Help
1. Check this guide for common issues
2. Review security event logs for specific errors
3. Test with a fresh API key generation
4. Verify WordPress and PHP version compatibility

### Future Updates
- Plugin includes automatic update notifications
- Security patches will be prioritized
- Feature updates will maintain backward compatibility
- API versioning ensures stability

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current WordPress site
- [ ] Document current API key
- [ ] Test current functionality
- [ ] Note any custom configurations

### During Migration
- [ ] Replace plugin file
- [ ] Activate secure plugin
- [ ] Generate new API key
- [ ] Update dashboard settings
- [ ] Test all connections

### Post-Migration
- [ ] Verify all features work
- [ ] Check security event logs
- [ ] Monitor for 24 hours
- [ ] Update documentation
- [ ] Schedule regular API key rotation

### Rollback Plan (if needed)
- [ ] Restore original plugin file
- [ ] Revert to previous API key
- [ ] Test original functionality
- [ ] Document any issues for resolution

This upgrade provides significant security improvements while maintaining full functionality. The enhanced protection against common vulnerabilities makes this essential for production environments.