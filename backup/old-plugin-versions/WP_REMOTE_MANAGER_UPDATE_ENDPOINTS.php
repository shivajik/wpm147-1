<?php
/**
 * WP Remote Manager - Update Endpoints Enhancement
 * Add these endpoints to your existing WP Remote Manager plugin
 * 
 * Add this code to your main plugin file after the existing endpoint registrations
 */

// Update endpoints for individual plugin, theme, and WordPress core updates
add_action('rest_api_init', function () {
    
    // Update single plugin endpoint
    register_rest_route('wrm/v1', '/update-plugin', array(
        'methods' => 'POST',
        'callback' => 'wrm_update_plugin',
        'permission_callback' => 'wrm_authenticate_request',
        'args' => array(
            'plugin' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'Plugin path (e.g., akismet/akismet.php)'
            )
        )
    ));
    
    // Update single theme endpoint
    register_rest_route('wrm/v1', '/update-theme', array(
        'methods' => 'POST',
        'callback' => 'wrm_update_theme',
        'permission_callback' => 'wrm_authenticate_request',
        'args' => array(
            'theme' => array(
                'required' => true,
                'type' => 'string',
                'description' => 'Theme slug'
            )
        )
    ));
    
    // Update WordPress core endpoint
    register_rest_route('wrm/v1', '/update-wordpress', array(
        'methods' => 'POST',
        'callback' => 'wrm_update_wordpress',
        'permission_callback' => 'wrm_authenticate_request'
    ));
    
    // Bulk updates endpoint
    register_rest_route('wrm/v1', '/updates/perform', array(
        'methods' => 'POST',
        'callback' => 'wrm_perform_bulk_updates',
        'permission_callback' => 'wrm_authenticate_request',
        'args' => array(
            'plugins' => array(
                'type' => 'array',
                'description' => 'Array of plugin paths to update'
            ),
            'themes' => array(
                'type' => 'array',
                'description' => 'Array of theme slugs to update'
            ),
            'wordpress' => array(
                'type' => 'boolean',
                'description' => 'Whether to update WordPress core'
            )
        )
    ));
});

/**
 * Update a single plugin
 */
function wrm_update_plugin($request) {
    $plugin_path = $request->get_param('plugin');
    
    if (empty($plugin_path)) {
        return new WP_Error('invalid_plugin', 'Plugin path is required', array('status' => 400));
    }
    
    // Check if plugin exists and is active
    if (!is_plugin_active($plugin_path)) {
        // Try to find the plugin if it's not the exact path
        $all_plugins = get_plugins();
        $found_plugin = null;
        
        foreach ($all_plugins as $path => $plugin_data) {
            if (strpos($path, $plugin_path) !== false || 
                strpos($plugin_path, dirname($path)) !== false ||
                $plugin_data['Name'] === $plugin_path) {
                $found_plugin = $path;
                break;
            }
        }
        
        if ($found_plugin) {
            $plugin_path = $found_plugin;
        } else {
            return new WP_Error('plugin_not_found', 'Plugin not found: ' . $plugin_path, array('status' => 404));
        }
    }
    
    // Include necessary files for updates
    if (!function_exists('wp_update_plugins')) {
        include_once ABSPATH . 'wp-admin/includes/update.php';
    }
    if (!function_exists('show_message')) {
        include_once ABSPATH . 'wp-admin/includes/misc.php';
    }
    if (!class_exists('Plugin_Upgrader')) {
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    }
    
    try {
        // Force check for updates
        wp_update_plugins();
        
        // Get update info
        $current = get_site_transient('update_plugins');
        if (!isset($current->response[$plugin_path])) {
            return array(
                'success' => false,
                'message' => 'No update available for this plugin'
            );
        }
        
        // Perform the update
        $skin = new WP_Ajax_Upgrader_Skin();
        $upgrader = new Plugin_Upgrader($skin);
        
        $result = $upgrader->upgrade($plugin_path);
        
        if (is_wp_error($result)) {
            return array(
                'success' => false,
                'message' => $result->get_error_message()
            );
        }
        
        if ($result === false) {
            return array(
                'success' => false,
                'message' => 'Plugin update failed for unknown reason'
            );
        }
        
        return array(
            'success' => true,
            'message' => 'Plugin updated successfully',
            'plugin' => $plugin_path
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'message' => 'Update failed: ' . $e->getMessage()
        );
    }
}

/**
 * Update a single theme
 */
