<?php
/**
 * Plugin Name: WP Remote Manager - v3.2.2
 * Description: Advanced WordPress Remote Manager plugin with comprehensive user management, security, remote maintenance capabilities - UPDATE EXECUTION FIXED
 * Version: 3.2.2
 * Author: AIO Webcare
 * Text Domain: wp-remote-manager-enhanced
 * Requires at least: 5.0
 * Tested up to: 6.8
 * Requires PHP: 7.4
 * Network: false
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit('Direct access denied.');
}

/**
 * Main WP Remote Manager Enhanced Users Class
 */
class WP_Remote_Manager_Enhanced_Users {
    
    private $version = '3.2.2';
    private $api_namespace = 'wrms/v1';
    private $option_name = 'wrm_api_key';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_login', array($this, 'track_user_login'), 10, 2);
        
        // Add security headers
        add_action('rest_api_init', array($this, 'add_cors_headers'));
        
        // Plugin activation hook
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));
        
        // AJAX handlers for API key management
        add_action('wp_ajax_wrm_regenerate_key', array($this, 'ajax_regenerate_key'));
        add_action('wp_ajax_wrm_update_key', array($this, 'ajax_update_key'));
        
        // Admin notices
        add_action('admin_notices', array($this, 'admin_notices'));
        add_action('admin_bar_menu', array($this, 'admin_bar_menu'), 100);
    }
    
    public function init() {
        // Generate API key if not exists
        if (!get_option($this->option_name)) {
            $this->generate_api_key();
        }
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Core status endpoints
        register_rest_route($this->api_namespace, '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_status'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/health', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_health'),
            'permission_callback' => '__return_true'
        ));
        
        // Update management endpoints
        register_rest_route($this->api_namespace, '/updates', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_updates'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/updates/perform', array(
            'methods' => 'POST',
            'callback' => array($this, 'perform_updates'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        // Plugin management endpoints
        register_rest_route($this->api_namespace, '/plugins', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_plugins'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/plugins/activate', array(
            'methods' => 'POST',
            'callback' => array($this, 'activate_plugin_endpoint'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        register_rest_route($this->api_namespace, '/plugins/deactivate', array(
            'methods' => 'POST',
            'callback' => array($this, 'deactivate_plugin_endpoint'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        // Theme management endpoints
        register_rest_route($this->api_namespace, '/themes', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_themes'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // User management endpoints
        register_rest_route($this->api_namespace, '/users', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_users'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/users/detailed', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_users_detailed'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/users/all', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_all_users_comprehensive'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Maintenance mode endpoints
        register_rest_route($this->api_namespace, '/maintenance', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'maintenance_mode'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        // Individual update endpoints for backward compatibility
        register_rest_route($this->api_namespace, '/update-plugin', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_plugin'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        register_rest_route($this->api_namespace, '/update-theme', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_theme'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        register_rest_route($this->api_namespace, '/update-wordpress', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_wordpress'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        // Plugin activation/deactivation aliases
        register_rest_route($this->api_namespace, '/activate-plugin', array(
            'methods' => 'POST',
            'callback' => array($this, 'activate_plugin_endpoint'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
        
        register_rest_route($this->api_namespace, '/deactivate-plugin', array(
            'methods' => 'POST',
            'callback' => array($this, 'deactivate_plugin_endpoint'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));

        // Security logs endpoint
        register_rest_route($this->api_namespace, '/security-logs', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_security_logs'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));

        // Comments endpoints
        register_rest_route($this->api_namespace, '/comments', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_comments'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route($this->api_namespace, '/comments/delete', array(
            'methods' => 'POST',
            'callback' => array($this, 'delete_comments'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));

        register_rest_route($this->api_namespace, '/comments/clean-spam', array(
            'methods' => 'POST',
            'callback' => array($this, 'clean_spam_comments'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));

        // Revisions endpoints
        register_rest_route($this->api_namespace, '/revisions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_revisions'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route($this->api_namespace, '/revisions/delete', array(
            'methods' => 'POST',
            'callback' => array($this, 'delete_revisions'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));

        register_rest_route($this->api_namespace, '/revisions/clean-old', array(
            'methods' => 'POST',
            'callback' => array($this, 'clean_old_revisions'),
            'permission_callback' => array($this, 'verify_api_key_with_admin_bypass')
        ));
    }
    
    /**
     * Verify API key
     */
    public function verify_api_key($request) {
        $api_key = $request->get_header('X-WRM-API-Key') ?: $request->get_header('X-WRMS-API-Key');
        $stored_key = get_option($this->option_name);
        
        if (!$api_key || !$stored_key) {
            return new WP_Error('missing_api_key', 'API key is required', array('status' => 401));
        }
        
        if (!hash_equals($stored_key, $api_key)) {
            return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 401));
        }
        
        return true;
    }
    
    /**
     * Verify API key with admin bypass - ENHANCED for remote operations
     */
    public function verify_api_key_with_admin_bypass($request) {
        $api_check = $this->verify_api_key($request);
        if (is_wp_error($api_check)) {
            return $api_check;
        }
        
        // CRITICAL ENHANCEMENT: Set up full admin context for remote operations
        if (!current_user_can('manage_options')) {
            // Get first admin user for context
            $admin_users = get_users(array('role' => 'administrator', 'number' => 1));
            if (!empty($admin_users)) {
                wp_set_current_user($admin_users[0]->ID);
                
                // CRITICAL: Set up admin cookies for filesystem operations
                wp_set_auth_cookie($admin_users[0]->ID);
            }
        }
        
        return true;
    }
    
    /**
     * Initialize WordPress filesystem for updates - CRITICAL FIX
     */
    private function init_wp_filesystem() {
        if (!function_exists('WP_Filesystem')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        
        // Initialize filesystem with direct method for API operations
        $creds = request_filesystem_credentials('', '', false, false, array());
        
        if (false === $creds) {
            // Try direct method
            if (!WP_Filesystem()) {
                return false;
            }
        } else {
            if (!WP_Filesystem($creds)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get site status
     */
    public function get_status($request) {
        global $wp_version;
        
        $php_version = phpversion();
        $mysql_version = $this->get_mysql_version();
        $memory_limit = ini_get('memory_limit');
        $memory_usage = round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB';
        
        // Get disk usage
        $free_bytes = disk_free_space('/');
        $total_bytes = disk_total_space('/');
        $used_bytes = $total_bytes - $free_bytes;
        
        $disk_usage = array(
            'free' => size_format($free_bytes),
            'total' => size_format($total_bytes),
            'used' => size_format($used_bytes)
        );
        
        // Get counts
        $posts_count = wp_count_posts('post')->publish;
        $pages_count = wp_count_posts('page')->publish;
        $users_count = count_users()['total_users'];
        
        // Get plugin and theme counts
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $plugins_count = count(get_plugins());
        $themes_count = count(wp_get_themes());
        
        return rest_ensure_response(array(
            'success' => true,
            'site_info' => array(
                'name' => get_bloginfo('name'),
                'url' => home_url(),
                'admin_email' => get_option('admin_email'),
                'wordpress_version' => $wp_version,
                'php_version' => $php_version,
                'mysql_version' => $mysql_version,
                'memory_limit' => $memory_limit,
                'memory_usage' => $memory_usage,
                'disk_usage' => $disk_usage,
                'ssl_enabled' => is_ssl(),
                'posts_count' => $posts_count,
                'pages_count' => $pages_count,
                'users_count' => $users_count,
                'plugins_count' => $plugins_count,
                'themes_count' => $themes_count,
                'active_theme' => get_stylesheet(),
                'timezone' => get_option('timezone_string') ?: 'UTC'
            ),
            'plugin_info' => array(
                'name' => 'WP Remote Manager Enhanced Users',
                'version' => $this->version,
                'api_namespace' => $this->api_namespace
            ),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get health data
     */
    public function get_health($request) {
        return rest_ensure_response(array(
            'success' => true,
            'status' => 'healthy',
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get available updates - COMPREHENSIVE UPDATE DETECTION
     */
    public function get_updates($request) {
        try {
            // Include all required WordPress update functions
            if (!function_exists('get_core_updates')) {
                require_once ABSPATH . 'wp-admin/includes/update.php';
            }
            if (!function_exists('get_plugin_updates')) {
                require_once ABSPATH . 'wp-admin/includes/update.php';
            }
            if (!function_exists('get_theme_updates')) {
                require_once ABSPATH . 'wp-admin/includes/update.php';
            }
            if (!function_exists('get_plugins')) {
                require_once ABSPATH . 'wp-admin/includes/plugin.php';
            }
            
            // Force fresh update checks
            wp_version_check();
            wp_update_plugins();
            wp_update_themes();
            
            // WordPress core updates
            $core_updates = get_core_updates();
            $wordpress_updates = array();
            
            if (!empty($core_updates) && !empty($core_updates[0]) && $core_updates[0]->response == 'upgrade') {
                $wordpress_updates[] = array(
                    'current_version' => get_bloginfo('version'),
                    'new_version' => $core_updates[0]->current,
                    'package' => $core_updates[0]->download ?? '',
                    'url' => $core_updates[0]->url ?? '',
                    'partial' => false
                );
            }
            
            // Plugin updates with multiple detection methods
            $plugin_updates = $this->get_plugin_updates_comprehensive();
            $theme_updates = $this->get_theme_updates_comprehensive();
            
            return rest_ensure_response(array(
                'success' => true,
                'updates' => array(
                    'wordpress' => $wordpress_updates,
                    'plugins' => $plugin_updates,
                    'themes' => $theme_updates,
                    'total_count' => count($wordpress_updates) + count($plugin_updates) + count($theme_updates)
                ),
                'timestamp' => current_time('c')
            ));
            
        } catch (Exception $e) {
            return rest_ensure_response(array(
                'success' => false,
                'error' => $e->getMessage(),
                'updates' => array(
                    'wordpress' => array(),
                    'plugins' => array(),
                    'themes' => array(),
                    'total_count' => 0
                ),
                'timestamp' => current_time('c')
            ));
        }
    }
    
    /**
     * Comprehensive plugin update detection
     */
    private function get_plugin_updates_comprehensive() {
        $updates = array();
        
        try {
            // Method 1: WordPress standard function
            if (function_exists('get_plugin_updates')) {
                $plugin_updates = get_plugin_updates();
                foreach ($plugin_updates as $plugin_file => $plugin_data) {
                    if (isset($plugin_data->update)) {
                        $updates[] = array(
                            'plugin' => $plugin_data->Name,
                            'plugin_file' => $plugin_file,
                            'current_version' => $plugin_data->Version,
                            'new_version' => $plugin_data->update->new_version,
                            'package' => $plugin_data->update->package ?? '',
                            'slug' => $plugin_data->update->slug ?? dirname($plugin_file),
                            'tested' => $plugin_data->update->tested ?? '',
                            'compatibility' => $plugin_data->update->compatibility ?? array()
                        );
                    }
                }
            }
            
            // Method 2: Direct transient check (fallback)
            if (empty($updates)) {
                $update_plugins = get_site_transient('update_plugins');
                if ($update_plugins && isset($update_plugins->response)) {
                    $all_plugins = get_plugins();
                    
                    foreach ($update_plugins->response as $plugin_file => $update_data) {
                        if (isset($all_plugins[$plugin_file])) {
                            $plugin_info = $all_plugins[$plugin_file];
                            $updates[] = array(
                                'plugin' => $plugin_info['Name'],
                                'plugin_file' => $plugin_file,
                                'current_version' => $plugin_info['Version'],
                                'new_version' => $update_data->new_version,
                                'package' => $update_data->package ?? '',
                                'slug' => $update_data->slug ?? dirname($plugin_file),
                                'tested' => $update_data->tested ?? '',
                                'compatibility' => $update_data->compatibility ?? array()
                            );
                        }
                    }
                }
            }
            
        } catch (Exception $e) {
            error_log('WRM Plugin Update Error: ' . $e->getMessage());
        }
        
        return $updates;
    }
    
    /**
     * Comprehensive theme update detection
     */
    private function get_theme_updates_comprehensive() {
        $updates = array();
        
        try {
            // Method 1: WordPress standard function
            if (function_exists('get_theme_updates')) {
                $theme_updates = get_theme_updates();
                foreach ($theme_updates as $theme_slug => $theme_data) {
                    if (isset($theme_data->update)) {
                        $updates[] = array(
                            'theme' => $theme_data->get('Name'),
                            'slug' => $theme_slug,
                            'current_version' => $theme_data->get('Version'),
                            'new_version' => $theme_data->update['new_version'] ?? '',
                            'package' => $theme_data->update['package'] ?? ''
                        );
                    }
                }
            }
            
            // Method 2: Direct transient check (fallback)
            if (empty($updates)) {
                $update_themes = get_site_transient('update_themes');
                if ($update_themes && isset($update_themes->response)) {
                    $all_themes = wp_get_themes();
                    
                    foreach ($update_themes->response as $theme_slug => $update_data) {
                        if (isset($all_themes[$theme_slug])) {
                            $theme_info = $all_themes[$theme_slug];
                            $updates[] = array(
                                'theme' => $theme_info->get('Name'),
                                'slug' => $theme_slug,
                                'current_version' => $theme_info->get('Version'),
                                'new_version' => $update_data['new_version'] ?? '',
                                'package' => $update_data['package'] ?? ''
                            );
                        }
                    }
                }
            }
            
        } catch (Exception $e) {
            error_log('WRM Theme Update Error: ' . $e->getMessage());
        }
        
        return $updates;
    }
    
    /**
     * Perform bulk updates - ENHANCED with proper error handling
     */
    public function perform_updates($request) {
        $params = $request->get_json_params();
        $wordpress = $params['wordpress'] ?? false;
        $plugins = $params['plugins'] ?? array();
        $themes = $params['themes'] ?? array();
        
        // CRITICAL: Increase execution time and memory for updates
        if (function_exists('set_time_limit')) {
            set_time_limit(300); // 5 minutes
        }
        if (function_exists('ini_set')) {
            ini_set('memory_limit', '512M');
        }
        
        $results = array(
            'success' => true,
            'plugins' => array(),
            'themes' => array(),
            'maintenance_mode' => false,
            'filesystem_initialized' => false
        );
        
        // CRITICAL: Initialize filesystem first
        if (!$this->init_wp_filesystem()) {
            return rest_ensure_response(array(
                'success' => false,
                'error' => 'Failed to initialize WordPress filesystem',
                'filesystem_initialized' => false
            ));
        }
        $results['filesystem_initialized'] = true;
        
        // Enable maintenance mode
        $this->enable_maintenance_mode('Updates in progress...');
        $results['maintenance_mode'] = true;
        
        try {
            // Update WordPress core
            if ($wordpress) {
                $wp_result = $this->perform_wordpress_update();
                $results['wordpress'] = $wp_result;
            }
            
            // Update plugins
            foreach ($plugins as $plugin) {
                $result = $this->perform_plugin_update($plugin);
                $results['plugins'][] = array(
                    'plugin' => $plugin,
                    'success' => $result['success'],
                    'message' => $result['message']
                );
            }
            
            // Update themes
            foreach ($themes as $theme) {
                $result = $this->perform_theme_update($theme);
                $results['themes'][] = array(
                    'theme' => $theme,
                    'success' => $result['success'],
                    'message' => $result['message']
                );
            }
            
        } catch (Exception $e) {
            $results['success'] = false;
            $results['error'] = $e->getMessage();
        } finally {
            // Always disable maintenance mode
            $this->disable_maintenance_mode();
            $results['maintenance_mode'] = false;
        }
        
        return rest_ensure_response($results);
    }
    
    /**
     * Update individual plugin
     */
    public function update_plugin($request) {
        $params = $request->get_json_params();
        $plugin = $params['plugin'] ?? '';
        
        if (empty($plugin)) {
            return new WP_Error('missing_plugin', 'Plugin path is required', array('status' => 400));
        }
        
        // Initialize filesystem
        if (!$this->init_wp_filesystem()) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'Failed to initialize filesystem'
            ));
        }
        
        $result = $this->perform_plugin_update($plugin);
        return rest_ensure_response($result);
    }
    
    /**
     * Update individual theme
     */
    public function update_theme($request) {
        $params = $request->get_json_params();
        $theme = $params['theme'] ?? '';
        
        if (empty($theme)) {
            return new WP_Error('missing_theme', 'Theme slug is required', array('status' => 400));
        }
        
        // Initialize filesystem
        if (!$this->init_wp_filesystem()) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'Failed to initialize filesystem'
            ));
        }
        
        $result = $this->perform_theme_update($theme);
        return rest_ensure_response($result);
    }
    
    /**
     * Update WordPress core
     */
    public function update_wordpress($request) {
        // Initialize filesystem
        if (!$this->init_wp_filesystem()) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'Failed to initialize filesystem'
            ));
        }
        
        $result = $this->perform_wordpress_update();
        return rest_ensure_response($result);
    }
    
    /**
     * Perform WordPress core update - ENHANCED
     */
    private function perform_wordpress_update() {
        try {
            // Include all required files
            if (!function_exists('wp_version_check')) {
                require_once ABSPATH . 'wp-admin/includes/update.php';
            }
            if (!function_exists('get_core_updates')) {
                require_once ABSPATH . 'wp-admin/includes/update.php';
            }
            if (!class_exists('Core_Upgrader')) {
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
            }
            // CRITICAL: Include upgrader skin
            if (!class_exists('WP_Upgrader_Skin')) {
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader-skins.php';
            }
            
            wp_version_check();
            $updates = get_core_updates();
            
            if (empty($updates) || $updates[0]->response !== 'upgrade') {
                return array(
                    'success' => false,
                    'message' => 'No WordPress updates available'
                );
            }
            
            // ENHANCED: Use automatic upgrader skin for API operations
            $skin = new Automatic_Upgrader_Skin();
            $upgrader = new Core_Upgrader($skin);
            $result = $upgrader->upgrade($updates[0]);
            
            if (is_wp_error($result)) {
                return array(
                    'success' => false,
                    'message' => $result->get_error_message()
                );
            }
            
            return array(
                'success' => true,
                'message' => 'WordPress updated successfully'
            );
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => $e->getMessage()
            );
        }
    }
    
    /**
     * Perform plugin update - ENHANCED
     */
    private function perform_plugin_update($plugin_path) {
        try {
            // Include all required files
            if (!function_exists('get_plugin_updates')) {
                require_once ABSPATH . 'wp-admin/includes/update.php';
            }
            if (!class_exists('Plugin_Upgrader')) {
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
            }
            if (!class_exists('WP_Upgrader_Skin')) {
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader-skins.php';
            }
            
            // Force update check
            wp_update_plugins();
            
            // Check if update is available using both methods
            $plugin_updates = get_plugin_updates();
            $update_available = false;
            
            if (isset($plugin_updates[$plugin_path])) {
                $update_available = true;
            } else {
                // Check transient directly
                $update_plugins = get_site_transient('update_plugins');
                if ($update_plugins && isset($update_plugins->response[$plugin_path])) {
                    $update_available = true;
                }
            }
            
            if (!$update_available) {
                return array(
                    'success' => false,
                    'message' => 'No update available for this plugin'
                );
            }
            
            // ENHANCED: Use automatic upgrader skin for API operations
            $skin = new Automatic_Upgrader_Skin();
            $upgrader = new Plugin_Upgrader($skin);
            $result = $upgrader->upgrade($plugin_path);
            
            if (is_wp_error($result)) {
                return array(
                    'success' => false,
                    'message' => $result->get_error_message()
                );
            }
            
            // Clear plugin cache
            wp_clean_plugins_cache();
            
            return array(
                'success' => true,
                'message' => 'Plugin updated successfully'
            );
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => $e->getMessage()
            );
        }
    }
    
    /**
     * Perform theme update - ENHANCED
     */
    private function perform_theme_update($theme_slug) {
        try {
            // Include all required files
            if (!function_exists('get_theme_updates')) {
                require_once ABSPATH . 'wp-admin/includes/update.php';
            }
            if (!class_exists('Theme_Upgrader')) {
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
            }
            if (!class_exists('WP_Upgrader_Skin')) {
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader-skins.php';
            }
            
            // Force update check
            wp_update_themes();
            
            // Check if update is available
            $theme_updates = get_theme_updates();
            $update_available = false;
            
            if (isset($theme_updates[$theme_slug])) {
                $update_available = true;
            } else {
                // Check transient directly
                $update_themes = get_site_transient('update_themes');
                if ($update_themes && isset($update_themes->response[$theme_slug])) {
                    $update_available = true;
                }
            }
            
            if (!$update_available) {
                return array(
                    'success' => false,
                    'message' => 'No update available for this theme'
                );
            }
            
            // ENHANCED: Use automatic upgrader skin for API operations
            $skin = new Automatic_Upgrader_Skin();
            $upgrader = new Theme_Upgrader($skin);
            $result = $upgrader->upgrade($theme_slug);
            
            if (is_wp_error($result)) {
                return array(
                    'success' => false,
                    'message' => $result->get_error_message()
                );
            }
            
            // Clear theme cache
            wp_clean_themes_cache();
            
            return array(
                'success' => true,
                'message' => 'Theme updated successfully'
            );
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => $e->getMessage()
            );
        }
    }
    
    /**
     * Get all plugins
     */
    public function get_plugins($request) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        $network_active_plugins = is_multisite() ? get_site_option('active_sitewide_plugins', array()) : array();
        
        $plugins = array();
        
        foreach ($all_plugins as $plugin_path => $plugin_data) {
            $plugins[] = array(
                'name' => $plugin_data['Name'],
                'version' => $plugin_data['Version'],
                'description' => $plugin_data['Description'],
                'author' => $plugin_data['Author'],
                'author_uri' => $plugin_data['AuthorURI'],
                'plugin_uri' => $plugin_data['PluginURI'],
                'text_domain' => $plugin_data['TextDomain'],
                'domain_path' => $plugin_data['DomainPath'],
                'active' => in_array($plugin_path, $active_plugins) || array_key_exists($plugin_path, $network_active_plugins),
                'update_available' => false,
                'path' => $plugin_path,
                'network' => $plugin_data['Network'] ?? false,
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'plugins' => $plugins,
            'total' => count($plugins)
        ));
    }
    
    /**
     * Get all themes
     */
    public function get_themes($request) {
        $all_themes = wp_get_themes();
        $active_theme = get_stylesheet();
        
        $themes = array();
        
        foreach ($all_themes as $theme_slug => $theme_data) {
            $themes[] = array(
                'name' => $theme_data->get('Name'),
                'version' => $theme_data->get('Version'),
                'description' => $theme_data->get('Description'),
                'author' => $theme_data->get('Author'),
                'author_uri' => $theme_data->get('AuthorURI'),
                'theme_uri' => $theme_data->get('ThemeURI'),
                'template' => $theme_data->get('Template'),
                'stylesheet' => $theme_data->get('Stylesheet'),
                'active' => ($theme_slug === $active_theme),
                'slug' => $theme_slug,
                'screenshot' => $theme_data->get_screenshot(),
                'tags' => $theme_data->get('Tags')
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'themes' => $themes,
            'total' => count($themes),
            'active_theme' => $active_theme
        ));
    }
    
    /**
     * Get users with comprehensive data
     */
    public function get_users($request) {
        $users = get_users(array('fields' => 'all'));
        $user_data = array();
        
        foreach ($users as $user) {
            $user_data[] = array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'roles' => $user->roles,
                'registered' => $user->user_registered,
                'last_login' => get_user_meta($user->ID, 'last_login', true),
                'login_count' => get_user_meta($user->ID, 'login_count', true) ?: 0
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $user_data,
            'total' => count($user_data)
        ));
    }
    
    /**
     * Get detailed user information
     */
    public function get_users_detailed($request) {
        $users = get_users(array('fields' => 'all'));
        $detailed_users = array();
        
        foreach ($users as $user) {
            $user_meta = get_user_meta($user->ID);
            $detailed_users[] = array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'nickname' => $user->nickname,
                'roles' => $user->roles,
                'capabilities' => $user->allcaps,
                'registered' => $user->user_registered,
                'status' => $user->user_status,
                'last_login' => get_user_meta($user->ID, 'last_login', true),
                'login_count' => get_user_meta($user->ID, 'login_count', true) ?: 0,
                'meta' => $user_meta
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $detailed_users,
            'total' => count($detailed_users)
        ));
    }
    
    /**
     * Get all users comprehensive - FIXED for complete user detection
     */
    public function get_all_users_comprehensive($request) {
        // Get all users with no limit and all fields
        $args = array(
            'number' => '', // No limit
            'fields' => 'all',
            'orderby' => 'registered',
            'order' => 'DESC'
        );
        
        $users = get_users($args);
        $comprehensive_users = array();
        
        foreach ($users as $user) {
            $comprehensive_users[] = array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'nickname' => $user->nickname,
                'roles' => $user->roles,
                'registered' => $user->user_registered,
                'status' => $user->user_status,
                'last_login' => get_user_meta($user->ID, 'last_login', true),
                'login_count' => get_user_meta($user->ID, 'login_count', true) ?: 0,
                'avatar' => get_avatar_url($user->ID),
                'posts_count' => count_user_posts($user->ID)
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $comprehensive_users,
            'total' => count($comprehensive_users),
            'detection_method' => 'get_users_comprehensive',
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Maintenance mode management
     */
    public function maintenance_mode($request) {
        $method = $request->get_method();
        
        if ($method === 'GET') {
            // Check maintenance mode status
            $maintenance_file = ABSPATH . '.maintenance';
            $status = file_exists($maintenance_file);
            
            return rest_ensure_response(array(
                'success' => true,
                'maintenance' => $status
            ));
        } else {
            // Toggle maintenance mode
            $params = $request->get_json_params();
            $enable = $params['enable'] ?? false;
            $message = $params['message'] ?? 'Website is temporarily unavailable for maintenance.';
            
            if ($enable) {
                return $this->enable_maintenance_mode($message);
            } else {
                return $this->disable_maintenance_mode();
            }
        }
    }
    
    /**
     * Enable maintenance mode
     */
    private function enable_maintenance_mode($message = '') {
        $message = $message ?: 'Website is temporarily unavailable for maintenance. Please try again later.';
        
        $maintenance_content = "<?php\n\$upgrading = time();\n// Custom message: " . $message;
        
        $result = file_put_contents(ABSPATH . '.maintenance', $maintenance_content);
        
        if ($result === false) {
            return array(
                'success' => false,
                'message' => 'Failed to enable maintenance mode'
            );
        }
        
        return array(
            'success' => true,
            'message' => 'Maintenance mode enabled',
            'maintenance_mode' => true
        );
    }
    
    /**
     * Disable maintenance mode
     */
    private function disable_maintenance_mode() {
        $maintenance_file = ABSPATH . '.maintenance';
        
        if (file_exists($maintenance_file)) {
            $result = unlink($maintenance_file);
            
            if (!$result) {
                return array(
                    'success' => false,
                    'message' => 'Failed to disable maintenance mode'
                );
            }
        }
        
        return array(
            'success' => true,
            'message' => 'Maintenance mode disabled',
            'maintenance_mode' => false
        );
    }
    
    /**
     * Activate plugin endpoint
     */
    public function activate_plugin_endpoint($request) {
        $params = $request->get_json_params();
        $plugin = $params['plugin'] ?? '';
        
        if (empty($plugin)) {
            return new WP_Error('missing_plugin', 'Plugin path is required', array('status' => 400));
        }
        
        if (!function_exists('activate_plugin')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $result = activate_plugin($plugin);
        
        if (is_wp_error($result)) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => $result->get_error_message()
            ));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Plugin activated successfully'
        ));
    }
    
    /**
     * Deactivate plugin endpoint
     */
    public function deactivate_plugin_endpoint($request) {
        $params = $request->get_json_params();
        $plugin = $params['plugin'] ?? '';
        
        if (empty($plugin)) {
            return new WP_Error('missing_plugin', 'Plugin path is required', array('status' => 400));
        }
        
        if (!function_exists('deactivate_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        deactivate_plugins($plugin);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Plugin deactivated successfully'
        ));
    }
    
    /**
     * Get security logs
     */
    public function get_security_logs($request) {
        $logs = get_option('wrm_security_logs', array());
        
        return rest_ensure_response(array(
            'success' => true,
            'logs' => array_reverse($logs), // Most recent first
            'total' => count($logs)
        ));
    }
    
    /**
     * Add CORS headers
     */
    public function add_cors_headers() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function($value) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WRM-API-Key, X-WRMS-API-Key');
            return $value;
        });
    }
    
    /**
     * Generate API key
     */
    public function generate_api_key() {
        $api_key = wp_generate_password(32, false, false);
        update_option($this->option_name, $api_key);
        return $api_key;
    }
    
    /**
     * AJAX handler for regenerating API key
     */
    public function ajax_regenerate_key() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized', 403);
        }
        
        check_ajax_referer('wrm_regenerate_nonce', 'nonce');
        
        $new_key = $this->generate_api_key();
        
        wp_send_json_success(array(
            'success' => true,
            'new_api_key' => $new_key,
            'message' => 'New API key generated successfully',
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * AJAX handler for updating API key
     */
    public function ajax_update_key() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized', 403);
        }
        
        check_ajax_referer('wrm_update_nonce', 'nonce');
        
        $new_key = sanitize_text_field($_POST['api_key']);
        
        if (strlen($new_key) < 16) {
            wp_send_json_error(array(
                'message' => 'API key must be at least 16 characters long'
            ));
        }
        
        update_option($this->option_name, $new_key);
        
        wp_send_json_success(array(
            'success' => true,
            'message' => 'API key updated successfully',
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get MySQL version
     */
    private function get_mysql_version() {
        global $wpdb;
        return $wpdb->get_var("SELECT VERSION()");
    }
    
    /**
     * Track user login
     */
    public function track_user_login($user_login, $user) {
        update_user_meta($user->ID, 'last_login', current_time('mysql'));
        
        $login_count = get_user_meta($user->ID, 'login_count', true);
        $login_count = $login_count ? $login_count + 1 : 1;
        update_user_meta($user->ID, 'login_count', $login_count);
    }
    
    /**
     * Plugin activation
     */
    public function activate_plugin() {
        // Generate API key on activation
        if (!get_option($this->option_name)) {
            $this->generate_api_key();
        }
        
        // Log plugin activation
        error_log('WP Remote Manager Enhanced Users v' . $this->version . ' activated');
    }
    
    /**
     * Admin menu
     */
    public function admin_menu() {
        // Add main settings page
        add_options_page(
            'WP Remote Manager Enhanced',
            'WP Remote Manager',
            'manage_options',
            'wp-remote-manager-enhanced',
            array($this, 'admin_page')
        );
        
        // Add settings link to plugin actions
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
    }
    
    /**
     * Add settings link to plugin actions
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=wp-remote-manager-enhanced') . '" style="color: #2271b1; font-weight: bold;">' . __('API Key Settings') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
    
    /**
     * Admin notices for plugin status
     */
    public function admin_notices() {
        $current_screen = get_current_screen();
        
        // Show notice on plugins page if API key is not configured
        if ($current_screen && $current_screen->id === 'plugins' && !get_option($this->option_name)) {
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>WP Remote Manager:</strong> Please <a href="' . admin_url('options-general.php?page=wp-remote-manager-enhanced') . '">configure your API key</a> to enable remote management.</p>';
            echo '</div>';
        }
    }
    
    /**
     * Admin bar menu item
     */
    public function admin_bar_menu($wp_admin_bar) {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $wp_admin_bar->add_node(array(
            'id' => 'wp-remote-manager',
            'title' => '<span class="ab-icon dashicons dashicons-admin-network" style="margin-top:3px;"></span> Remote Manager',
            'href' => admin_url('options-general.php?page=wp-remote-manager-enhanced')
        ));
    }
    
    /**
     * Admin page content
     */
    public function admin_page() {
        $api_key = get_option($this->option_name);
        $site_url = home_url();
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?> <span style="color: #0073aa;">v<?php echo $this->version; ?></span></h1>
            
            <div class="notice notice-success">
                <p><strong>✅ Plugin Status:</strong> Active with ENHANCED UPDATE EXECUTION (v3.2.2)</p>
                <p><strong>🔧 Critical Fixes Applied:</strong> WP_Filesystem initialization, proper admin context, automatic upgrader skin, enhanced error handling</p>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; margin: 20px 0;">
                <h2 style="margin-top: 0;">🔐 API Configuration</h2>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">Site URL</th>
                        <td><code><?php echo esc_html($site_url); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row">Current API Key</th>
                        <td>
                            <input type="text" id="current-api-key" value="<?php echo esc_attr($api_key); ?>" readonly style="width: 350px; font-family: monospace; background: #f7f7f7;" />
                            <button type="button" onclick="copyToClipboard('current-api-key')" class="button">Copy</button>
                        </td>
                    </tr>
                </table>
                
                <div style="margin: 20px 0;">
                    <button type="button" id="regenerate-key" class="button button-secondary">🔄 Generate New API Key</button>
                    <button type="button" id="update-key" class="button button-primary" style="margin-left: 10px;">💾 Update Custom Key</button>
                </div>
                
                <div id="custom-key-section" style="display: none; margin-top: 15px;">
                    <input type="text" id="custom-api-key" placeholder="Enter custom API key (minimum 16 characters)" style="width: 350px; font-family: monospace;" />
                    <button type="button" id="save-custom-key" class="button button-primary">Save Key</button>
                    <button type="button" id="cancel-custom-key" class="button button-secondary">Cancel</button>
                </div>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; margin: 20px 0;">
                <h2 style="margin-top: 0;">🚀 Available API Endpoints</h2>
                
                <h3>Core Endpoints</h3>
                <ul style="font-family: monospace; background: #f7f7f7; padding: 15px; border-radius: 4px;">
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/status</code> - Site status and information</li>
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/health</code> - Health check (no auth required)</li>
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/updates</code> - Check for available updates</li>
                </ul>
                
                <h3 style="color: #28a745;">🔥 UPDATE EXECUTION - FIXED v3.2.2</h3>
                <ul style="font-family: monospace; background: #d4edda; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745;">
                    <li><strong>POST</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/updates/perform</code> - Execute bulk updates (FIXED)</li>
                    <li><strong>POST</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/update-plugin</code> - Update individual plugin (FIXED)</li>
                    <li><strong>POST</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/update-theme</code> - Update individual theme (FIXED)</li>
                    <li><strong>POST</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/update-wordpress</code> - Update WordPress core (FIXED)</li>
                </ul>
                
                <h3>Plugin & Theme Management</h3>
                <ul style="font-family: monospace; background: #f7f7f7; padding: 15px; border-radius: 4px;">
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/plugins</code> - List all plugins</li>
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/themes</code> - List all themes</li>
                    <li><strong>POST</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/activate-plugin</code> - Activate plugin</li>
                    <li><strong>POST</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/deactivate-plugin</code> - Deactivate plugin</li>
                </ul>
                
                <h3>User Management</h3>
                <ul style="font-family: monospace; background: #f7f7f7; padding: 15px; border-radius: 4px;">
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/users</code> - List users</li>
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/users/detailed</code> - Detailed user information</li>
                </ul>
                
                <h3>Maintenance Mode</h3>
                <ul style="font-family: monospace; background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
                    <li><strong>GET/POST</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/maintenance</code> - Manage maintenance mode</li>
                </ul>
                
                <h3>Security</h3>
                <ul style="font-family: monospace; background: #f7f7f7; padding: 15px; border-radius: 4px;">
                    <li><strong>GET</strong> <code><?php echo $site_url; ?>/wp-json/<?php echo $this->api_namespace; ?>/security-logs</code> - View security logs</li>
                </ul>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; margin: 20px 0;">
                <h2 style="margin-top: 0;">📝 Authentication</h2>
                <p>All API endpoints require authentication using the API key in the request header:</p>
                <div style="background: #f7f7f7; padding: 15px; border-radius: 4px; font-family: monospace;">
                    <code>X-WRM-API-Key: <?php echo esc_html($api_key); ?></code><br>
                    <em>or</em><br>
                    <code>X-WRMS-API-Key: <?php echo esc_html($api_key); ?></code>
                </div>
                
                <div style="background: #d4edda; padding: 15px; border-radius: 4px; margin-top: 15px; border-left: 4px solid #28a745;">
                    <h4 style="margin-top: 0; color: #155724;">✅ Update Execution Fixes (v3.2.2):</h4>
                    <ul style="color: #155724; margin-bottom: 0;">
                        <li>✅ WP_Filesystem properly initialized before all update operations</li>
                        <li>✅ Enhanced admin context with proper authentication cookies</li>
                        <li>✅ Automatic upgrader skin implementation for API operations</li>
                        <li>✅ Increased execution time and memory limits for large updates</li>
                        <li>✅ Enhanced error handling and detailed response messages</li>
                        <li>✅ Plugin and theme cache clearing after updates</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <script>
        function copyToClipboard(elementId) {
            const element = document.getElementById(elementId);
            element.select();
            element.setSelectionRange(0, 99999);
            document.execCommand('copy');
            
            const button = element.nextElementSibling;
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = '#46b450';
            button.style.color = '#fff';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.style.color = '';
            }, 2000);
        }
        
        document.getElementById('regenerate-key').addEventListener('click', function() {
            if (confirm('Are you sure you want to generate a new API key? This will invalidate the current key.')) {
                const formData = new FormData();
                formData.append('action', 'wrm_regenerate_key');
                formData.append('nonce', '<?php echo wp_create_nonce('wrm_regenerate_nonce'); ?>');
                
                fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('current-api-key').value = data.data.new_api_key;
                        alert('New API key generated successfully!');
                    } else {
                        alert('Failed to generate new API key: ' + data.data.message);
                    }
                })
                .catch(error => {
                    alert('Error: ' + error.message);
                });
            }
        });
        
        document.getElementById('update-key').addEventListener('click', function() {
            document.getElementById('custom-key-section').style.display = 'block';
            document.getElementById('custom-api-key').focus();
        });
        
        document.getElementById('cancel-custom-key').addEventListener('click', function() {
            document.getElementById('custom-key-section').style.display = 'none';
            document.getElementById('custom-api-key').value = '';
        });
        
        document.getElementById('save-custom-key').addEventListener('click', function() {
            const customKey = document.getElementById('custom-api-key').value.trim();
            
            if (customKey.length < 16) {
                alert('API key must be at least 16 characters long.');
                return;
            }
            
            const formData = new FormData();
            formData.append('action', 'wrm_update_key');
            formData.append('api_key', customKey);
            formData.append('nonce', '<?php echo wp_create_nonce('wrm_update_nonce'); ?>');
            
            fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('current-api-key').value = customKey;
                    document.getElementById('custom-key-section').style.display = 'none';
                    document.getElementById('custom-api-key').value = '';
                    alert('API key updated successfully!');
                } else {
                    alert('Failed to update API key: ' + data.data.message);
                }
            })
            .catch(error => {
                alert('Error: ' + error.message);
            });
        });
        </script>
        <?php
    }

    /**
     * Get comments with filtering and statistics
     */
    public function get_comments($request) {
        $status = $request->get_param('status') ?: 'all';
        $post_id = $request->get_param('post_id');
        $per_page = $request->get_param('per_page') ?: 20;
        $page = $request->get_param('page') ?: 1;

        $args = array(
            'number' => $per_page,
            'offset' => ($page - 1) * $per_page,
            'orderby' => 'comment_date',
            'order' => 'DESC'
        );

        if ($status !== 'all') {
            $args['status'] = $status;
        }

        if ($post_id) {
            $args['post_id'] = $post_id;
        }

        $comments = get_comments($args);
        $total_comments = wp_count_comments();

        // Get recent comments with post info
        $recent_comments = array();
        foreach ($comments as $comment) {
            $post = get_post($comment->comment_post_ID);
            $recent_comments[] = array(
                'comment_ID' => $comment->comment_ID,
                'comment_post_ID' => $comment->comment_post_ID,
                'comment_author' => $comment->comment_author,
                'comment_author_email' => $comment->comment_author_email,
                'comment_author_url' => $comment->comment_author_url,
                'comment_author_IP' => $comment->comment_author_IP,
                'comment_date' => $comment->comment_date,
                'comment_date_gmt' => $comment->comment_date_gmt,
                'comment_content' => wp_strip_all_tags($comment->comment_content),
                'comment_karma' => $comment->comment_karma,
                'comment_approved' => $comment->comment_approved,
                'comment_agent' => $comment->comment_agent,
                'comment_type' => $comment->comment_type,
                'comment_parent' => $comment->comment_parent,
                'user_id' => $comment->user_id,
                'post_title' => $post ? $post->post_title : '',
                'post_type' => $post ? $post->post_type : ''
            );
        }

        // Get comments by type
        $comments_by_type = array();
        $comment_types = wp_list_pluck(get_comments(array('number' => 1000)), 'comment_type');
        $type_counts = array_count_values($comment_types);
        foreach ($type_counts as $type => $count) {
            $comments_by_type[] = array(
                'comment_type' => $type ?: 'comment',
                'count' => $count
            );
        }

        return rest_ensure_response(array(
            'success' => true,
            'total_comments' => $total_comments->total_comments,
            'approved_comments' => $total_comments->approved,
            'pending_comments' => $total_comments->moderated,
            'spam_comments' => $total_comments->spam,
            'trash_comments' => $total_comments->trash,
            'comments_by_type' => $comments_by_type,
            'recent_comments' => $recent_comments
        ));
    }

    /**
     * Get revisions with filtering and statistics
     */
    public function get_revisions($request) {
        $post_id = $request->get_param('post_id');
        $per_page = $request->get_param('per_page') ?: 20;
        $page = $request->get_param('page') ?: 1;
        $post_type = $request->get_param('post_type') ?: 'any';

        $args = array(
            'post_type' => 'revision',
            'posts_per_page' => $per_page,
            'paged' => $page,
            'post_status' => 'any',
            'orderby' => 'post_modified',
            'order' => 'DESC'
        );

        if ($post_id) {
            $args['post_parent'] = $post_id;
        }

        $revisions_query = new WP_Query($args);
        $revisions = $revisions_query->posts;

        // Get recent revisions with parent post info
        $recent_revisions = array();
        foreach ($revisions as $revision) {
            $parent_post = get_post($revision->post_parent);
            $recent_revisions[] = array(
                'ID' => $revision->ID,
                'post_author' => $revision->post_author,
                'post_date' => $revision->post_date,
                'post_date_gmt' => $revision->post_date_gmt,
                'post_content' => wp_strip_all_tags(substr($revision->post_content, 0, 200)),
                'post_title' => $revision->post_title,
                'post_excerpt' => $revision->post_excerpt,
                'post_status' => $revision->post_status,
                'comment_status' => $revision->comment_status,
                'ping_status' => $revision->ping_status,
                'post_password' => $revision->post_password,
                'post_name' => $revision->post_name,
                'to_ping' => $revision->to_ping,
                'pinged' => $revision->pinged,
                'post_modified' => $revision->post_modified,
                'post_modified_gmt' => $revision->post_modified_gmt,
                'post_content_filtered' => $revision->post_content_filtered,
                'post_parent' => $revision->post_parent,
                'guid' => $revision->guid,
                'menu_order' => $revision->menu_order,
                'post_type' => $revision->post_type,
                'post_mime_type' => $revision->post_mime_type,
                'comment_count' => $revision->comment_count,
                'parent_post_title' => $parent_post ? $parent_post->post_title : '',
                'parent_post_type' => $parent_post ? $parent_post->post_type : ''
            );
        }

        // Get revision statistics
        $total_revisions_query = new WP_Query(array(
            'post_type' => 'revision',
            'posts_per_page' => -1,
            'post_status' => 'any',
            'fields' => 'ids'
        ));
        $total_revisions = $total_revisions_query->found_posts;

        // Get posts with revisions
        $posts_with_revisions_query = new WP_Query(array(
            'post_type' => 'any',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => '_wp_old_slug',
                    'compare' => 'EXISTS'
                )
            ),
            'fields' => 'ids'
        ));

        // Get revisions by post type
        $revisions_by_type = array();
        $parent_posts = wp_list_pluck($revisions, 'post_parent');
        $unique_parents = array_unique($parent_posts);
        $type_counts = array();
        
        foreach ($unique_parents as $parent_id) {
            if ($parent_id > 0) {
                $parent_post = get_post($parent_id);
                if ($parent_post) {
                    $type = $parent_post->post_type;
                    if (!isset($type_counts[$type])) {
                        $type_counts[$type] = 0;
                    }
                    $type_counts[$type]++;
                }
            }
        }

        foreach ($type_counts as $type => $count) {
            $revisions_by_type[] = array(
                'post_type' => $type,
                'count' => $count
            );
        }

        // Get oldest and newest revision dates
        $oldest_revision = null;
        $newest_revision = null;
        if (!empty($revisions)) {
            $oldest_revision = end($revisions)->post_modified;
            $newest_revision = reset($revisions)->post_modified;
        }

        return rest_ensure_response(array(
            'success' => true,
            'total_revisions' => $total_revisions,
            'posts_with_revisions' => count($unique_parents),
            'oldest_revision' => $oldest_revision,
            'newest_revision' => $newest_revision,
            'revisions_by_post_type' => $revisions_by_type,
            'recent_revisions' => $recent_revisions
        ));
    }

    /**
     * Delete specific comments
     */
    public function delete_comments($request) {
        $params = $request->get_json_params();
        $comment_ids = $params['comment_ids'] ?? array();

        if (empty($comment_ids) || !is_array($comment_ids)) {
            return new WP_Error('missing_ids', 'Comment IDs are required', array('status' => 400));
        }

        if (!current_user_can('moderate_comments')) {
            return new WP_Error('insufficient_permissions', 'You do not have permission to delete comments', array('status' => 403));
        }

        $deleted_count = 0;
        $errors = array();

        foreach ($comment_ids as $comment_id) {
            $comment = get_comment($comment_id);
            if (!$comment) {
                $errors[] = "Comment ID {$comment_id} not found";
                continue;
            }

            if (wp_delete_comment($comment_id, true)) {
                $deleted_count++;
                $this->log_security_event('comment_deleted', "Comment ID {$comment_id} deleted", $comment_id);
            } else {
                $errors[] = "Failed to delete comment ID {$comment_id}";
            }
        }

        return rest_ensure_response(array(
            'success' => $deleted_count > 0,
            'message' => $deleted_count > 0 
                ? "Successfully deleted {$deleted_count} comment(s)" 
                : 'No comments were deleted',
            'deleted_count' => $deleted_count,
            'errors' => $errors
        ));
    }

    /**
     * Delete specific revisions
     */
    public function delete_revisions($request) {
        $params = $request->get_json_params();
        $revision_ids = $params['revision_ids'] ?? array();

        if (empty($revision_ids) || !is_array($revision_ids)) {
            return new WP_Error('missing_ids', 'Revision IDs are required', array('status' => 400));
        }

        if (!current_user_can('edit_posts')) {
            return new WP_Error('insufficient_permissions', 'You do not have permission to delete revisions', array('status' => 403));
        }

        $deleted_count = 0;
        $errors = array();

        foreach ($revision_ids as $revision_id) {
            $revision = get_post($revision_id);
            if (!$revision || $revision->post_type !== 'revision') {
                $errors[] = "Revision ID {$revision_id} not found";
                continue;
            }

            if (wp_delete_post_revision($revision_id)) {
                $deleted_count++;
                $this->log_security_event('revision_deleted', "Revision ID {$revision_id} deleted", $revision_id);
            } else {
                $errors[] = "Failed to delete revision ID {$revision_id}";
            }
        }

        return rest_ensure_response(array(
            'success' => $deleted_count > 0,
            'message' => $deleted_count > 0 
                ? "Successfully deleted {$deleted_count} revision(s)" 
                : 'No revisions were deleted',
            'deleted_count' => $deleted_count,
            'errors' => $errors
        ));
    }

    /**
     * Clean spam comments
     */
    public function clean_spam_comments($request) {
        if (!current_user_can('moderate_comments')) {
            return new WP_Error('insufficient_permissions', 'You do not have permission to clean spam comments', array('status' => 403));
        }

        $spam_comments = get_comments(array(
            'status' => 'spam',
            'number' => 1000
        ));

        $deleted_count = 0;
        foreach ($spam_comments as $comment) {
            if (wp_delete_comment($comment->comment_ID, true)) {
                $deleted_count++;
            }
        }

        $this->log_security_event('spam_comments_cleaned', "Cleaned {$deleted_count} spam comments");

        return rest_ensure_response(array(
            'success' => true,
            'message' => "Successfully cleaned {$deleted_count} spam comment(s)",
            'deleted_count' => $deleted_count
        ));
    }

    /**
     * Clean old revisions
     */
    public function clean_old_revisions($request) {
        $params = $request->get_json_params();
        $keep_revisions = $params['keep_revisions'] ?? 5;

        if (!current_user_can('edit_posts')) {
            return new WP_Error('insufficient_permissions', 'You do not have permission to clean revisions', array('status' => 403));
        }

        global $wpdb;

        // Get all posts that have revisions
        $posts_with_revisions = $wpdb->get_col(
            "SELECT DISTINCT post_parent FROM {$wpdb->posts} 
             WHERE post_type = 'revision' AND post_parent > 0"
        );

        $deleted_count = 0;

        foreach ($posts_with_revisions as $post_id) {
            // Get revisions for this post, ordered by date (newest first)
            $revisions = wp_get_post_revisions($post_id, array(
                'orderby' => 'date',
                'order' => 'DESC'
            ));

            // Keep the specified number of revisions, delete the rest
            $revisions_to_delete = array_slice($revisions, $keep_revisions);

            foreach ($revisions_to_delete as $revision) {
                if (wp_delete_post_revision($revision->ID)) {
                    $deleted_count++;
                }
            }
        }

        $this->log_security_event('old_revisions_cleaned', "Cleaned {$deleted_count} old revisions, keeping {$keep_revisions} per post");

        return rest_ensure_response(array(
            'success' => true,
            'message' => "Successfully cleaned {$deleted_count} old revision(s), keeping {$keep_revisions} per post",
            'deleted_count' => $deleted_count
        ));
    }
}

// Initialize the plugin
new WP_Remote_Manager_Enhanced_Users();

?>