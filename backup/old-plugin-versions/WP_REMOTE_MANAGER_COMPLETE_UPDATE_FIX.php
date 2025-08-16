<?php
/**
 * WP Remote Manager - Complete Update Fix
 * 
 * IMPORTANT: Add this code to your existing WP Remote Manager plugin
 * Location: wp-content/plugins/wp-remote-manager/wp-remote-manager.php
 * 
 * This code adds the missing update endpoints that enable real WordPress updates
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the missing update endpoints
 */
add_action('rest_api_init', function() {
    // Individual plugin update endpoint
    register_rest_route('wrm/v1', '/update-plugin', array(
        'methods' => 'POST',
        'callback' => 'wrm_update_plugin_endpoint',
        'permission_callback' => 'wrm_verify_api_key'
    ));
    
    // Individual theme update endpoint
    register_rest_route('wrm/v1', '/update-theme', array(
        'methods' => 'POST',
        'callback' => 'wrm_update_theme_endpoint',
        'permission_callback' => 'wrm_verify_api_key'
    ));
    
    // WordPress core update endpoint
    register_rest_route('wrm/v1', '/update-wordpress', array(
        'methods' => 'POST',
        'callback' => 'wrm_update_wordpress_endpoint',
        'permission_callback' => 'wrm_verify_api_key'
    ));
    
    // Bulk updates endpoint (optional - fallback to individual)
    register_rest_route('wrm/v1', '/updates/perform', array(
        'methods' => 'POST',
        'callback' => 'wrm_perform_bulk_updates',
        'permission_callback' => 'wrm_verify_api_key'
    ));
});

/**
 * Individual Plugin Update Endpoint
 */
function wrm_update_plugin_endpoint($request) {
    // Check permissions
    if (!current_user_can('update_plugins')) {
        return new WP_Error('insufficient_permissions', 'You do not have permission to update plugins', array('status' => 403));
    }
    
    $plugin = $request->get_param('plugin');
    if (empty($plugin)) {
        return new WP_Error('missing_plugin', 'Plugin parameter is required', array('status' => 400));
    }
    
    try {
        // Include necessary files
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
        require_once ABSPATH . 'wp-admin/includes/update.php';
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/misc.php';
        
        // Get current plugin data
        $plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin);
        $current_version = $plugin_data['Version'] ?? 'unknown';
        
        // Force check for updates
        wp_update_plugins();
        $update_plugins = get_site_transient('update_plugins');
        
        // Check if update is available
        if (!isset($update_plugins->response[$plugin])) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'No update available for plugin: ' . $plugin_data['Name']
            ));
        }
        
        // Perform the update
        $upgrader = new Plugin_Upgrader();
        $result = $upgrader->upgrade($plugin);
        
        if (is_wp_error($result)) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'Plugin update failed: ' . $result->get_error_message()
            ));
        }
        
        // Get new version after update
        $updated_plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin);
        $new_version = $updated_plugin_data['Version'] ?? 'unknown';
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Plugin ' . $plugin_data['Name'] . ' updated successfully from ' . $current_version . ' to ' . $new_version,
            'plugin' => $plugin,
            'from_version' => $current_version,
            'to_version' => $new_version
        ));
        
    } catch (Exception $e) {
        return rest_ensure_response(array(
            'success' => false,
            'message' => 'Plugin update failed: ' . $e->getMessage()
        ));
    }
}

/**
 * Individual Theme Update Endpoint
 */
function wrm_update_theme_endpoint($request) {
    // Check permissions
    if (!current_user_can('update_themes')) {
        return new WP_Error('insufficient_permissions', 'You do not have permission to update themes', array('status' => 403));
    }
    
    $theme = $request->get_param('theme');
    if (empty($theme)) {
        return new WP_Error('missing_theme', 'Theme parameter is required', array('status' => 400));
    }
    
    try {
        // Include necessary files
        require_once ABSPATH . 'wp-admin/includes/theme.php';
        require_once ABSPATH . 'wp-admin/includes/update.php';
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/misc.php';
        
        // Get current theme data
        $theme_obj = wp_get_theme($theme);
        $current_version = $theme_obj->get('Version') ?? 'unknown';
        
        // Force check for updates
        wp_update_themes();
        $update_themes = get_site_transient('update_themes');
        
        // Check if update is available
        if (!isset($update_themes->response[$theme])) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'No update available for theme: ' . $theme_obj->get('Name')
            ));
        }
        
        // Perform the update
        $upgrader = new Theme_Upgrader();
        $result = $upgrader->upgrade($theme);
        
        if (is_wp_error($result)) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'Theme update failed: ' . $result->get_error_message()
            ));
        }
        
        // Get new version after update
        $updated_theme = wp_get_theme($theme);
        $new_version = $updated_theme->get('Version') ?? 'unknown';
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Theme ' . $theme_obj->get('Name') . ' updated successfully from ' . $current_version . ' to ' . $new_version,
            'theme' => $theme,
            'from_version' => $current_version,
            'to_version' => $new_version
        ));
        
    } catch (Exception $e) {
        return rest_ensure_response(array(
            'success' => false,
            'message' => 'Theme update failed: ' . $e->getMessage()
        ));
    }
}

