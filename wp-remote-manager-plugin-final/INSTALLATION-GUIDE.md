# WP Remote Manager Enhanced Users - Installation Guide

## 🚀 Quick 5-Minute Setup

### Step 1: Download & Upload
1. **Download** the `wp-remote-manager-enhanced-users.php` file
2. **Connect** to your WordPress site via FTP, cPanel File Manager, or hosting control panel
3. **Navigate** to `/wp-content/plugins/` directory
4. **Upload** the `wp-remote-manager-enhanced-users.php` file

### Step 2: Activate Plugin
1. **Login** to WordPress Admin Dashboard
2. **Go to** Plugins → Installed Plugins
3. **Find** "WP Remote Manager - Enhanced Users v3.2.0 Final"
4. **Click** "Activate"

### Step 3: Get API Key
1. **Go to** Settings → WP Remote Manager
2. **Copy** the 64-character API key that's automatically generated
3. **Save** this key - you'll need it for your dashboard

### Step 4: Connect to Dashboard
1. **Open** your AIO Webcare Dashboard
2. **Go to** Websites → Add Website or Edit existing website
3. **Paste** the API key in the "WRM API Key" field
4. **Click** "Test Connection" - should show green status
5. **Save** the website configuration

## ✅ Verification Checklist

After installation, verify these features work:

### Core Functionality
- [ ] Site status shows "Connected" in dashboard
- [ ] WordPress version is displayed correctly
- [ ] Plugin and theme counts are accurate
- [ ] System information is populated

### Enhanced User Features
- [ ] User list displays in dashboard
- [ ] **Email addresses are visible** (not "Private (WordPress security)")
- [ ] User roles and registration dates show correctly
- [ ] Login tracking data is available

### Update Management
- [ ] Available updates are detected
- [ ] WordPress core updates show when available
- [ ] Plugin updates are listed correctly
- [ ] Theme updates are detected

### Advanced Features
- [ ] Maintenance mode status is available
- [ ] Backup status shows (if UpdraftPlus installed)
- [ ] Plugin activation/deactivation works
- [ ] Theme switching works

## 🔧 Alternative Installation Methods

### Method 1: WordPress Admin Upload
1. **Download** the plugin file
2. **Go to** Plugins → Add New
3. **Click** "Upload Plugin"
4. **Choose** the downloaded file
5. **Install** and **Activate**

### Method 2: Via Hosting Control Panel
1. **Access** cPanel or hosting file manager
2. **Navigate** to `public_html/wp-content/plugins/`
3. **Upload** the plugin file
4. **Set permissions** to 644 if needed
5. **Activate** via WordPress admin

### Method 3: Via SSH (Advanced Users)
```bash
# Navigate to plugins directory
cd /path/to/wordpress/wp-content/plugins/

# Upload the plugin file (use scp, rsync, or wget)
wget https://your-domain.com/path/to/wp-remote-manager-enhanced-users.php

# Set proper permissions
chmod 644 wp-remote-manager-enhanced-users.php
```

## 🔑 API Key Management

### Generating New API Key
1. **Go to** Settings → WP Remote Manager
2. **Click** "Generate New Key"
3. **Confirm** the action (old key will be invalidated)
4. **Copy** the new 64-character key
5. **Update** your dashboard with the new key

### API Key Security
- **Keep Secure**: Never share your API key publicly
- **Use HTTPS**: Always use SSL-enabled sites
- **Regenerate**: Generate new keys if compromised
- **Monitor**: Check logs for suspicious activity

## 🚨 Troubleshooting Common Issues

### Issue: "Plugin endpoints not found"
**Symptoms**: Dashboard shows connection failed or endpoints not available

**Solutions**:
1. **Check Plugin Status**: Ensure plugin is activated
2. **Clear Cache**: Clear any WordPress caching plugins
3. **Check .htaccess**: Ensure REST API isn't blocked
4. **Verify Permalinks**: Go to Settings → Permalinks → Save Changes
5. **Test Manually**: Try `yoursite.com/wp-json/wrms/v1/health`

### Issue: "Invalid API key"
**Symptoms**: Authentication failed errors

