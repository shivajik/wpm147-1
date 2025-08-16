<?php
/**
 * WP Remote Manager - Plugin Metadata Enhancement
 * 
 * This code should be added to the WP Remote Manager plugin on the WordPress site
 * to properly extract and return plugin/theme metadata including descriptions and authors.
 */

// Add this to the WP Remote Manager plugin's plugins endpoint

/**
 * Enhanced get_plugins method that returns complete plugin metadata
 */
function wrm_get_plugins_with_metadata() {
    if (!function_exists('get_plugins')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    
    $all_plugins = get_plugins();
    $active_plugins = get_option('active_plugins', array());
    $plugins_list = array();
    
    foreach ($all_plugins as $plugin_file => $plugin_data) {
        $plugins_list[] = array(
            'plugin' => $plugin_file,
            'path' => $plugin_file,
            'name' => $plugin_data['Name'],
            'version' => $plugin_data['Version'],
            'description' => $plugin_data['Description'],
            'author' => $plugin_data['Author'],
            'author_uri' => $plugin_data['AuthorURI'],
            'plugin_uri' => $plugin_data['PluginURI'],
            'network' => $plugin_data['Network'],
            'title' => $plugin_data['Title'],
            'active' => in_array($plugin_file, $active_plugins),
            'network_active' => is_plugin_active_for_network($plugin_file),
            'update_available' => false, // Will be populated by update check
            'auto_update' => in_array($plugin_file, get_option('auto_update_plugins', array()))
        );
    }
    
    return $plugins_list;
}

/**
 * Enhanced get_themes method that returns complete theme metadata
 */
function wrm_get_themes_with_metadata() {
    $all_themes = wp_get_themes();
    $current_theme = get_stylesheet();
    $themes_list = array();
    
    foreach ($all_themes as $theme_slug => $theme_obj) {
        $themes_list[] = array(
            'stylesheet' => $theme_slug,
            'name' => $theme_obj->get('Name'),
            'version' => $theme_obj->get('Version'),
            'description' => $theme_obj->get('Description'),
            'author' => $theme_obj->get('Author'),
            'author_uri' => $theme_obj->get('AuthorURI'),
            'theme_uri' => $theme_obj->get('ThemeURI'),
            'template' => $theme_obj->get('Template'),
            'status' => ($theme_slug === $current_theme) ? 'active' : 'inactive',
            'active' => ($theme_slug === $current_theme),
            'parent_theme' => $theme_obj->parent() ? $theme_obj->parent()->get('Name') : '',
            'screenshot' => $theme_obj->get_screenshot() ? $theme_obj->get_screenshot() : '',
            'tags' => $theme_obj->get('Tags'),
            'text_domain' => $theme_obj->get('TextDomain'),
            'update_available' => false // Will be populated by update check
        );
    }
    
    return $themes_list;
}

/**
 * REST API endpoint for plugins with complete metadata
 */
add_action('rest_api_init', function () {
    register_rest_route('wrm/v1', '/plugins', array(
        'methods' => 'GET',
        'callback' => function() {
            return rest_ensure_response(array(
                'success' => true,
                'plugins' => wrm_get_plugins_with_metadata()
            ));
        },
        'permission_callback' => function() {
            return current_user_can('manage_options') || wrm_verify_api_key();
        }
    ));
    
    register_rest_route('wrm/v1', '/themes', array(
        'methods' => 'GET',
        'callback' => function() {
            return rest_ensure_response(array(
                'success' => true,
                'themes' => wrm_get_themes_with_metadata()
            ));
        },
        'permission_callback' => function() {
            return current_user_can('manage_options') || wrm_verify_api_key();
        }
    ));
});

/**
 * Verify API key for WRM requests
 */
function wrm_verify_api_key() {
    $api_key = get_option('wrm_api_key');
    $request_key = $_SERVER['HTTP_X_API_KEY'] ?? '';
    return !empty($api_key) && hash_equals($api_key, $request_key);
}
?>