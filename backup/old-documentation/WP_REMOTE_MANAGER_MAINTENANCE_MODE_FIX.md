# WP Remote Manager Plugin - Maintenance Mode Bypass Instructions

## Problem Statement
The WP Remote Manager plugin currently fails during WordPress maintenance mode (activated during updates), causing the dashboard to lose connection when updates are in progress. This creates a poor user experience where the dashboard shows errors instead of update progress.

## Required Plugin Enhancement

### 1. Add Maintenance Mode Detection and Bypass

Add this code to the main plugin file after the existing authentication check:

```php
/**
 * Check if we should bypass maintenance mode for monitoring
 */
private function should_bypass_maintenance() {
    // Allow bypass for WRM API endpoints during maintenance
    if (defined('WP_MAINTENANCE_MODE') && WP_MAINTENANCE_MODE) {
        return true;
    }
    
    // Check for .maintenance file
    $maintenance_file = ABSPATH . '.maintenance';
    if (file_exists($maintenance_file)) {
        return true;
    }
    
    return false;
}

/**
 * Initialize maintenance mode bypass
 */
public function init_maintenance_bypass() {
    if ($this->should_bypass_maintenance()) {
        // Remove the maintenance mode check for our endpoints
        remove_action('init', 'wp_maintenance');
        
        // Add custom header to indicate maintenance mode
        add_action('wp_headers', function($headers) {
            $headers['X-WRM-Maintenance-Mode'] = 'active';
            return $headers;
        });
    }
}
```

### 2. Update the Main Plugin Constructor

Add this line to the `__construct()` method:

```php
// Add this after existing hooks
add_action('init', array($this, 'init_maintenance_bypass'), 1);
```

### 3. Enhance Status Endpoint

Update the `/status` endpoint to include maintenance mode information:

```php
public function get_status() {
    $maintenance_active = $this->should_bypass_maintenance();
    
    $status = array(
        'success' => true,
        'wordpress_version' => get_bloginfo('version'),
        'php_version' => phpversion(),
        'mysql_version' => $this->get_mysql_version(),
        'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'ssl_enabled' => is_ssl(),
        'maintenance_mode' => $maintenance_active,
        'timestamp' => current_time('timestamp')
    );
    
    if ($maintenance_active) {
        $status['message'] = 'Site in maintenance mode - monitoring active';
        $status['maintenance_reason'] = $this->get_maintenance_reason();
    }
    
    return $status;
}

private function get_maintenance_reason() {
    // Check if there are ongoing updates
    $core_updates = get_core_updates();
    $plugin_updates = get_plugin_updates();
    $theme_updates = get_theme_updates();
    
    if (!empty($core_updates)) {
        return 'WordPress core update in progress';
    } elseif (!empty($plugin_updates)) {
        return 'Plugin updates in progress';
    } elseif (!empty($theme_updates)) {
        return 'Theme updates in progress';
    }
    
    return 'Maintenance mode active';
}
```

### 4. Add Update Progress Endpoint

Create a new endpoint to track update progress:

```php
/**
 * Get update progress information
 */
public function get_update_progress() {
    if (!$this->should_bypass_maintenance()) {
        return array(
            'success' => true,
            'in_progress' => false,
            'message' => 'No updates in progress'
        );
    }
    
    // Check for active update processes
    $progress = array(
        'success' => true,
        'in_progress' => true,
        'maintenance_mode' => true,
        'estimated_completion' => $this->estimate_completion_time(),
        'current_operation' => $this->get_current_operation(),
        'progress_percentage' => $this->calculate_progress_percentage()
    );
    
    return $progress;
}

private function estimate_completion_time() {
    $maintenance_file = ABSPATH . '.maintenance';
    if (file_exists($maintenance_file)) {
        $start_time = filectime($maintenance_file);
        $elapsed = time() - $start_time;
        // Estimate 2-5 minutes for most updates
        $estimated_total = 180; // 3 minutes average
        $remaining = max(0, $estimated_total - $elapsed);
        return $remaining;
    }
    return 60; // Default 1 minute
}

private function get_current_operation() {
    // Try to determine what's being updated
    if (defined('WP_UPGRADING')) {
        return 'WordPress core update';
    }
    
    // Check for plugin/theme update indicators
    $maintenance_file = ABSPATH . '.maintenance';
    if (file_exists($maintenance_file)) {
        $content = file_get_contents($maintenance_file);
        if (strpos($content, 'plugin') !== false) {
            return 'Plugin update';
        } elseif (strpos($content, 'theme') !== false) {
            return 'Theme update';
        }
    }
    
    return 'System maintenance';
}

private function calculate_progress_percentage() {
    $maintenance_file = ABSPATH . '.maintenance';
    if (file_exists($maintenance_file)) {
        $start_time = filectime($maintenance_file);
        $elapsed = time() - $start_time;
        $estimated_total = 180; // 3 minutes
        return min(95, ($elapsed / $estimated_total) * 100);
    }
    return 50; // Default progress
}
```

### 5. Update REST API Registration

Add the new endpoint to your REST API registration:

```php
// Add this to your register_rest_routes() method
register_rest_route('wrm/v1', '/update-progress', array(
    'methods' => 'GET',
    'callback' => array($this, 'get_update_progress'),
    'permission_callback' => array($this, 'check_api_key')
));
```

### 6. Add Maintenance Mode Headers

Ensure all responses include maintenance mode status:

```php
/**
 * Add maintenance mode headers to all responses
 */
public function add_maintenance_headers($response, $handler, $request) {
    if ($this->should_bypass_maintenance()) {
        $response->header('X-WRM-Maintenance-Mode', 'active');
        $response->header('X-WRM-Monitoring', 'enabled');
    }
    return $response;
}

// Add this to your constructor
add_filter('rest_pre_serve_request', array($this, 'add_maintenance_headers'), 10, 3);
```

## Expected Results After Update

1. **During Updates**: Plugin will continue responding to API calls even when WordPress is in maintenance mode
2. **Status Reporting**: Dashboard will receive "maintenance mode active" instead of connection errors
3. **Progress Tracking**: New endpoint provides update progress information
4. **Better UX**: Dashboard can show "Update in Progress" instead of "Connection Failed"

## Testing Instructions

1. Upload the updated plugin to WordPress
2. Initiate a plugin or theme update
3. Check that the dashboard shows maintenance mode status instead of errors
4. Verify the `/update-progress` endpoint returns progress information
5. Confirm normal operation resumes after maintenance mode ends

## Implementation Priority

This fix is **HIGH PRIORITY** because it directly affects user experience during the most critical maintenance operations. Without this fix, users lose visibility into their sites exactly when they need monitoring most.