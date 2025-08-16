# Changelog

## [3.0.0] - 2025-08-11 - Enterprise Security Edition

### Added
- **Enterprise CSRF Protection**: Advanced CSRF protection using WordPress nonces
- **Rate Limiting**: IP-based rate limiting (60 requests per minute) with automatic blocking
- **Secure API Key Generation**: Cryptographically secure key generation without fallbacks
- **Comprehensive Audit Logging**: Complete activity tracking and security event logging
- **Enhanced Input Validation**: Advanced sanitization and validation for all API inputs
- **API Key Rotation Reminders**: Automatic email reminders for keys older than 30 days
- **Security Status Dashboard**: Real-time security indicators in admin interface
- **Limited Information Disclosure**: Reduced information leakage for better security
- **WordPress 6.8 Compatibility**: Full compatibility with latest WordPress version

### Security Enhancements
- CSRF token validation for all state-changing operations
- Enhanced path validation to prevent directory traversal attacks
- Secure client IP detection with proxy header support
- Security event logging with IP tracking and user agent logging
- Rate limiting with transient-based request tracking
- Input sanitization for plugin/theme paths and user data

### Improved
- **Error Handling**: More detailed error messages and logging
- **User Interface**: Enhanced admin page with security status indicators
- **API Documentation**: Comprehensive endpoint documentation
- **Performance**: Optimized database queries and caching

### Technical Changes
- Added `WRMS_Security` class for centralized security management
- Implemented proper WordPress coding standards
- Enhanced database schema for security logs
- Improved plugin activation/deactivation hooks

## [2.2.0] - Previous Version

### Added
- Backup functionality with UpdraftPlus integration
- Enhanced error handling for API endpoints
- Basic rate limiting implementation

### Fixed
- WordPress compatibility issues
- API endpoint reliability

## [2.1.0] - Initial Release

### Added
- Basic remote management functionality
- WordPress updates management
- Plugin and theme management
- User management capabilities
- System information retrieval

---

## Security Notice

Each version includes important security improvements. Always update to the latest version and rotate your API keys regularly for maximum security.

## Upgrade Instructions

1. Deactivate the old version
2. Delete the old plugin files
3. Upload the new version
4. Activate the plugin
5. Generate a new API key (recommended)
6. Update your remote management dashboard with the new key

## Breaking Changes

### From 2.x to 3.0.0
- API key format has changed (more secure, longer keys)
- Some endpoint responses include additional security metadata
- Rate limiting may require adjustment of request frequencies
- CSRF protection requires proper nonce handling for custom integrations