/**
 * WordPress Core Update Endpoint
 */
function wrm_update_wordpress_endpoint($request) {
    // Check permissions
    if (!current_user_can('update_core')) {
        return new WP_Error('insufficient_permissions', 'You do not have permission to update WordPress', array('status' => 403));
    }
    
    try {
        // Include necessary files
        require_once ABSPATH . 'wp-admin/includes/update.php';
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/misc.php';
        
        $current_version = get_bloginfo('version');
        
        // Force check for updates
        wp_version_check();
        $updates = get_core_updates();
        
        if (empty($updates) || !isset($updates[0]) || $updates[0]->response !== 'upgrade') {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'No WordPress core updates available'
            ));
        }
        
        $update = $updates[0];
        
        // Perform the update
        $upgrader = new Core_Upgrader();
        $result = $upgrader->upgrade($update);
        
        if (is_wp_error($result)) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'WordPress update failed: ' . $result->get_error_message()
            ));
        }
        
        $new_version = get_bloginfo('version');
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'WordPress updated successfully from ' . $current_version . ' to ' . $new_version,
            'from_version' => $current_version,
            'to_version' => $new_version
        ));
        
    } catch (Exception $e) {
        return rest_ensure_response(array(
            'success' => false,
            'message' => 'WordPress update failed: ' . $e->getMessage()
        ));
    }
}

/**
 * Bulk Updates Endpoint (Optional)
 */
function wrm_perform_bulk_updates($request) {
    $updates = $request->get_param('updates');
    if (empty($updates) || !is_array($updates)) {
        return new WP_Error('invalid_request', 'Updates parameter is required and must be an array', array('status' => 400));
    }
    
    $results = array();
    $overall_success = true;
    
    foreach ($updates as $update) {
        $type = $update['type'] ?? '';
        $items = $update['items'] ?? array();
        
        foreach ($items as $item) {
            $result = array(
                'type' => $type,
                'item' => $item,
                'success' => false,
                'message' => 'Unknown error'
            );
            
            try {
                if ($type === 'plugin') {
                    $plugin_result = wrm_update_plugin_endpoint(new WP_REST_Request('POST', '/update-plugin'));
                    $plugin_result->set_param('plugin', $item);
                    $plugin_response = $plugin_result->get_data();
                    
                    $result['success'] = $plugin_response['success'] ?? false;
                    $result['message'] = $plugin_response['message'] ?? 'Unknown plugin update result';
                } elseif ($type === 'theme') {
                    $theme_result = wrm_update_theme_endpoint(new WP_REST_Request('POST', '/update-theme'));
                    $theme_result->set_param('theme', $item);
                    $theme_response = $theme_result->get_data();
                    
                    $result['success'] = $theme_response['success'] ?? false;
                    $result['message'] = $theme_response['message'] ?? 'Unknown theme update result';
                } elseif ($type === 'core') {
                    $core_response = wrm_update_wordpress_endpoint(new WP_REST_Request('POST', '/update-wordpress'));
                    $core_data = $core_response->get_data();
                    
                    $result['success'] = $core_data['success'] ?? false;
                    $result['message'] = $core_data['message'] ?? 'Unknown WordPress update result';
                } else {
                    $result['message'] = 'Invalid update type: ' . $type;
                }
            } catch (Exception $e) {
                $result['message'] = $e->getMessage();
                $overall_success = false;
            }
            
            $results[] = $result;
            if (!$result['success']) {
                $overall_success = false;
            }
        }
    }
    
    return rest_ensure_response(array(
        'success' => $overall_success,
        'results' => $results,
        'message' => $overall_success ? 'All updates completed successfully' : 'Some updates failed',
        'timestamp' => current_time('mysql')
    ));
}

/**
 * API Key Verification Function
 * Note: This should match your existing WP Remote Manager plugin's verification function
 */
if (!function_exists('wrm_verify_api_key')) {
    function wrm_verify_api_key($request) {
        $api_key = $request->get_header('X-WRM-API-Key');
        $stored_key = get_option('wrm_api_key', '');
        
        if (empty($api_key) || empty($stored_key)) {
            return new WP_Error('missing_api_key', 'API key required', array('status' => 401));
        }
        
        if (!hash_equals($stored_key, $api_key)) {
            return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 401));
        }
        
        return true;
    }
}

/**
 * INSTALLATION INSTRUCTIONS:
 * 
 * 1. Copy this entire PHP code
 * 2. Go to your WordPress admin: https://ascollegechincholi.com/wp-admin
 * 3. Navigate to Plugins → Plugin Editor
 * 4. Select "WP Remote Manager" from the dropdown
 * 5. Find the main plugin file (usually wp-remote-manager.php)
 * 6. Paste this code at the end of the file (before the closing ?>)
 * 7. Click "Update File"
 * 
 * TESTING:
 * After adding this code, your WordPress maintenance dashboard will be able to:
 * - Actually update plugins (not just show success messages)
 * - Update themes
 * - Update WordPress core
 * - All updates will be reflected in WordPress immediately
 */
?>