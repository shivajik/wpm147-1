=== WP Remote Manager ===
Contributors: aio-webcare
Tags: remote management, backup, updates, security, monitoring
Requires at least: 5.0
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 2.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress Remote Manager for site monitoring and management with backup endpoints.

== Description ==

WP Remote Manager enables secure remote management of your WordPress websites through a comprehensive API. This plugin is designed to work seamlessly with the AIO Webcare dashboard for centralized WordPress management.

**Key Features:**

* **Remote Site Monitoring** - Monitor site health, performance, and status
* **Update Management** - Manage WordPress core, plugin, and theme updates remotely
* **Backup Integration** - Complete UpdraftPlus backup monitoring and management
* **User Management** - Monitor and manage WordPress users
* **Plugin & Theme Control** - View, activate, and deactivate plugins and themes
* **Security Monitoring** - Site health and security status tracking
* **RESTful API** - Clean, secure API endpoints for all operations

**Backup Features:**

* Real-time backup status monitoring
* UpdraftPlus integration for professional backups
* Backup history tracking
* Manual trigger support with guided instructions
* Comprehensive backup configuration management

**Security:**

* Secure API key authentication
* Rate limiting protection
* Input sanitization and validation
* WordPress security best practices

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/wp-remote-manager` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Go to Settings → Remote Manager to configure your API key.
4. Copy the API key and add your site to your AIO Webcare dashboard.

== Frequently Asked Questions ==

= Do I need UpdraftPlus for backup functionality? =

Yes, UpdraftPlus is required for backup features. The plugin will guide you through installation if it's not present.

= Is this plugin secure? =

Yes, the plugin uses secure API key authentication and follows WordPress security best practices.

= Can I use this without the AIO Webcare dashboard? =

The plugin provides a REST API that can be used with any compatible management system, though it's optimized for AIO Webcare.

== API Endpoints ==

The plugin provides the following REST API endpoints:

* `/wp-json/wrm/v1/status` - Site status information
* `/wp-json/wrm/v1/health` - Site health data
* `/wp-json/wrm/v1/updates` - Available updates
* `/wp-json/wrm/v1/backup/status` - Backup status
* `/wp-json/wrm/v1/backup/list` - Backup history
* `/wp-json/wrm/v1/backup/trigger` - Trigger backups
* `/wp-json/wrm/v1/users` - User management
* `/wp-json/wrm/v1/plugins` - Plugin management
* `/wp-json/wrm/v1/themes` - Theme management

All endpoints require authentication via the `X-WRM-API-Key` header.

== Screenshots ==

1. Plugin settings page with API key configuration
2. Backup status integration with UpdraftPlus
3. Available endpoints overview

== Changelog ==

= 2.2.0 =
* Added comprehensive backup endpoint integration
* Enhanced UpdraftPlus compatibility
* Improved error handling and logging
* Added backup configuration management
* Enhanced security and authentication

= 2.1.0 =
* Added update management endpoints
* Improved plugin and theme management
* Enhanced user management features
* Added security monitoring

= 2.0.0 =
* Complete rewrite with modern WordPress standards
* RESTful API implementation
* Enhanced security features
* Improved error handling

= 1.0.0 =
* Initial release
* Basic remote management functionality

== Requirements ==

* WordPress 5.0 or higher
* PHP 7.4 or higher
* UpdraftPlus plugin (for backup functionality)

== Support ==

For support and documentation, visit [AIO Webcare Documentation](https://aio-webcare.com/docs)

== License ==

This plugin is licensed under the GPLv2 or later license.