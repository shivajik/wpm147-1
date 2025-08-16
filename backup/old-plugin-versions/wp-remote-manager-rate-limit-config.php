<?php
/**
 * WordPress Remote Manager Secure - Rate Limit Configuration
 * 
 * This file provides easy configuration for rate limiting settings
 * Upload this to your WordPress site and include it in wp-config.php
 * 
 * Add this line to your wp-config.php:
 * include_once(ABSPATH . 'wp-remote-manager-rate-limit-config.php');
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit('Direct access denied.');
}

/**
 * Rate Limiting Configuration
 * Adjust these values based on your needs
 */

// For KSoft Solution - Higher limits for dashboard integration
define('WRMS_MAX_REQUESTS_PER_MINUTE', 120); // Doubled from 60

// Rate limit window (seconds) - keep at 60 for standard operation
define('WRMS_RATE_LIMIT_WINDOW', 60);

// Enable/disable rate limiting entirely (true = enabled, false = disabled)
define('WRMS_RATE_LIMITING_ENABLED', true);

// Enable detailed logging of rate limit events
define('WRMS_RATE_LIMIT_LOGGING', true);

/**
 * Configuration Profiles
 * Comment/uncomment the profile you want to use
 */

// PROFILE 1: Standard Security (60 requests/minute)
// define('WRMS_MAX_REQUESTS_PER_MINUTE', 60);

// PROFILE 2: High Traffic (120 requests/minute) - ACTIVE
define('WRMS_MAX_REQUESTS_PER_MINUTE', 120);

// PROFILE 3: Development/Testing (300 requests/minute)
// define('WRMS_MAX_REQUESTS_PER_MINUTE', 300);

// PROFILE 4: No Rate Limiting (NOT RECOMMENDED FOR PRODUCTION)
// define('WRMS_RATE_LIMITING_ENABLED', false);

/**
 * Advanced Configuration
 */

// Whitelist specific IP addresses (no rate limiting)
define('WRMS_WHITELIST_IPS', serialize([
    // Add your dashboard server IP here
    // '123.456.789.0',
    // '192.168.1.0/24', // Local network
]));

// Grace period for first-time API key usage (seconds)
define('WRMS_NEW_KEY_GRACE_PERIOD', 300); // 5 minutes

// Burst allowance - extra requests allowed in short periods
define('WRMS_BURST_ALLOWANCE', 10);

/**
 * Notification Settings
 */

// Email notifications for rate limiting violations
define('WRMS_NOTIFY_RATE_LIMITS', false);

// Admin email for notifications
define('WRMS_ADMIN_EMAIL', get_option('admin_email'));

// Threshold for sending notifications (violations per hour)
define('WRMS_NOTIFICATION_THRESHOLD', 5);

/**
 * Logging Configuration
 */

// Maximum number of security log entries to keep
define('WRMS_MAX_LOG_ENTRIES', 200); // Increased from 100

// Log retention period (days)
define('WRMS_LOG_RETENTION_DAYS', 30);

// Enable detailed request logging
define('WRMS_DETAILED_LOGGING', false); // Set to true for debugging

/**
 * Auto-configuration based on environment
 */
function wrms_auto_configure() {
    // Detect if this is a development environment
    if (defined('WP_DEBUG') && WP_DEBUG) {
        // Development settings
        if (!defined('WRMS_MAX_REQUESTS_PER_MINUTE')) {
            define('WRMS_MAX_REQUESTS_PER_MINUTE', 300);
        }
        if (!defined('WRMS_DETAILED_LOGGING')) {
            define('WRMS_DETAILED_LOGGING', true);
        }
    }
    
    // Detect if running on localhost
    if (in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', '::1'])) {
        if (!defined('WRMS_MAX_REQUESTS_PER_MINUTE')) {
            define('WRMS_MAX_REQUESTS_PER_MINUTE', 600);
        }
    }
}

// Apply auto-configuration
wrms_auto_configure();

/**
 * Configuration Validation
 */
function wrms_validate_config() {
    $errors = [];
    
    if (defined('WRMS_MAX_REQUESTS_PER_MINUTE')) {
        $max_requests = WRMS_MAX_REQUESTS_PER_MINUTE;
        if (!is_numeric($max_requests) || $max_requests < 1) {
            $errors[] = 'WRMS_MAX_REQUESTS_PER_MINUTE must be a positive number';
        }
        if ($max_requests > 1000) {
            $errors[] = 'WRMS_MAX_REQUESTS_PER_MINUTE seems very high (>1000), consider if this is intentional';
        }
    }
    
    if (!empty($errors)) {
        error_log('WP Remote Manager Secure Config Errors: ' . implode(', ', $errors));
    }
    
    return empty($errors);
}

// Validate configuration
wrms_validate_config();

/**
 * Helper function to get current configuration
 */
function wrms_get_config() {
    return [
        'max_requests_per_minute' => defined('WRMS_MAX_REQUESTS_PER_MINUTE') ? WRMS_MAX_REQUESTS_PER_MINUTE : 60,
        'rate_limit_window' => defined('WRMS_RATE_LIMIT_WINDOW') ? WRMS_RATE_LIMIT_WINDOW : 60,
        'rate_limiting_enabled' => defined('WRMS_RATE_LIMITING_ENABLED') ? WRMS_RATE_LIMITING_ENABLED : true,
        'logging_enabled' => defined('WRMS_RATE_LIMIT_LOGGING') ? WRMS_RATE_LIMIT_LOGGING : true,
        'environment' => (defined('WP_DEBUG') && WP_DEBUG) ? 'development' : 'production'
    ];
}

// Log current configuration
if (defined('WRMS_RATE_LIMIT_LOGGING') && WRMS_RATE_LIMIT_LOGGING) {
    $config = wrms_get_config();
    error_log('WP Remote Manager Secure Config Loaded: ' . json_encode($config));
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Upload this file to your WordPress root directory
 * 2. Add this line to wp-config.php (before "require_once(ABSPATH . 'wp-settings.php');"):
 *    include_once(ABSPATH . 'wp-remote-manager-rate-limit-config.php');
 * 3. Modify the secure plugin to use these constants instead of hardcoded values
 * 
 * FOR KSOFTSOLUTION.COM:
 * - The current configuration sets 120 requests/minute (doubled from 60)
 * - This should resolve the rate limiting issues you're experiencing
 * - You can further increase if needed by changing WRMS_MAX_REQUESTS_PER_MINUTE
 */
?>