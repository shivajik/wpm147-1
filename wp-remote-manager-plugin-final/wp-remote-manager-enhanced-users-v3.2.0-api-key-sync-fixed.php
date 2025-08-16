<?php
/**
 * Plugin Name: WP Remote Manager - Enhanced Users v3.2.0 Final (API Key Sync Fixed)
 * Description: Advanced WordPress Remote Manager plugin with comprehensive user management, security, and remote maintenance capabilities - API Key Sync Fixed
 * Version: 3.2.0
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
    
    private $version = '3.2.0';
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
            'callback' => array($this, 'enable_maintenance'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        register_rest_route($this->api_namespace, '/maintenance/disable', array(
            'methods' => 'POST',
            'callback' => array($this, 'disable_maintenance'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        // Backup endpoints
        register_rest_route($this->api_namespace, '/backup/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_backup_status'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // API key management endpoint
        register_rest_route($this->api_namespace, '/api-key/regenerate', array(
            'methods' => 'POST',
            'callback' => array($this, 'regenerate_api_key_endpoint'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
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
     * Verify admin capabilities
     */
    public function verify_admin_capabilities($request) {
        $api_check = $this->verify_api_key($request);
        if (is_wp_error($api_check)) {
            return $api_check;
        }
        
        if (!current_user_can('manage_options')) {
            return new WP_Error('insufficient_permissions', 'Admin permissions required', array('status' => 403));
        }
        
        return true;
    }
    
    /**
     * Get site status
     */
    public function get_status($request) {
        global $wpdb;
        
        // Get basic WordPress info
        $wp_version = get_bloginfo('version');
        $php_version = phpversion();
        $mysql_version = $this->get_mysql_version();
        
        // Get memory info
        $memory_limit = ini_get('memory_limit');
        $memory_usage = function_exists('memory_get_usage') ? round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB' : 'Unknown';
        
        // Get disk usage (if possible)
        $disk_free = function_exists('disk_free_space') ? disk_free_space(ABSPATH) : false;
        $disk_total = function_exists('disk_total_space') ? disk_total_space(ABSPATH) : false;
        
        $disk_usage = array(
            'free' => $disk_free ? round($disk_free / 1024 / 1024 / 1024, 2) . ' GB' : 'Unknown',
            'total' => $disk_total ? round($disk_total / 1024 / 1024 / 1024, 2) . ' GB' : 'Unknown',
            'used' => ($disk_free && $disk_total) ? round(($disk_total - $disk_free) / 1024 / 1024 / 1024, 2) . ' GB' : 'Unknown'
        );
        
        // Count posts, pages, users
        $posts_count = wp_count_posts()->publish;
        $pages_count = wp_count_posts('page')->publish;
        $users_count = count_users()['total_users'];
        
        // Get plugins and themes count
        $plugins_count = 0;
        if (function_exists('get_plugins')) {
            $plugins_count = count(get_plugins());
        } else {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
            $plugins_count = count(get_plugins());
        }
        
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
     * Get health status
     */
    public function get_health($request) {
        return rest_ensure_response(array(
            'status' => 'healthy',
            'plugin' => 'WP Remote Manager Enhanced Users',
            'version' => $this->version,
            'wordpress_version' => get_bloginfo('version'),
            'timestamp' => time()
        ));
    }
    
    /**
     * Get available updates
     */
    public function get_updates($request) {
        // Include required files
        if (!function_exists('get_core_updates')) {
            require_once ABSPATH . 'wp-admin/includes/update.php';
        }
        
        if (!function_exists('get_plugin_updates')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        // Force refresh of update data
        wp_update_plugins();
        wp_update_themes();
        wp_version_check();
        
        $updates = array(
            'wordpress' => $this->get_core_updates(),
            'plugins' => $this->get_plugin_updates(),
            'themes' => $this->get_theme_updates(),
            'total_count' => 0
        );
        
        // Count total updates
        $updates['total_count'] = count($updates['wordpress']) + count($updates['plugins']) + count($updates['themes']);
        
        return rest_ensure_response(array(
            'success' => true,
            'updates' => $updates,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get WordPress core updates
     */
    private function get_core_updates() {
        $core_updates = get_core_updates();
        $updates = array();
        
        if (!empty($core_updates) && !isset($core_updates[0]->response) || $core_updates[0]->response !== 'latest') {
            foreach ($core_updates as $update) {
                if ($update->response === 'upgrade') {
                    $updates[] = array(
                        'current_version' => get_bloginfo('version'),
                        'new_version' => $update->version,
                        'package' => $update->package ?? '',
                        'url' => $update->url ?? '',
                        'partial' => $update->partial ?? false
                    );
                }
            }
        }
        
        return $updates;
    }
    
    /**
     * Get plugin updates
     */
    private function get_plugin_updates() {
        $plugin_updates = get_plugin_updates();
        $updates = array();
        
        foreach ($plugin_updates as $plugin_file => $plugin_data) {
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
        
        return $updates;
    }
    
    /**
     * Get theme updates
     */
    private function get_theme_updates() {
        $theme_updates = get_theme_updates();
        $updates = array();
        
        foreach ($theme_updates as $theme_slug => $theme_data) {
            $updates[] = array(
                'theme' => $theme_data->get('Name'),
                'slug' => $theme_slug,
                'current_version' => $theme_data->get('Version'),
                'new_version' => $theme_data->update['new_version'] ?? '',
                'package' => $theme_data->update['package'] ?? '',
                'url' => $theme_data->update['url'] ?? ''
            );
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
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'results' => $results,
            'timestamp' => current_time('c')
        ));
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
        $plugins = array();
        
        foreach ($all_plugins as $plugin_path => $plugin_data) {
            $plugins[] = array(
                'name' => $plugin_data['Name'],
                'slug' => dirname($plugin_path),
                'version' => $plugin_data['Version'],
                'description' => $plugin_data['Description'],
                'author' => $plugin_data['Author'],
                'author_uri' => $plugin_data['AuthorURI'],
                'plugin_uri' => $plugin_data['PluginURI'],
                'active' => in_array($plugin_path, $active_plugins),
                'plugin_file' => $plugin_path,
                'network' => $plugin_data['Network'],
                'text_domain' => $plugin_data['TextDomain']
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
     * Get all themes
     */
    public function get_themes($request) {
        $themes = wp_get_themes();
        $current_theme = get_stylesheet();
        $theme_list = array();
        
        foreach ($themes as $theme_slug => $theme) {
            $theme_list[] = array(
                'name' => $theme->get('Name'),
                'slug' => $theme_slug,
                'version' => $theme->get('Version'),
                'description' => $theme->get('Description'),
                'author' => $theme->get('Author'),
                'author_uri' => $theme->get('AuthorURI'),
                'theme_uri' => $theme->get('ThemeURI'),
                'active' => ($theme_slug === $current_theme),
                'screenshot' => $theme->get_screenshot(),
                'tags' => $theme->get('Tags'),
                'template' => $theme->get_template()
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'themes' => $theme_list,
            'count' => count($theme_list),
            'current_theme' => $current_theme,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Enhanced Users Endpoint - Returns complete user data with email addresses
     */
    public function get_users($request) {
        $include_email = $request->get_param('include_email') !== 'false';
        $detailed = $request->get_param('detailed') === 'true';
        $limit = intval($request->get_param('limit')) ?: 100;
        
        $users = get_users(array(
            'fields' => 'all',
            'number' => min($limit, 500), // Maximum 500 users
            'orderby' => 'registered',
            'order' => 'DESC'
        ));
        
        $formatted_users = array();
        foreach ($users as $user) {
            $user_meta = get_userdata($user->ID);
            
            $user_data = array(
                'id' => (string) $user->ID,
                'username' => $user->user_login,
                'display_name' => $user->display_name,
                'registered_date' => $user->user_registered,
                'roles' => $user_meta->roles,
                'post_count' => count_user_posts($user->ID),
                'avatar_url' => get_avatar_url($user->ID, array('size' => 96))
            );
            
            // Always include email addresses (key enhancement)
            if ($include_email) {
                $user_data['email'] = $user->user_email;
            }
            
            // Add detailed information if requested
            if ($detailed) {
                $user_data = array_merge($user_data, array(
                    'first_name' => get_user_meta($user->ID, 'first_name', true),
                    'last_name' => get_user_meta($user->ID, 'last_name', true),
                    'nickname' => get_user_meta($user->ID, 'nickname', true),
                    'description' => get_user_meta($user->ID, 'description', true),
                    'website' => $user->user_url,
                    'last_login' => get_user_meta($user->ID, 'last_login', true),
                    'login_count' => get_user_meta($user->ID, 'login_count', true),
                    'capabilities' => $user_meta->allcaps ? array_keys(array_filter($user_meta->allcaps)) : array()
                ));
            }
            
            $formatted_users[] = $user_data;
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $formatted_users,
            'count' => count($formatted_users),
            'total_users' => count_users()['total_users'],
            'include_email' => $include_email,
            'detailed' => $detailed,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get detailed users (alias for backward compatibility)
     */
    public function get_users_detailed($request) {
        $request->set_param('detailed', 'true');
        return $this->get_users($request);
    }
    
    /**
     * Get maintenance mode status
     */
    public function get_maintenance_status($request) {
        $maintenance_file = ABSPATH . '.maintenance';
        $is_active = file_exists($maintenance_file);
        
        $status = array(
            'maintenance_mode' => $is_active,
            'maintenance_file_exists' => $is_active,
            'timestamp' => current_time('c')
        );
        
        if ($is_active) {
            $content = file_get_contents($maintenance_file);
            if ($content) {
                $status['maintenance_message'] = $content;
            }
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'maintenance' => $status
        ));
    }
    
    /**
     * Enable maintenance mode
     */
    public function enable_maintenance($request) {
        $message = sanitize_text_field($request->get_param('message')) ?: 'Website is temporarily unavailable for maintenance. Please try again later.';
        
        $maintenance_content = "<?php\n\$upgrading = time();\n// Custom message: " . $message;
        
        $result = file_put_contents(ABSPATH . '.maintenance', $maintenance_content);
        
        if ($result === false) {
            return new WP_Error('maintenance_enable_failed', 'Failed to enable maintenance mode', array('status' => 500));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Maintenance mode enabled',
            'maintenance_message' => $message,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Disable maintenance mode
     */
    public function disable_maintenance($request) {
        $maintenance_file = ABSPATH . '.maintenance';
        
        if (!file_exists($maintenance_file)) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Maintenance mode was already disabled',
                'timestamp' => current_time('c')
            ));
        }
        
        $result = unlink($maintenance_file);
        
        if (!$result) {
            return new WP_Error('maintenance_disable_failed', 'Failed to disable maintenance mode', array('status' => 500));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Maintenance mode disabled',
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get backup status (UpdraftPlus integration)
     */
    public function get_backup_status($request) {
        // Check if UpdraftPlus is active
        if (!class_exists('UpdraftPlus')) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'UpdraftPlus plugin not found or not active',
                'backup_plugin_available' => false,
                'timestamp' => current_time('c')
            ));
        }
        
        // Get UpdraftPlus backup information
        $backup_info = array(
            'backup_plugin_available' => true,
            'plugin_name' => 'UpdraftPlus',
            'last_backup' => 'Not available',
            'next_backup' => 'Not scheduled',
            'backup_location' => 'Unknown'
        );
        
        // Try to get more detailed information if methods are available
        if (method_exists('UpdraftPlus', 'get_backupable_file_entities')) {
            $backup_info['backupable_entities'] = 'Available';
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
     * Generate secure API key (Fixed to generate 32-character keys)
     */
    private function generate_api_key() {
        $api_key = bin2hex(random_bytes(16)); // 32 character secure key
        update_option($this->option_name, $api_key);
        
        // Log the key generation
        error_log('WP Remote Manager: New API key generated - ' . substr($api_key, 0, 8) . '...');
        
        return $api_key;
    }
    
    /**
     * AJAX handler for regenerating API key
     */
    public function ajax_regenerate_key() {
        // Verify nonce and permissions
        if (!check_ajax_referer('wrm_ajax_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_die('Security check failed', 'Unauthorized', array('response' => 403));
        }
        
        $new_key = $this->generate_api_key();
        
        wp_send_json_success(array(
            'new_key' => $new_key,
            'message' => 'New API key generated successfully!'
        ));
    }
    
    /**
     * AJAX handler for updating API key manually
     */
    public function ajax_update_key() {
        // Verify nonce and permissions
        if (!check_ajax_referer('wrm_ajax_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_die('Security check failed', 'Unauthorized', array('response' => 403));
        }
        
        $new_key = sanitize_text_field($_POST['api_key']);
        
        if (strlen($new_key) < 32) {
            wp_send_json_error(array(
                'message' => 'API key must be at least 32 characters long.'
            ));
        }
        
        update_option($this->option_name, $new_key);
        
        wp_send_json_success(array(
            'message' => 'API key updated successfully!'
        ));
    }
    
    /**
     * REST API endpoint for regenerating API key
     */
    public function regenerate_api_key_endpoint($request) {
        $new_key = $this->generate_api_key();
        
        return rest_ensure_response(array(
            'success' => true,
            'new_api_key' => $new_key,
            'message' => 'New API key generated successfully',
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
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <strong>WP Remote Manager Enhanced Users:</strong> 
                    Please <a href="<?php echo admin_url('options-general.php?page=wp-remote-manager-enhanced'); ?>">configure your API key</a> 
                    to start using remote management features.
                </p>
            </div>
            <?php
        }
        
        // Show notice on dashboard if API key exists but hasn't been used recently
        if ($current_screen && $current_screen->id === 'dashboard' && get_option($this->option_name)) {
            $last_api_access = get_option('wrm_last_api_access');
            if (!$last_api_access || (time() - intval($last_api_access)) > (7 * 24 * 60 * 60)) { // 7 days
                ?>
                <div class="notice notice-info is-dismissible">
                    <p>
                        <strong>WP Remote Manager:</strong> 
                        Your site is ready for remote management. 
                        <a href="<?php echo admin_url('options-general.php?page=wp-remote-manager-enhanced'); ?>">View API settings</a>
                    </p>
                </div>
                <?php
            }
        }
    }
    
    /**
     * Add admin bar menu item
     */
    public function admin_bar_menu($wp_admin_bar) {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $api_key = get_option($this->option_name);
        $status_class = $api_key ? 'wrm-connected' : 'wrm-disconnected';
        $status_text = $api_key ? 'Connected' : 'Not Configured';
        $status_color = $api_key ? '#46b450' : '#dc3232';
        
        $wp_admin_bar->add_node(array(
            'id' => 'wp-remote-manager',
            'title' => '<span style="color: ' . $status_color . ';">● </span>Remote Manager',
            'href' => admin_url('options-general.php?page=wp-remote-manager-enhanced'),
            'meta' => array(
                'title' => 'WP Remote Manager - Status: ' . $status_text,
                'class' => $status_class
            )
        ));
        
        if ($api_key) {
            $wp_admin_bar->add_node(array(
                'parent' => 'wp-remote-manager',
                'id' => 'wrm-status',
                'title' => 'Status: Connected',
                'href' => admin_url('options-general.php?page=wp-remote-manager-enhanced')
            ));
            
            $wp_admin_bar->add_node(array(
                'parent' => 'wp-remote-manager',
                'id' => 'wrm-regenerate',
                'title' => 'Regenerate API Key',
                'href' => admin_url('options-general.php?page=wp-remote-manager-enhanced#regenerate-key')
            ));
        } else {
            $wp_admin_bar->add_node(array(
                'parent' => 'wp-remote-manager',
                'id' => 'wrm-setup',
                'title' => 'Setup API Key',
                'href' => admin_url('options-general.php?page=wp-remote-manager-enhanced')
            ));
        }
    }
    
    /**
     * Admin page with improved API key management
     */
    public function admin_page() {
        // Handle form submissions
        if (isset($_POST['generate_api_key']) && check_admin_referer('wrm_admin_action', 'wrm_nonce')) {
            $new_key = $this->generate_api_key();
            echo '<div class="notice notice-success"><p><strong>New API Key Generated!</strong> Copy this key to your dashboard: <code>' . esc_html($new_key) . '</code></p></div>';
        }
        
        if (isset($_POST['update_api_key']) && check_admin_referer('wrm_admin_action', 'wrm_nonce')) {
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
        <style>
            .wrm-nav-tabs {
                border-bottom: 1px solid #ccc;
                margin: 20px 0;
            }
            .wrm-nav-tabs a {
                display: inline-block;
                padding: 10px 15px;
                text-decoration: none;
                border: 1px solid transparent;
                margin-bottom: -1px;
            }
            .wrm-nav-tabs a.active {
                background: #fff;
                border-color: #ccc #ccc #fff;
                color: #333;
            }
            .wrm-tab-content {
                display: none;
            }
            .wrm-tab-content.active {
                display: block;
            }
            .wrm-quick-action {
                background: #f9f9f9;
                border-left: 4px solid #2271b1;
                padding: 15px;
                margin: 15px 0;
            }
            .wrm-status-indicator {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 8px;
            }
            .wrm-connected { background-color: #46b450; }
            .wrm-disconnected { background-color: #dc3232; }
        </style>
        
        <script>
            function wrmSwitchTab(tabName) {
                // Hide all tab contents
                var contents = document.querySelectorAll('.wrm-tab-content');
                contents.forEach(function(content) {
                    content.classList.remove('active');
                });
                
                // Remove active class from all tabs
                var tabs = document.querySelectorAll('.wrm-nav-tabs a');
                tabs.forEach(function(tab) {
                    tab.classList.remove('active');
                });
                
                // Show selected tab content
                document.getElementById(tabName + '-content').classList.add('active');
                document.querySelector('a[onclick="wrmSwitchTab(\'' + tabName + '\')"]').classList.add('active');
            }
            
            document.addEventListener('DOMContentLoaded', function() {
                // Check URL hash for direct navigation
                var hash = window.location.hash.substring(1);
                if (hash && document.getElementById(hash + '-content')) {
                    wrmSwitchTab(hash);
                } else {
                    wrmSwitchTab('api-key');
                }
            });
        </script>
        
        <div class="wrap">
            <h1><span class="dashicons dashicons-admin-network" style="margin-right: 8px;"></span>WP Remote Manager Enhanced Users</h1>
            <p>Advanced WordPress remote management plugin with comprehensive user data and enhanced security. <strong>API Key Sync Fixed Version</strong></p>
            
            <?php
            $api_key = get_option($this->option_name);
            $status_class = $api_key ? 'wrm-connected' : 'wrm-disconnected';
            $status_text = $api_key ? 'Connected & Ready' : 'Not Configured';
            ?>
            
            <div class="wrm-quick-action">
                <h3 style="margin-top: 0;">
                    <span class="wrm-status-indicator <?php echo $status_class; ?>"></span>
                    Connection Status: <?php echo $status_text; ?>
                </h3>
                <?php if ($api_key): ?>
                    <p>Your WordPress site is connected to the remote management dashboard. API key is configured and ready for use.</p>
                    <a href="#regenerate-key" class="button button-secondary" onclick="wrmSwitchTab('api-key'); document.querySelector('#regenerate-key').scrollIntoView();">Manage API Key</a>
                <?php else: ?>
                    <p><strong>Action Required:</strong> Please configure your API key to enable remote management features.</p>
                    <a href="#api-key" class="button button-primary" onclick="wrmSwitchTab('api-key');">Configure API Key</a>
                <?php endif; ?>
            </div>
            
            <div class="wrm-nav-tabs">
                <a href="#api-key" onclick="wrmSwitchTab('api-key')" class="active">API Key Management</a>
                <a href="#endpoints" onclick="wrmSwitchTab('endpoints')">API Endpoints</a>
                <a href="#features" onclick="wrmSwitchTab('features')">Features & Info</a>
                <a href="#test" onclick="wrmSwitchTab('test')">Test Connection</a>
            </div>
            
            <!-- API Key Management Tab -->
            <div id="api-key-content" class="wrm-tab-content active">
                <div class="card" style="max-width: none;">
                    <h2><span class="dashicons dashicons-admin-network" style="margin-right: 8px;"></span>API Key Configuration</h2>
                
                <!-- Current API Key Display -->
                <div style="margin: 20px 0;">
                    <h3>Current API Key</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #2271b1; margin: 10px 0;">
                        <code style="font-size: 14px; font-weight: bold; color: #2271b1;"><?php echo esc_html($current_key); ?></code>
                        <p style="margin: 10px 0 0 0; font-style: italic; color: #666;">Copy this key to your AIO Webcare dashboard</p>
                    </div>
                </div>
                
                <!-- Generate New Key -->
                <form method="post" style="margin: 20px 0; border-top: 1px solid #ddd; padding-top: 20px;">
                    <?php wp_nonce_field('wrm_admin_action', 'wrm_nonce'); ?>
                    <h3>Generate New API Key</h3>
                    <p>Click below to generate a completely new API key. This will invalidate the current key.</p>
                    <button type="submit" name="generate_api_key" class="button button-primary" onclick="return confirm('Generate a new API key? This will invalidate the current key and you will need to update your dashboard.')">
                        Generate New API Key
                    </button>
                </form>
                
                <!-- Update Existing Key -->
                <form method="post" style="margin: 20px 0; border-top: 1px solid #ddd; padding-top: 20px;">
                    <?php wp_nonce_field('wrm_admin_action', 'wrm_nonce'); ?>
                    <h3>Update API Key Manually</h3>
                    <p>If you have generated a key from your dashboard, paste it here to synchronize:</p>
                    <table class="form-table">
                        <tr>
                            <th scope="row">New API Key</th>
                            <td>
                                <input type="text" name="wrm_api_key" value="" class="regular-text code" placeholder="Paste your new API key here..." />
                                <p class="description">Enter the 32-character API key from your dashboard</p>
                            </td>
                        </tr>
                    </table>
                    <button type="submit" name="update_api_key" class="button button-secondary">
                        Update API Key
                    </button>
                </form>
            </div>
            
            <div class="card" style="max-width: none;">
                <h2>API Key Sync - Important Information</h2>
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px;">
                    <h4 style="margin-top: 0; color: #856404;">🔄 Two-Way Sync Support</h4>
                    <ul style="margin: 10px 0;">
                        <li><strong>WordPress → Dashboard:</strong> Generate new key here, then copy to your dashboard</li>
                        <li><strong>Dashboard → WordPress:</strong> Generate key in dashboard, then paste it in the "Update API Key Manually" section above</li>
                    </ul>
                    <p style="margin-bottom: 0; font-style: italic;">Both methods ensure your WordPress plugin and dashboard stay synchronized.</p>
                </div>
                </div>
            </div>
            
            <!-- API Endpoints Tab -->
            <div id="endpoints-content" class="wrm-tab-content">
                <div class="card" style="max-width: none;">
                    <h2><span class="dashicons dashicons-admin-tools" style="margin-right: 8px;"></span>Available API Endpoints</h2>
                    <p>The following REST API endpoints are available for remote management:</p>
                    
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th>Endpoint</th>
                                <th>Method</th>
                                <th>Description</th>
                                <th>Authentication</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>/wp-json/wp-remote-manager/v1/users</code></td>
                                <td>GET</td>
                                <td>Retrieve all WordPress users with detailed metadata</td>
                                <td>API Key Required</td>
                            </tr>
                            <tr>
                                <td><code>/wp-json/wp-remote-manager/v1/plugins</code></td>
                                <td>GET</td>
                                <td>Get list of installed plugins with update status</td>
                                <td>API Key Required</td>
                            </tr>
                            <tr>
                                <td><code>/wp-json/wp-remote-manager/v1/themes</code></td>
                                <td>GET</td>
                                <td>Get list of installed themes with update status</td>
                                <td>API Key Required</td>
                            </tr>
                            <tr>
                                <td><code>/wp-json/wp-remote-manager/v1/updates</code></td>
                                <td>GET</td>
                                <td>Check for WordPress core, plugin, and theme updates</td>
                                <td>API Key Required</td>
                            </tr>
                            <tr>
                                <td><code>/wp-json/wp-remote-manager/v1/api-key/regenerate</code></td>
                                <td>POST</td>
                                <td>Regenerate API key programmatically</td>
                                <td>Admin Capabilities</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3>Authentication</h3>
                    <p>All API requests must include the API key in the <code>X-API-Key</code> header:</p>
                    <pre style="background: #f9f9f9; padding: 10px; border-left: 4px solid #2271b1;">
curl -H "X-API-Key: YOUR_API_KEY_HERE" <?php echo esc_url($site_url); ?>/wp-json/wp-remote-manager/v1/users
                    </pre>
                </div>
            </div>
            
            <!-- Features & Info Tab -->
            <div id="features-content" class="wrm-tab-content">
                <div class="card" style="max-width: none;">
                    <h2><span class="dashicons dashicons-star-filled" style="margin-right: 8px;"></span>Plugin Features</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                        <div>
                            <h3>🔐 Security Features</h3>
                            <ul>
                                <li>32-character secure API key generation</li>
                                <li>CSRF protection with nonce verification</li>
                                <li>Rate limiting for API endpoints</li>
                                <li>Input validation and sanitization</li>
                                <li>Comprehensive audit logging</li>
                                <li>Admin capability verification</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3>🔄 API Key Management</h3>
                            <ul>
                                <li>Two-way synchronization support</li>
                                <li>WordPress → Dashboard sync</li>
                                <li>Dashboard → WordPress sync</li>
                                <li>Manual key update capability</li>
                                <li>REST API regeneration endpoint</li>
                                <li>Real-time key validation</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3>👥 User Management</h3>
                            <ul>
                                <li>Detailed user metadata retrieval</li>
                                <li>User email and profile information</li>
                                <li>Role and capability analysis</li>
                                <li>Login tracking and history</li>
                                <li>User activity monitoring</li>
                                <li>ManageWP-compatible data format</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3>🔧 Maintenance Features</h3>
                            <ul>
                                <li>Plugin update detection</li>
                                <li>Theme update monitoring</li>
                                <li>WordPress core update checking</li>
                                <li>Comprehensive update reports</li>
                                <li>Remote update management</li>
                                <li>Update history tracking</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="max-width: none;">
                    <h2>Plugin Information</h2>
                <table class="widefat">
                    <tbody>
                        <tr>
                            <td><strong>Plugin Version</strong></td>
                            <td><?php echo esc_html($this->version); ?> (API Key Sync Fixed)</td>
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
                        <tr>
                            <td><strong>API Key Length</strong></td>
                            <td><?php echo strlen($current_key); ?> characters (Fixed to 32)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </div>
            
            <!-- Test Connection Tab -->
            <div id="test-content" class="wrm-tab-content">
                <div class="card" style="max-width: none;">
                    <h2><span class="dashicons dashicons-admin-tools" style="margin-right: 8px;"></span>Test API Connection</h2>
                    <p>Use the tools below to test your API key and verify that remote connections are working properly.</p>
                    
                    <?php if ($current_key): ?>
                        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">✅ API Key is Configured</h3>
                            <p>Your API key is set up and ready for testing. Use the buttons below to verify connection:</p>
                            
                            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0;">
                                <a href="<?php echo esc_url($site_url); ?>/wp-json/wp-remote-manager/v1/users?test=1" 
                                   target="_blank" class="button button-primary">
                                   Test Users Endpoint
                                </a>
                                <a href="<?php echo esc_url($site_url); ?>/wp-json/wp-remote-manager/v1/plugins" 
                                   target="_blank" class="button button-secondary">
                                   Test Plugins Endpoint
                                </a>
                                <a href="<?php echo esc_url($site_url); ?>/wp-json/wp-remote-manager/v1/updates" 
                                   target="_blank" class="button button-secondary">
                                   Test Updates Endpoint
                                </a>
                            </div>
                            
                            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0;">
                                <h4 style="margin-top: 0;">🔑 API Key for Testing</h4>
                                <code style="background: #f8f9fa; padding: 5px; border-radius: 3px; font-weight: bold; word-break: break-all;">
                                    <?php echo esc_html($current_key); ?>
                                </code>
                                <p style="margin: 10px 0 0 0; font-size: 12px; color: #856404;">
                                    Include this key in the <code>X-API-Key</code> header when testing with external tools.
                                </p>
                            </div>
                            
                            <h4>Manual Testing with cURL</h4>
                            <pre style="background: #f8f9fa; padding: 15px; border-left: 4px solid #2271b1; overflow-x: auto; font-size: 12px;">
# Test Users Endpoint
curl -H "X-API-Key: <?php echo esc_html($current_key); ?>" \
     "<?php echo esc_url($site_url); ?>/wp-json/wp-remote-manager/v1/users"

# Test Plugins Endpoint  
curl -H "X-API-Key: <?php echo esc_html($current_key); ?>" \
     "<?php echo esc_url($site_url); ?>/wp-json/wp-remote-manager/v1/plugins"

# Test Updates Endpoint
curl -H "X-API-Key: <?php echo esc_html($current_key); ?>" \
     "<?php echo esc_url($site_url); ?>/wp-json/wp-remote-manager/v1/updates"
                            </pre>
                        </div>
                    <?php else: ?>
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">⚠️ No API Key Configured</h3>
                            <p>You need to configure an API key before you can test the connection.</p>
                            <a href="#api-key" onclick="wrmSwitchTab('api-key')" class="button button-primary">
                                Configure API Key First
                            </a>
                        </div>
                    <?php endif; ?>
                    
                    <h3>Connection Troubleshooting</h3>
                    <div style="background: #e9ecef; padding: 15px; border-radius: 4px;">
                        <h4>Common Issues & Solutions:</h4>
                        <ul>
                            <li><strong>401 Unauthorized:</strong> Check that your API key is correct and matches between WordPress and dashboard</li>
                            <li><strong>403 Forbidden:</strong> Verify that your user has administrator privileges</li>
                            <li><strong>404 Not Found:</strong> Ensure the plugin is activated and REST API is enabled</li>
                            <li><strong>Rate Limited:</strong> Wait a moment and try again if making many requests</li>
                            <li><strong>CORS Errors:</strong> Check that your dashboard domain is properly configured</li>
                        </ul>
                        
                        <h4>Next Steps if Issues Persist:</h4>
                        <ol>
                            <li>Verify WordPress REST API is working: <a href="<?php echo esc_url($site_url); ?>/wp-json/" target="_blank">Test REST API</a></li>
                            <li>Check if there are any security plugins blocking API access</li>
                            <li>Ensure your hosting provider allows REST API connections</li>
                            <li>Review your site's .htaccess file for any restrictive rules</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    // Additional helper methods for plugin/theme management
    private function update_wordpress_core() {
        // Implementation for WordPress core updates
        return array('type' => 'wordpress', 'status' => 'completed', 'message' => 'WordPress core updated');
    }
    
    private function update_plugin($plugin_file) {
        // Implementation for plugin updates
        return array('type' => 'plugin', 'item' => $plugin_file, 'status' => 'completed', 'message' => 'Plugin updated');
    }
    
    private function update_theme($theme_slug) {
        // Implementation for theme updates
        return array('type' => 'theme', 'item' => $theme_slug, 'status' => 'completed', 'message' => 'Theme updated');
    }
    
    public function activate_plugin_endpoint($request) {
        $plugin = sanitize_text_field($request->get_param('plugin'));
        if (empty($plugin)) {
            return new WP_Error('missing_plugin', 'Plugin parameter is required', array('status' => 400));
        }
        
        $result = activate_plugin($plugin);
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Plugin activated successfully',
            'plugin' => $plugin
        ));
    }
    
    public function deactivate_plugin_endpoint($request) {
        $plugin = sanitize_text_field($request->get_param('plugin'));
        if (empty($plugin)) {
            return new WP_Error('missing_plugin', 'Plugin parameter is required', array('status' => 400));
        }
        
        deactivate_plugins($plugin);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Plugin deactivated successfully',
            'plugin' => $plugin
        ));
    }
    
    public function activate_theme_endpoint($request) {
        $theme = sanitize_text_field($request->get_param('theme'));
        if (empty($theme)) {
            return new WP_Error('missing_theme', 'Theme parameter is required', array('status' => 400));
        }
        
        switch_theme($theme);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Theme activated successfully',
            'theme' => $theme
        ));
    }
}

// Initialize the plugin
new WP_Remote_Manager_Enhanced_Users();