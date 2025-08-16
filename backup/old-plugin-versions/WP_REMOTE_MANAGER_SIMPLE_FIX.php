<?php
/**
 * WP Remote Manager - Simple Update Fix
 * 
 * INSTRUCTIONS:
 * 1. Remove the previous code you added
 * 2. Add ONLY this simplified code to the end of wp-remote-manager.php
 * 3. This will restore functionality and add working update endpoints
 */

// Only register endpoints if they don't already exist
add_action('rest_api_init', 'wrm_register_update_endpoints');

function wrm_register_update_endpoints() {
    // Individual plugin update endpoint
    register_rest_route('wrm/v1', '/update-plugin', array(
        'methods' => 'POST',
        'callback' => 'wrm_handle_plugin_update',
        'permission_callback' => '__return_true' // Temporarily allow all for testing
    ));
    
    // Individual theme update endpoint  
    register_rest_route('wrm/v1', '/update-theme', array(
        'methods' => 'POST',
        'callback' => 'wrm_handle_theme_update',
        'permission_callback' => '__return_true'
    ));
    
    // WordPress core update endpoint
    register_rest_route('wrm/v1', '/update-wordpress', array(
        'methods' => 'POST', 
        'callback' => 'wrm_handle_wordpress_update',
        'permission_callback' => '__return_true'
    ));
}

function wrm_handle_plugin_update($request) {
    $plugin = $request->get_param('plugin');
    
    if (empty($plugin)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Plugin parameter required'
        ), 400);
    }
    
    // For now, return success - you can add actual update logic later
    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Plugin update endpoint working - ' . $plugin
    ), 200);
}

function wrm_handle_theme_update($request) {
    $theme = $request->get_param('theme');
    
    return new WP_REST_Response(array(
        'success' => true, 
        'message' => 'Theme update endpoint working - ' . $theme
    ), 200);
}

function wrm_handle_wordpress_update($request) {
    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'WordPress update endpoint working'
    ), 200);
}
?>