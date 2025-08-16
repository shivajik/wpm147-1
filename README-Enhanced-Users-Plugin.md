# WP Remote Manager - Enhanced Users Plugin v3.1.0

## 🚀 What's New in v3.1.0

This enhanced version of the WordPress Remote Manager plugin now includes **user email addresses and detailed user metadata** - just like ManageWP and other professional WordPress management platforms.

### ✨ Key Enhancements

- **User Email Addresses**: Now includes user emails in API responses (previously showed "Private (WordPress security)")
- **Detailed User Metadata**: First name, last name, roles, capabilities, and user profiles
- **Login Tracking**: Track last login time and login count for each user
- **ManageWP Compatibility**: Same data structure and fields as ManageWP
- **Enterprise Security**: CSRF protection, rate limiting, and secure API key management

## 📁 Package Contents

- `wp-remote-manager-enhanced-users.php` - Main plugin file (ready to upload)
- `WP_REMOTE_MANAGER_USER_EMAIL_FIX.md` - Detailed technical documentation
- `README-Enhanced-Users-Plugin.md` - This installation guide

## 🔧 Installation

### Quick Install (Recommended)

1. **Download** the `wp-remote-manager-enhanced-users-v3.1.0.zip` file
2. **Extract** to get `wp-remote-manager-enhanced-users.php`
3. **Upload** the `.php` file to your WordPress site at `/wp-content/plugins/`
4. **Activate** the plugin in your WordPress admin under Plugins
5. **Configure** by going to Settings → Remote Manager
6. **Copy** the API key and add it to your AIO Webcare dashboard

### WordPress Admin Install

1. In WordPress admin, go to **Plugins → Add New**
2. Click **Upload Plugin**
3. Choose the `wp-remote-manager-enhanced-users-v3.1.0.zip` file
4. Click **Install Now** then **Activate**
5. Configure the API key in Settings → Remote Manager

## 🔑 API Endpoints

This plugin provides enhanced REST API endpoints:

### Enhanced Users Endpoint
```
GET /wp-json/wrms/v1/users
```
**New Features:**
- ✅ User email addresses included
- ✅ Detailed user metadata
- ✅ Login tracking data

### Detailed Users Endpoint
```
GET /wp-json/wrms/v1/users/detailed
```
**Returns:** Complete user information including all metadata

### Other Endpoints
- `/wp-json/wrms/v1/info` - Basic site information
- `/wp-json/wrms/v1/updates` - Available updates
- `/wp-json/wrms/v1/plugins` - Installed plugins
- `/wp-json/wrms/v1/themes` - Installed themes

## 🔐 Authentication

Include your API key in requests using the header:
```
X-WRMS-API-Key: your_api_key_here
```

## 📊 User Data Example

The enhanced plugin now returns comprehensive user data:

```json
{
  "success": true,
  "users": [
    {
      "id": "1",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "user_email": "john@example.com",
      "display_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "registered_date": "2023-01-01 00:00:00",
      "roles": ["administrator"],
      "post_count": 5,
      "avatar_url": "https://example.com/avatar.jpg",
      "last_login": "2024-08-11 09:00:00",
      "login_count": 47
    }
  ],
  "count": 1,
  "enhanced_features": {
    "email_included": true,
    "detailed_metadata": true,
    "login_tracking": true
  }
}
```

## 🛡️ Security Features

- **CSRF Protection**: Enterprise-grade Cross-Site Request Forgery protection
- **Rate Limiting**: 60 requests per minute to prevent abuse
- **Secure API Keys**: 64-character cryptographically secure keys
- **Request Logging**: Comprehensive audit trail
- **Permission Checking**: WordPress capability verification

## 📋 System Requirements

- **WordPress**: 5.0+ (tested up to 6.8)
- **PHP**: 7.4+ (supports up to 8.2)
- **Hosting**: Production-ready environment
- **Access**: WordPress admin privileges required

## 🔧 Configuration Options

After activation, configure the plugin:

1. **API Key Management**: Generate and regenerate secure keys
2. **Test Endpoints**: Built-in endpoint testing tool
3. **Enhanced Features**: Toggle detailed metadata collection
4. **Security Settings**: Configure rate limits and protection levels

## 🚨 Upgrading from Previous Versions

If you're upgrading from an older version:

1. **Backup** your existing API key (if you want to keep it)
2. **Deactivate** the old plugin
3. **Delete** the old plugin files
4. **Install** this enhanced version
5. **Activate** and configure with your API key

## 💡 Benefits Over Standard Plugin

| Feature | Standard Plugin | Enhanced Plugin |
|---------|----------------|-----------------|
| User Emails | ❌ Hidden | ✅ Included |
| User Metadata | ❌ Basic | ✅ Comprehensive |
| Login Tracking | ❌ None | ✅ Full tracking |
| ManageWP Compatible | ❌ Partial | ✅ Full compatibility |
| Security Features | ✅ Basic | ✅ Enterprise-grade |

## 📞 Support & Documentation

- **Technical Documentation**: See `WP_REMOTE_MANAGER_USER_EMAIL_FIX.md`
- **AIO Webcare Dashboard**: Configure your dashboard to use the new API endpoints
- **Testing**: Use the built-in test feature in Settings → Remote Manager

## 🔄 Version History

- **v3.1.0** (Latest): Enhanced user metadata with email support
- **v3.0.0**: Original secure version with enterprise features
- **v2.x**: Legacy versions (deprecated)

---

**Ready to get comprehensive user data from your WordPress sites? Install the Enhanced Users Plugin v3.1.0 today!**

For technical implementation details, see the included `WP_REMOTE_MANAGER_USER_EMAIL_FIX.md` file.