function wrm_update_theme($request) {
    $theme_slug = $request->get_param('theme');
    
    if (empty($theme_slug)) {
        return new WP_Error('invalid_theme', 'Theme slug is required', array('status' => 400));
    }
    
    // Include necessary files for updates
    if (!function_exists('wp_update_themes')) {
        include_once ABSPATH . 'wp-admin/includes/update.php';
    }
    if (!class_exists('Theme_Upgrader')) {
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    }
    
    try {
        // Force check for updates
        wp_update_themes();
        
        // Get update info
        $current = get_site_transient('update_themes');
        if (!isset($current->response[$theme_slug])) {
            return array(
                'success' => false,
                'message' => 'No update available for this theme'
            );
        }
        
        // Perform the update
        $skin = new WP_Ajax_Upgrader_Skin();
        $upgrader = new Theme_Upgrader($skin);
        
        $result = $upgrader->upgrade($theme_slug);
        
        if (is_wp_error($result)) {
            return array(
                'success' => false,
                'message' => $result->get_error_message()
            );
        }
        
        if ($result === false) {
            return array(
                'success' => false,
                'message' => 'Theme update failed for unknown reason'
            );
        }
        
        return array(
            'success' => true,
            'message' => 'Theme updated successfully',
            'theme' => $theme_slug
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'message' => 'Update failed: ' . $e->getMessage()
        );
    }
}

/**
 * Update WordPress core
 */
function wrm_update_wordpress($request) {
    // Include necessary files for updates
    if (!function_exists('wp_version_check')) {
        include_once ABSPATH . 'wp-admin/includes/update.php';
    }
    if (!class_exists('Core_Upgrader')) {
        include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    }
    
    try {
        // Force check for updates
        wp_version_check();
        
        // Get update info
        $current = get_site_transient('update_core');
        if (!isset($current->updates[0]) || $current->updates[0]->response !== 'upgrade') {
            return array(
                'success' => false,
                'message' => 'No WordPress core update available'
            );
        }
        
        // Perform the update
        $skin = new WP_Ajax_Upgrader_Skin();
        $upgrader = new Core_Upgrader($skin);
        
        $result = $upgrader->upgrade($current->updates[0]);
        
        if (is_wp_error($result)) {
            return array(
                'success' => false,
                'message' => $result->get_error_message()
            );
        }
        
        if ($result === false) {
            return array(
                'success' => false,
                'message' => 'WordPress core update failed for unknown reason'
            );
        }
        
        return array(
            'success' => true,
            'message' => 'WordPress core updated successfully'
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'message' => 'Update failed: ' . $e->getMessage()
        );
    }
}

/**
 * Perform bulk updates
 */
function wrm_perform_bulk_updates($request) {
    $plugins = $request->get_param('plugins') ?: array();
    $themes = $request->get_param('themes') ?: array();
    $update_wordpress = $request->get_param('wordpress') ?: false;
    
    $results = array(
        'success' => true,
        'plugins' => array(),
        'themes' => array(),
        'wordpress' => null,
        'message' => 'Bulk update completed'
    );
    
    // Update plugins
    foreach ($plugins as $plugin_path) {
        $plugin_request = new WP_REST_Request('POST', '/wrm/v1/update-plugin');
        $plugin_request->set_param('plugin', $plugin_path);
        $plugin_result = wrm_update_plugin($plugin_request);
        
        $results['plugins'][] = array(
            'plugin' => $plugin_path,
            'success' => $plugin_result['success'],
            'message' => $plugin_result['message']
        );
        
        if (!$plugin_result['success']) {
            $results['success'] = false;
        }
    }
    
    // Update themes
    foreach ($themes as $theme_slug) {
        $theme_request = new WP_REST_Request('POST', '/wrm/v1/update-theme');
        $theme_request->set_param('theme', $theme_slug);
        $theme_result = wrm_update_theme($theme_request);
        
        $results['themes'][] = array(
            'theme' => $theme_slug,
            'success' => $theme_result['success'],
            'message' => $theme_result['message']
        );
        
        if (!$theme_result['success']) {
            $results['success'] = false;
        }
    }
    
    // Update WordPress core
    if ($update_wordpress) {
        $wp_request = new WP_REST_Request('POST', '/wrm/v1/update-wordpress');
        $wp_result = wrm_update_wordpress($wp_request);
        
        $results['wordpress'] = array(
            'success' => $wp_result['success'],
            'message' => $wp_result['message']
        );
        
        if (!$wp_result['success']) {
            $results['success'] = false;
        }
    }
    
    return $results;
}

/**
 * Authentication function (should already exist in your plugin)
 * Include this if you don't have it already
 */
if (!function_exists('wrm_authenticate_request')) {
    function wrm_authenticate_request($request) {
        $api_key = $request->get_header('X-WRM-API-Key');
        
        if (empty($api_key)) {
            return new WP_Error('missing_api_key', 'API key is required', array('status' => 401));
        }
        
        $stored_key = get_option('wrm_api_key');
        if ($api_key !== $stored_key) {
            return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 401));
        }
        
        if (!current_user_can('update_plugins') && !current_user_can('update_themes') && !current_user_can('update_core')) {
            return new WP_Error('insufficient_permissions', 'Insufficient permissions for updates', array('status' => 403));
        }
        
        return true;
    }
}

?>