# WP Remote Manager Secure - Installation Guide

## Quick Installation

1. **Download**: You've already downloaded `wp-remote-manager-secure-v3.0.0.zip`
2. **Extract**: Unzip the file to reveal `wp-remote-manager-secure.php`
3. **Upload**: Upload the PHP file to your WordPress `/wp-content/plugins/` directory
4. **Activate**: Go to WordPress Admin → Plugins → Activate "WP Remote Manager Secure"
5. **Configure**: Go to Settings → Remote Manager Secure
6. **Generate API Key**: Click "Generate New API Key" and copy it
7. **Add to Dashboard**: Paste the API key in your AIO Webcare dashboard

## Detailed Installation Steps

### Step 1: File Upload Options

**Option A: Via WordPress Admin (Recommended)**
1. Go to WordPress Admin → Plugins → Add New
2. Click "Upload Plugin"
3. Choose the `wp-remote-manager-secure.php` file
4. Click "Install Now"
5. Click "Activate Plugin"

**Option B: Via FTP/cPanel File Manager**
1. Connect to your website via FTP or cPanel File Manager
2. Navigate to `/wp-content/plugins/` directory
3. Upload `wp-remote-manager-secure.php`
4. Go to WordPress Admin → Plugins
5. Find "WP Remote Manager Secure" and click "Activate"

### Step 2: Plugin Configuration

1. After activation, go to **WordPress Admin → Settings → Remote Manager Secure**
2. You'll see the plugin settings page with security status
3. Note the automatically generated API key (or generate a new one)
4. Copy the API key - you'll need this for your dashboard

### Step 3: Security Verification

Verify these security features are active:
- ✅ CSRF Protection: Active
- ✅ Rate Limiting: 60 requests/minute
- ✅ Input Validation: Enhanced
- ✅ Audit Logging: Enabled
- ✅ Information Disclosure: Limited

### Step 4: Dashboard Integration

1. Go to your AIO Webcare Dashboard
2. Navigate to "Add Website" or "Website Settings"
3. Enter your website URL
4. Paste the API key from Step 2
5. Test the connection

## Required WordPress Environment

- **WordPress Version**: 5.0 or higher (tested up to 6.8)
- **PHP Version**: 7.4 or higher
- **Memory Limit**: 128MB recommended
- **Permissions**: Plugin must be able to write to wp-content directory

## Optional: UpdraftPlus Integration

For backup functionality:
1. Install UpdraftPlus plugin (free or premium)
2. Configure your backup settings in UpdraftPlus
3. The Remote Manager will automatically detect and integrate with it

## Troubleshooting

### Plugin Not Visible After Upload
- Check file permissions (should be 644)
- Verify the file is in `/wp-content/plugins/` directory
- Make sure the file isn't corrupted during upload

### API Connection Issues
- Verify the API key is copied correctly (no extra spaces)
- Check if your hosting provider blocks external API calls
- Ensure WordPress REST API is not disabled

### Security Warnings
- If you see rate limiting warnings, wait 1 minute between requests
- For CSRF errors, regenerate your API key
- Check security logs in the plugin settings

## Security Best Practices

1. **Rotate API Keys**: Generate new keys every 30 days
2. **Monitor Logs**: Check security logs regularly in plugin settings
3. **Keep Updated**: Always use the latest plugin version
4. **Strong Passwords**: Ensure WordPress admin accounts have strong passwords
5. **SSL Required**: Use HTTPS for secure API communication

## Support

If you encounter issues:
1. Check the security logs in plugin settings
2. Verify WordPress and PHP version requirements
3. Test API endpoints manually using the provided URLs
4. Contact support with specific error messages

## API Endpoints Reference

After installation, these endpoints will be available:

- Status Check: `https://yoursite.com/wp-json/wrms/v1/status`
- Health Check: `https://yoursite.com/wp-json/wrms/v1/health`
- Updates: `https://yoursite.com/wp-json/wrms/v1/updates`

All endpoints require the `X-WRM-API-Key` header with your generated API key.