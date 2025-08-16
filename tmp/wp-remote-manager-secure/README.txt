=== WP Remote Manager Secure ===
Contributors: WordPress Maintenance Dashboard
Tags: remote management, security, maintenance, monitoring
Requires at least: 5.0
Tested up to: 6.8
Stable tag: 3.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Secure WordPress Remote Manager for site monitoring and management with enhanced security features.

== Description ==

WP Remote Manager Secure (Enterprise Security Edition) is a powerful WordPress plugin that enables remote management and monitoring of your WordPress website through a secure API interface. This version includes enterprise-level security features and comprehensive audit logging.

== Features ==

* **Enhanced Security**: CSRF protection with WordPress nonces
* **Rate Limiting**: 60 requests per minute with automatic blocking
* **Secure API Keys**: Cryptographically secure key generation
* **Audit Logging**: Complete activity tracking and security event logging
* **Input Validation**: Enhanced sanitization and validation for all inputs
* **WordPress Updates**: Remote core, plugin, and theme updates
* **User Management**: Remote user creation and management
* **Backup Integration**: UpdraftPlus backup triggering and management
* **System Information**: Detailed WordPress and server information
* **Maintenance Mode**: Remote maintenance mode control
* **Security Monitoring**: Real-time security status and recommendations

== Installation ==

1. Upload `wp-remote-manager-secure.php` to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to Settings → Remote Manager Secure
4. Generate a new secure API key
5. Copy the API key to your remote management dashboard

== Frequently Asked Questions ==

= Is this plugin secure? =

Yes, this Enterprise Security Edition includes multiple layers of security:
- CSRF protection with WordPress nonces
- Rate limiting (60 requests/minute)
- Secure API key generation without fallbacks
- Enhanced input validation and sanitization
- Comprehensive audit logging
- Limited information disclosure

= How do I rotate my API key? =

Go to Settings → Remote Manager Secure and click "Generate New API Key". The plugin will automatically remind you to rotate keys older than 30 days.

= Does this work with backup plugins? =

Yes, this plugin integrates with UpdraftPlus for backup management and triggering.

== Changelog ==

= 3.0.0 (2025-08-11) =
* NEW: Enterprise Security Edition with enhanced CSRF protection
* NEW: Advanced rate limiting with IP-based tracking
* NEW: Secure API key generation with rotation reminders
* NEW: Comprehensive audit logging and security event tracking
* NEW: Enhanced input validation and sanitization
* NEW: Limited information disclosure for better security
* NEW: WordPress 6.8 compatibility
* IMPROVED: Error handling and logging
* IMPROVED: User interface with security status indicators
* IMPROVED: API endpoint structure and documentation

= 2.2.0 =
* Added backup functionality
* Enhanced error handling
* Improved WordPress compatibility

= 2.1.0 =
* Initial release with basic remote management features

== Security Notice ==

This plugin creates API endpoints that allow remote management of your WordPress site. Please ensure you:
- Use strong, unique API keys
- Rotate API keys regularly (recommended every 30 days)
- Monitor the security logs regularly
- Keep the plugin updated to the latest version

== Support ==

For technical support and documentation, visit: https://secure-wp-remote-manager.com

== API Endpoints ==

The plugin creates the following secure API endpoints:

* `/wp-json/wrms/v1/status` - Site status and information
* `/wp-json/wrms/v1/health` - Health check endpoint
* `/wp-json/wrms/v1/updates` - Available updates information
* `/wp-json/wrms/v1/updates/perform` - Perform updates
* `/wp-json/wrms/v1/plugins` - Plugin management
* `/wp-json/wrms/v1/themes` - Theme management
* `/wp-json/wrms/v1/users` - User management
* `/wp-json/wrms/v1/backup` - Backup operations
* `/wp-json/wrms/v1/maintenance` - Maintenance mode control

All endpoints require a valid API key in the X-WRM-API-Key header.