**Solutions**:
1. **Regenerate Key**: Generate new API key in WordPress admin
2. **Check Spaces**: Ensure no extra spaces in copied key
3. **Verify Length**: Key should be exactly 64 characters
4. **Clear Browser Cache**: Sometimes old keys are cached

### Issue: "Permission denied"
**Symptoms**: 403 errors or access denied messages

**Solutions**:
1. **Check User Role**: Ensure you're logged in as administrator
2. **Plugin Permissions**: Check file permissions (644)
3. **Security Plugins**: Temporarily disable security plugins to test
4. **Hosting Restrictions**: Check with hosting provider about REST API access

### Issue: Users show "Private (WordPress security)"
**Symptoms**: User emails not displaying in dashboard

**Solutions**:
1. **Verify Plugin Version**: Ensure you're using v3.2.0 Final
2. **Check User Endpoint**: Test `/wp-json/wrms/v1/users` directly
3. **User Permissions**: Ensure API key has proper permissions
4. **Clear Plugin Cache**: Deactivate and reactivate plugin

### Issue: WordPress updates not showing
**Symptoms**: Core updates not detected

**Solutions**:
1. **Force Update Check**: Go to Dashboard → Updates
2. **Clear Transients**: Use a plugin like "Transients Manager"
3. **Check WordPress Version**: Ensure site isn't already up to date
4. **File Permissions**: Check wp-admin/includes/ permissions

## 📊 Testing Your Installation

### Manual Endpoint Tests

**Test Health (No Authentication)**:
```bash
curl https://yoursite.com/wp-json/wrms/v1/health
```
Expected: `{"status":"healthy","plugin":"WP Remote Manager Enhanced Users"...}`

**Test Status (With API Key)**:
```bash
curl -H "X-WRM-API-Key: YOUR_API_KEY" https://yoursite.com/wp-json/wrms/v1/status
```
Expected: Site information including WordPress version, theme, etc.

**Test Users (With API Key)**:
```bash
curl -H "X-WRM-API-Key: YOUR_API_KEY" https://yoursite.com/wp-json/wrms/v1/users
```
Expected: User list with email addresses visible

### Dashboard Tests
1. **Connection Test**: Click "Test Connection" - should be green
2. **User Display**: Check if user emails are visible
3. **Update Detection**: Verify updates are detected properly
4. **Plugin Management**: Try activating/deactivating a plugin

## 🔄 Migrating from Old Plugin

### If You Have Existing WP Remote Manager Plugin:

#### Option 1: Replace Existing Plugin
1. **Backup** current API key (if you want to keep it)
2. **Deactivate** old plugin
3. **Delete** old plugin files
4. **Upload** new enhanced plugin
5. **Activate** and configure

#### Option 2: Side-by-Side Installation
1. **Rename** old plugin file (add `.backup` extension)
2. **Upload** new plugin file
3. **Deactivate** old plugin
4. **Activate** new plugin
5. **Update** API key in dashboard

### Important Notes for Migration:
- **New API Key**: The enhanced plugin generates a new API key
- **Namespace Change**: Uses `wrms/v1` instead of `wrm/v1`
- **Enhanced Features**: New endpoints for maintenance mode, detailed users, etc.
- **Backward Compatibility**: Supports legacy headers for smooth transition

## 📞 Getting Help

### Before Contacting Support:
1. **Check Plugin Version**: Ensure you have v3.2.0 Final
2. **Test Endpoints Manually**: Use curl or browser to test API
3. **Check WordPress Health**: Go to Tools → Site Health
4. **Review Error Logs**: Check WordPress debug logs
5. **Try Different Browser**: Sometimes browser caching causes issues

### Common File Locations:
- **Plugin File**: `/wp-content/plugins/wp-remote-manager-enhanced-users.php`
- **Error Logs**: `/wp-content/debug.log` (if WP_DEBUG enabled)
- **WordPress Config**: `/wp-config.php`

### What to Include When Reporting Issues:
- WordPress version
- PHP version  
- Plugin version
- Error messages (exact text)
- Steps to reproduce the issue
- API endpoint test results

---

**Once installed successfully, you'll have the most comprehensive WordPress remote management solution available, with enhanced user data retrieval and enterprise-grade security features.**

*Installation Guide Version: 3.2.0 Final*  
*Compatible with WordPress 5.0+ and PHP 7.4+*