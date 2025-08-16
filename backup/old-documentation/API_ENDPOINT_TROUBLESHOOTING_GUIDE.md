# API Endpoint Not Found - Complete Troubleshooting Guide

## Overview
The "API endpoint not found" error can occur in two main scenarios:
1. **WP Remote Manager API Key Updates** - WordPress site missing required plugin endpoints
2. **Login/Authentication Issues** - API routing problems on deployment

## Scenario 1: WP Remote Manager API Key Updates

### Problem
When updating or validating WP Remote Manager API keys, you see "API endpoint not found" error.

### Root Causes
1. **Missing WP Remote Manager Plugin** - Plugin not installed on WordPress site
2. **Outdated Plugin Version** - Old plugin version missing required endpoints
3. **Plugin Not Activated** - Plugin installed but not activated
4. **Incorrect API Key** - Wrong or expired API key
5. **WordPress REST API Disabled** - REST API blocked by security plugins

### Solutions

#### Step 1: Verify Plugin Installation
1. **Access WordPress Admin** → Plugins
2. **Look for**: "WP Remote Manager" or "WP Remote Manager Secure"
3. **Check Status**: Must be "Active"
4. **Version**: Should be v3.0.0 or higher

#### Step 2: Download Latest Plugin
If plugin is missing or outdated:
1. **Download**: [WP Remote Manager Secure v3.0.0](https://yourdomain.com/wp-remote-manager-secure-v3.0.0.zip)
2. **Install**: WordPress Admin → Plugins → Add New → Upload Plugin
3. **Activate**: After installation

#### Step 3: Verify API Key
1. **WordPress Admin** → Settings → WP Remote Manager
2. **Copy API Key** from settings page
3. **Update in Dashboard**: Use exact key from WordPress admin

#### Step 4: Test Endpoints Manually
Test if WordPress REST API endpoints are accessible:

```bash
# Test basic status endpoint
curl "https://yoursite.com/wp-json/wrms/v1/status" \
  -H "X-WRMS-API-Key: YOUR_API_KEY"

# Test legacy endpoint if above fails
curl "https://yoursite.com/wp-json/wrm/v1/status" \
  -H "X-WRM-API-Key: YOUR_API_KEY"
```

#### Step 5: Check WordPress REST API
Verify REST API is not blocked:
```bash
curl "https://yoursite.com/wp-json/"
```
Should return JSON, not HTML or 403 error.

### Required Plugin Endpoints
The WP Remote Manager plugin must provide these endpoints:
- `/wp-json/wrms/v1/status` or `/wp-json/wrm/v1/status`
- `/wp-json/wrms/v1/health` or `/wp-json/wrm/v1/health`
- `/wp-json/wrms/v1/updates` or `/wp-json/wrm/v1/updates`
- `/wp-json/wrms/v1/plugins` or `/wp-json/wrm/v1/plugins`
- `/wp-json/wrms/v1/themes` or `/wp-json/wrm/v1/themes`
- `/wp-json/wrms/v1/users` or `/wp-json/wrm/v1/users`

## Scenario 2: Login/Authentication Issues

### Problem
Login attempts fail with "API endpoint not found" on deployment (Vercel).

### Root Causes
1. **Serverless Function Issues** - API routes not properly deployed
2. **Route Conflicts** - Frontend/backend route conflicts
3. **CORS Issues** - Cross-origin request blocking
4. **Environment Variables** - Missing or incorrect environment variables

### Solutions

#### Step 1: Test API Health
Check if API is accessible:
```bash
curl "https://yourdomain.vercel.app/api/health"
curl "https://yourdomain.vercel.app/api/endpoints"
```

#### Step 2: Verify Login Endpoint
Test login endpoint directly:
```bash
curl -X POST "https://yourdomain.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@wpmaintenance.com", "password": "demo123"}'
```

#### Step 3: Check Environment Variables
Verify required environment variables are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`

#### Step 4: Review Deployment Logs
Check Vercel deployment logs for:
- Route registration errors
- Database connection issues
- Environment variable problems

## Common Error Messages and Solutions

### "rest_no_route" Error
**Cause**: WordPress REST API endpoint not found
**Solution**: Update or reinstall WP Remote Manager plugin

### "rest_forbidden" Error  
**Cause**: Invalid API key or insufficient permissions
**Solution**: Verify API key in WordPress admin

### "ECONNREFUSED" Error
**Cause**: Cannot connect to WordPress site
**Solution**: Check website URL and accessibility

### "Authentication Failed" Error
**Cause**: Invalid login credentials
**Solution**: Verify email/password or use demo account

## Prevention Tips

1. **Regular Plugin Updates**: Keep WP Remote Manager plugin updated
2. **API Key Rotation**: Regularly update API keys for security
3. **Monitor Endpoints**: Use health checks to verify API availability
4. **Backup Configuration**: Document working API configurations
5. **Test After Changes**: Always test after WordPress updates

## Emergency Access

If all else fails, use the **Demo Login** button:
- **Email**: demo@wpmaintenance.com  
- **Password**: demo123

This bypasses API key issues and allows access to the dashboard for troubleshooting.

## Support Information

For persistent issues:
1. **Check Network Tab** in browser developer tools
2. **Review Console Logs** for detailed error messages
3. **Test WordPress Admin** to ensure site is accessible
4. **Verify Plugin Status** in WordPress admin

## Enhanced Error Handling

The system now provides detailed error messages:
- **PLUGIN_NOT_INSTALLED**: Plugin missing or outdated
- **INVALID_API_KEY**: Wrong API key
- **CONNECTION_FAILED**: Cannot reach WordPress site
- **TIMEOUT**: Site responding too slowly
- **ENDPOINT_NOT_FOUND**: API route missing

Each error includes specific guidance for resolution.