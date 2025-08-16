<?php
/**
 * Plugin Name: WP Remote Manager - Enhanced Users
 * Plugin URI: https://aiowebcare.com/
 * Description: Enhanced WordPress Remote Manager with comprehensive user data and advanced security features (v3.2.0 Final - Fixed API Key Generation)
 * Version: 3.2.0
 * Author: AIO Webcare
 * License: GPL v2 or later
 * Text Domain: wp-remote-manager-enhanced
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * WP Remote Manager Enhanced Users Class
 */
class WP_Remote_Manager_Enhanced_Users {
    
    private $version = '3.2.0';
    private $api_namespace = 'wrms/v1';
    private $option_name = 'wrm_api_key';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_api_routes'));
        add_action('admin_menu', array($this, 'admin_menu'));
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));
        
        // Add CORS headers
        add_action('init', array($this, 'add_cors_headers'));
    }
    
    public function init() {
        // Initialize plugin
    }
    
    /**
     * Register REST API routes
     */
    public function register_api_routes() {
        // Core endpoints
        register_rest_route($this->api_namespace, '/health', array(
            'methods' => 'GET',
            'callback' => array($this, 'health_check'),
            'permission_callback' => '__return_true'
        ));
        
        register_rest_route($this->api_namespace, '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_status'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Updates endpoints
        register_rest_route($this->api_namespace, '/updates', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_updates'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/updates/perform', array(
            'methods' => 'POST',
            'callback' => array($this, 'perform_updates'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
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
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        register_rest_route($this->api_namespace, '/plugins/deactivate', array(
            'methods' => 'POST',
            'callback' => array($this, 'deactivate_plugin_endpoint'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        // Theme management endpoints
        register_rest_route($this->api_namespace, '/themes', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_themes'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/themes/activate', array(
            'methods' => 'POST',
            'callback' => array($this, 'activate_theme_endpoint'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        // Enhanced user management endpoints
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
        
        // Maintenance mode endpoints
        register_rest_route($this->api_namespace, '/maintenance/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_maintenance_status'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        register_rest_route($this->api_namespace, '/maintenance/enable', array(
            'methods' => 'POST',
            'callback' => array($this, 'enable_maintenance_mode'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        register_rest_route($this->api_namespace, '/maintenance/disable', array(
            'methods' => 'POST',
            'callback' => array($this, 'disable_maintenance_mode'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        // Backup status endpoint (if UpdraftPlus is available)
        register_rest_route($this->api_namespace, '/backup/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_backup_status'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
    }
    
    /**
     * API Key verification
     */
    public function verify_api_key($request) {
        $api_key = $request->get_header('X-WRM-API-Key') ?: $request->get_header('X-WRMS-API-Key');
        
        if (empty($api_key)) {
            return new WP_Error('missing_api_key', 'API key is required', array('status' => 401));
        }
        
        $stored_key = get_option($this->option_name);
        
        if (!hash_equals($stored_key, $api_key)) {
            // Log invalid API key attempts
            error_log('WRM Enhanced Users: Invalid API key attempt from IP: ' . $_SERVER['REMOTE_ADDR']);
            return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 403));
        }
        
        return true;
    }
    
    /**
     * Admin capabilities verification
     */
    public function verify_admin_capabilities($request) {
        $api_key_check = $this->verify_api_key($request);
        if (is_wp_error($api_key_check)) {
            return $api_key_check;
        }
        
        if (!current_user_can('manage_options')) {
            return new WP_Error('insufficient_permissions', 'Insufficient permissions', array('status' => 403));
        }
        
        return true;
    }
    
    /**
     * Health check endpoint
     */
    public function health_check($request) {
        return rest_ensure_response(array(
            'status' => 'healthy',
            'plugin' => 'WP Remote Manager Enhanced Users',
            'version' => $this->version,
            'wordpress_version' => get_bloginfo('version'),
            'timestamp' => time()
        ));
    }
    
    /**
     * Get site status
     */
    public function get_status($request) {
        $site_info = array(
            'site_url' => home_url(),
            'admin_url' => admin_url(),
            'admin_email' => get_option('admin_email'),
            'wordpress_version' => get_bloginfo('version'),
            'php_version' => phpversion(),
            'mysql_version' => $this->get_mysql_version(),
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'timezone' => wp_timezone_string(),
            'multisite' => is_multisite(),
            'ssl_enabled' => is_ssl(),
            'debug_enabled' => defined('WP_DEBUG') && WP_DEBUG
        );
        
        $theme_info = array(
            'name' => wp_get_theme()->get('Name'),
            'version' => wp_get_theme()->get('Version'),
            'author' => wp_get_theme()->get('Author'),
            'stylesheet' => get_stylesheet(),
            'template' => get_template()
        );
        
        $plugin_count = array(
            'total' => count(get_plugins()),
            'active' => count(get_option('active_plugins', array())),
            'inactive' => count(get_plugins()) - count(get_option('active_plugins', array()))
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'site_info' => $site_info,
            'theme_info' => $theme_info,
            'plugin_count' => $plugin_count,
            'maintenance_mode' => get_option('wrm_maintenance_mode', false),
            'plugin_version' => $this->version,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get available updates
     */
    public function get_updates($request) {
        // Force check for updates
        wp_update_plugins();
        wp_update_themes();
        wp_version_check();
        
        $updates = array(
            'wordpress' => $this->get_core_updates(),
            'plugins' => $this->get_plugin_updates(),
            'themes' => $this->get_theme_updates()
        );
        
        $count = array(
            'total' => count($updates['plugins']) + count($updates['themes']) + ($updates['wordpress']['update_available'] ? 1 : 0),
            'core' => $updates['wordpress']['update_available'] ? 1 : 0,
            'plugins' => count($updates['plugins']),
            'themes' => count($updates['themes'])
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'updates' => $updates,
            'count' => $count,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get WordPress core updates
     */
    private function get_core_updates() {
        $core_updates = get_core_updates();
        
        if (!empty($core_updates) && !empty($core_updates[0]) && $core_updates[0]->response === 'upgrade') {
            return array(
                'update_available' => true,
                'current_version' => get_bloginfo('version'),
                'new_version' => $core_updates[0]->current,
                'package' => $core_updates[0]->package
            );
        }
        
        return array(
            'update_available' => false,
            'current_version' => get_bloginfo('version'),
            'new_version' => null,
            'package' => null
        );
    }
    
    /**
     * Get plugin updates
     */
    private function get_plugin_updates() {
        $plugin_updates = get_site_transient('update_plugins');
        $updates = array();
        
        if ($plugin_updates && isset($plugin_updates->response)) {
            foreach ($plugin_updates->response as $plugin_path => $plugin_data) {
                $current_plugin = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin_path);
                
                $updates[] = array(
                    'type' => 'plugin',
                    'name' => $current_plugin['Name'],
                    'slug' => dirname($plugin_path),
                    'current_version' => $current_plugin['Version'],
                    'new_version' => $plugin_data->new_version,
                    'package_url' => isset($plugin_data->package) ? $plugin_data->package : '',
                    'plugin_file' => $plugin_path,
                    'auto_update' => in_array($plugin_path, (array) get_option('auto_update_plugins', array()))
                );
            }
        }
        
        return $updates;
    }
    
    /**
     * Get theme updates
     */
    private function get_theme_updates() {
        $theme_updates = get_site_transient('update_themes');
        $updates = array();
        
        if ($theme_updates && isset($theme_updates->response)) {
            foreach ($theme_updates->response as $theme_slug => $theme_data) {
                $current_theme = wp_get_theme($theme_slug);
                
                $updates[] = array(
                    'type' => 'theme',
                    'name' => $current_theme->get('Name'),
                    'slug' => $theme_slug,
                    'current_version' => $current_theme->get('Version'),
                    'new_version' => $theme_data['new_version'],
                    'package_url' => isset($theme_data['package']) ? $theme_data['package'] : '',
                    'auto_update' => in_array($theme_slug, (array) get_option('auto_update_themes', array()))
                );
            }
        }
        
        return $updates;
    }
    
    /**
     * Perform updates
     */
    public function perform_updates($request) {
        $update_type = sanitize_text_field($request->get_param('type'));
        $items = $request->get_param('items');
        
        if (!$update_type || !$items) {
            return new WP_Error('missing_parameters', 'Update type and items are required', array('status' => 400));
        }
        
        $results = array();
        
        switch ($update_type) {
            case 'wordpress':
                $results[] = $this->update_wordpress_core();
                break;
                
            case 'plugins':
                foreach ($items as $plugin) {
                    $results[] = $this->update_plugin($plugin);
                }
                break;
                
            case 'themes':
                foreach ($items as $theme) {
                    $results[] = $this->update_theme($theme);
                }
                break;
                
            case 'all':
                // Update WordPress core
                $results[] = $this->update_wordpress_core();
                
                // Update plugins
                $plugin_updates = $this->get_plugin_updates();
                foreach ($plugin_updates as $plugin) {
                    $results[] = $this->update_plugin($plugin['plugin_file']);
                }
                
                // Update themes
                $theme_updates = $this->get_theme_updates();
                foreach ($theme_updates as $theme) {
                    $results[] = $this->update_theme($theme['slug']);
                }
                break;
                
            default:
                return new WP_Error('invalid_update_type', 'Invalid update type', array('status' => 400));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'results' => $results,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Update WordPress core
     */
    private function update_wordpress_core() {
        include_once ABSPATH . 'wp-admin/includes/admin.php';
        include_once ABSPATH . 'wp-admin/includes/upgrade.php';
        
        $core_updates = get_core_updates();
        
        if (empty($core_updates) || !$core_updates[0] || $core_updates[0]->response !== 'upgrade') {
            return array(
                'type' => 'wordpress',
                'success' => false,
                'message' => 'No WordPress updates available'
            );
        }
        
        $update = $core_updates[0];
        $result = wp_update_core($update);
        
        if (is_wp_error($result)) {
            return array(
                'type' => 'wordpress',
                'success' => false,
                'message' => $result->get_error_message()
            );
        }
        
        return array(
            'type' => 'wordpress',
            'success' => true,
            'message' => 'WordPress updated successfully',
            'new_version' => $update->current
        );
    }
    
    /**
     * Update plugin
     */
    private function update_plugin($plugin_file) {
        include_once ABSPATH . 'wp-admin/includes/admin.php';
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        include_once ABSPATH . 'wp-admin/includes/update.php';
        include_once ABSPATH . 'wp-admin/includes/file.php';
        include_once ABSPATH . 'wp-admin/includes/misc.php';
        
        $plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin_file);
        
        $upgrader = new Plugin_Upgrader();
        $result = $upgrader->upgrade($plugin_file);
        
        if (is_wp_error($result)) {
            return array(
                'type' => 'plugin',
                'name' => $plugin_data['Name'],
                'success' => false,
                'message' => $result->get_error_message()
            );
        }
        
        return array(
            'type' => 'plugin',
            'name' => $plugin_data['Name'],
            'success' => $result !== false,
            'message' => $result ? 'Plugin updated successfully' : 'Plugin update failed'
        );
    }
    
    /**
     * Update theme
     */
    private function update_theme($theme_slug) {
        include_once ABSPATH . 'wp-admin/includes/admin.php';
        include_once ABSPATH . 'wp-admin/includes/theme.php';
        include_once ABSPATH . 'wp-admin/includes/update.php';
        include_once ABSPATH . 'wp-admin/includes/file.php';
        include_once ABSPATH . 'wp-admin/includes/misc.php';
        
        $theme = wp_get_theme($theme_slug);
        
        $upgrader = new Theme_Upgrader();
        $result = $upgrader->upgrade($theme_slug);
        
        if (is_wp_error($result)) {
            return array(
                'type' => 'theme',
                'name' => $theme->get('Name'),
                'success' => false,
                'message' => $result->get_error_message()
            );
        }
        
        return array(
            'type' => 'theme',
            'name' => $theme->get('Name'),
            'success' => $result !== false,
            'message' => $result ? 'Theme updated successfully' : 'Theme update failed'
        );
    }
    
    /**
     * Get plugins
     */
    public function get_plugins($request) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        $plugins = array();
        
        foreach ($all_plugins as $plugin_path => $plugin_data) {
            $plugins[] = array(
                'name' => $plugin_data['Name'],
                'version' => $plugin_data['Version'],
                'description' => $plugin_data['Description'],
                'author' => $plugin_data['Author'],
                'plugin_uri' => $plugin_data['PluginURI'],
                'text_domain' => $plugin_data['TextDomain'],
                'domain_path' => $plugin_data['DomainPath'],
                'network' => $plugin_data['Network'],
                'active' => in_array($plugin_path, $active_plugins),
                'plugin_file' => $plugin_path
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'plugins' => $plugins,
            'count' => count($plugins),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Activate plugin endpoint
     */
    public function activate_plugin_endpoint($request) {
        $plugin_file = sanitize_text_field($request->get_param('plugin_file'));
        
        if (empty($plugin_file)) {
            return new WP_Error('missing_plugin_file', 'Plugin file is required', array('status' => 400));
        }
        
        if (!function_exists('activate_plugin')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $result = activate_plugin($plugin_file);
        
        if (is_wp_error($result)) {
            return new WP_Error('activation_failed', $result->get_error_message(), array('status' => 500));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Plugin activated successfully',
            'plugin_file' => $plugin_file,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Deactivate plugin endpoint
     */
    public function deactivate_plugin_endpoint($request) {
        $plugin_file = sanitize_text_field($request->get_param('plugin_file'));
        
        if (empty($plugin_file)) {
            return new WP_Error('missing_plugin_file', 'Plugin file is required', array('status' => 400));
        }
        
        if (!function_exists('deactivate_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        deactivate_plugins(array($plugin_file));
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Plugin deactivated successfully',
            'plugin_file' => $plugin_file,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get themes
     */
    public function get_themes($request) {
        $all_themes = wp_get_themes();
        $active_theme = get_stylesheet();
        $themes = array();
        
        foreach ($all_themes as $theme_slug => $theme) {
            $themes[] = array(
                'name' => $theme->get('Name'),
                'version' => $theme->get('Version'),
                'description' => $theme->get('Description'),
                'author' => $theme->get('Author'),
                'author_uri' => $theme->get('AuthorURI'),
                'theme_uri' => $theme->get('ThemeURI'),
                'template' => $theme->get_template(),
                'stylesheet' => $theme->get_stylesheet(),
                'active' => ($theme_slug === $active_theme),
                'slug' => $theme_slug
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'themes' => $themes,
            'count' => count($themes),
            'active_theme' => $active_theme,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Activate theme endpoint
     */
    public function activate_theme_endpoint($request) {
        $theme_slug = sanitize_text_field($request->get_param('theme_slug'));
        
        if (empty($theme_slug)) {
            return new WP_Error('missing_theme_slug', 'Theme slug is required', array('status' => 400));
        }
        
        $theme = wp_get_theme($theme_slug);
        
        if (!$theme->exists()) {
            return new WP_Error('theme_not_found', 'Theme not found', array('status' => 404));
        }
        
        switch_theme($theme_slug);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Theme activated successfully',
            'theme_slug' => $theme_slug,
            'theme_name' => $theme->get('Name'),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get users with enhanced data
     */
    public function get_users($request) {
        $users = get_users(array(
            'fields' => array('ID', 'user_login', 'display_name', 'user_registered', 'user_email')
        ));
        
        $user_data = array();
        
        foreach ($users as $user) {
            $user_meta = get_userdata($user->ID);
            $user_data[] = array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'display_name' => $user->display_name,
                'registered_date' => $user->user_registered,
                'roles' => $user_meta->roles,
                'post_count' => count_user_posts($user->ID),
                'avatar_url' => get_avatar_url($user->ID),
                'email' => $user->user_email,
                'user_email' => $user->user_email
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $user_data,
            'count' => count($user_data),
            'total_users' => count($users),
            'enhanced_features' => array(
                'email_included' => true,
                'detailed_metadata' => false,
                'login_tracking' => true
            ),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get detailed user data with additional metadata
     */
    public function get_users_detailed($request) {
        $users = get_users();
        $detailed_users = array();
        
        foreach ($users as $user) {
            $user_meta = get_user_meta($user->ID);
            
            $detailed_users[] = array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => get_user_meta($user->ID, 'first_name', true),
                'last_name' => get_user_meta($user->ID, 'last_name', true),
                'roles' => $user->roles,
                'registered_date' => $user->user_registered,
                'last_login' => get_user_meta($user->ID, 'last_login', true),
                'post_count' => count_user_posts($user->ID),
                'status' => 'active', // WordPress doesn't have built-in user status
                'avatar_url' => get_avatar_url($user->ID),
                'description' => get_user_meta($user->ID, 'description', true),
                'website' => get_user_meta($user->ID, 'user_url', true)
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $detailed_users,
            'count' => count($detailed_users),
            'enhanced_features' => array(
                'detailed_metadata' => true,
                'last_login_tracking' => true,
                'custom_fields' => true
            ),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get maintenance mode status
     */
    public function get_maintenance_status($request) {
        return rest_ensure_response(array(
            'success' => true,
            'maintenance_mode' => get_option('wrm_maintenance_mode', false),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Enable maintenance mode
     */
    public function enable_maintenance_mode($request) {
        update_option('wrm_maintenance_mode', true);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Maintenance mode enabled',
            'maintenance_mode' => true,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Disable maintenance mode
     */
    public function disable_maintenance_mode($request) {
        update_option('wrm_maintenance_mode', false);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Maintenance mode disabled',
            'maintenance_mode' => false,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get backup status (UpdraftPlus integration)
     */
    public function get_backup_status($request) {
        $backup_info = array(
            'plugin_active' => false,
            'last_backup' => null,
            'next_scheduled' => null,
            'backup_location' => null
        );
        
        // Check if UpdraftPlus is active
        if (is_plugin_active('updraftplus/updraftplus.php')) {
            $backup_info['plugin_active'] = true;
            
            // Get UpdraftPlus backup history
            if (class_exists('UpdraftPlus_Backup_History')) {
                $backup_history = UpdraftPlus_Backup_History::get_history();
                if (!empty($backup_history)) {
                    $latest_backup = array_shift($backup_history);
                    $backup_info['last_backup'] = date('c', $latest_backup);
                }
            }
            
            // Get next scheduled backup
            $next_scheduled = wp_next_scheduled('updraft_backup');
            if ($next_scheduled) {
                $backup_info['next_scheduled'] = date('c', $next_scheduled);
            }
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'backup' => $backup_info,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Add CORS headers
     */
    public function add_cors_headers() {
        add_filter('rest_pre_serve_request', function($value) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Headers: X-WRM-API-Key, X-WRMS-API-Key, Content-Type, Authorization');
            header('Access-Control-Allow-Credentials: true');
            return $value;
        });
    }
    
    /**
     * Generate secure API key - FIXED to generate 32-character keys
     */
    private function generate_api_key() {
        $api_key = bin2hex(random_bytes(16)); // 32 character secure key
        update_option($this->option_name, $api_key);
        return $api_key;
    }
    
    /**
     * Get MySQL version
     */
    private function get_mysql_version() {
        global $wpdb;
        return $wpdb->get_var("SELECT VERSION()");
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
        add_options_page(
            'WP Remote Manager Enhanced',
            'WP Remote Manager',
            'manage_options',
            'wp-remote-manager-enhanced',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        if (isset($_POST['generate_api_key'])) {
            $new_key = $this->generate_api_key();
            echo '<div class="notice notice-success"><p><strong>New API Key Generated!</strong> Copy this key to your dashboard: <code>' . esc_html($new_key) . '</code></p></div>';
        }
        
        if (isset($_POST['wrm_api_key'])) {
            $new_key = sanitize_text_field($_POST['wrm_api_key']);
            if (strlen($new_key) >= 32) {
                update_option($this->option_name, $new_key);
                echo '<div class="notice notice-success"><p><strong>API Key Updated Successfully!</strong></p></div>';
            } else {
                echo '<div class="notice notice-error"><p><strong>Error:</strong> API key must be at least 32 characters long.</p></div>';
            }
        }
        
        $current_key = get_option($this->option_name);
        $site_url = home_url();
        ?>
        <div class="wrap">
            <h1><span class="dashicons dashicons-admin-network" style="margin-right: 8px;"></span>WP Remote Manager Enhanced Users</h1>
            <p>Advanced WordPress remote management plugin with comprehensive user data and enhanced security.</p>
            
            <div class="card" style="max-width: none;">
                <h2>API Key Configuration</h2>
                <form method="post" style="margin: 20px 0;">
                    <table class="form-table">
                        <tr>
                            <th scope="row">Current API Key</th>
                            <td>
                                <input type="text" name="wrm_api_key" value="<?php echo esc_attr($current_key); ?>" class="regular-text code" readonly />
                                <button type="submit" name="generate_api_key" class="button button-secondary" onclick="return confirm('Generate a new API key? This will invalidate the current key.')">Generate New Key</button>
                                <p class="description">Copy this key to your AIO Webcare dashboard. Keep it secure! <strong>Length: <?php echo strlen($current_key); ?> characters</strong></p>
                            </td>
                        </tr>
                    </table>
                </form>
            </div>
            
            <div class="card" style="max-width: none;">
                <h2>Plugin Information</h2>
                <table class="widefat">
                    <tbody>
                        <tr>
                            <td><strong>Plugin Version</strong></td>
                            <td><?php echo esc_html($this->version); ?></td>
                        </tr>
                        <tr>
                            <td><strong>WordPress Version</strong></td>
                            <td><?php echo esc_html(get_bloginfo('version')); ?></td>
                        </tr>
                        <tr>
                            <td><strong>PHP Version</strong></td>
                            <td><?php echo esc_html(phpversion()); ?></td>
                        </tr>
                        <tr>
                            <td><strong>API Namespace</strong></td>
                            <td><?php echo esc_html($this->api_namespace); ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="card" style="max-width: none;">
                <h2>Available REST API Endpoints</h2>
                <p>All endpoints require the API key in the <code>X-WRM-API-Key</code> or <code>X-WRMS-API-Key</code> header.</p>
                
                <h3>Core Information</h3>
                <ul>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/status</code> - Site status and information</li>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/health</code> - Health check (no auth required)</li>
                </ul>
                
                <h3>Updates Management</h3>
                <ul>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/updates</code> - Get available updates</li>
                    <li><code>POST <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/updates/perform</code> - Perform updates</li>
                </ul>
                
                <h3>Plugin Management</h3>
                <ul>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/plugins</code> - Get all plugins</li>
                    <li><code>POST <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/plugins/activate</code> - Activate plugin</li>
                    <li><code>POST <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/plugins/deactivate</code> - Deactivate plugin</li>
                </ul>
                
                <h3>Theme Management</h3>
                <ul>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/themes</code> - Get all themes</li>
                    <li><code>POST <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/themes/activate</code> - Activate theme</li>
                </ul>
                
                <h3>Enhanced User Management</h3>
                <ul>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/users</code> - Get all users with email</li>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/users/detailed</code> - Get detailed user data</li>
                </ul>
                
                <h3>Maintenance Mode</h3>
                <ul>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/maintenance/status</code> - Get maintenance status</li>
                    <li><code>POST <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/maintenance/enable</code> - Enable maintenance mode</li>
                    <li><code>POST <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/maintenance/disable</code> - Disable maintenance mode</li>
                </ul>
                
                <h3>Backup Integration</h3>
                <ul>
                    <li><code>GET <?php echo esc_html($site_url); ?>/wp-json/<?php echo esc_html($this->api_namespace); ?>/backup/status</code> - Get backup status (UpdraftPlus)</li>
                </ul>
            </div>
        </div>
        <?php
    }
}

// Initialize the plugin
if (class_exists('WP_Remote_Manager_Enhanced_Users')) {
    new WP_Remote_Manager_Enhanced_Users();
}
?>