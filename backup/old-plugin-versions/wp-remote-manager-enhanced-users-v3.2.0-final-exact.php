<?php
/**
 * Plugin Name: WP Remote Manager - Enhanced Users v3.2.0 Final
 * Description: Advanced WordPress Remote Manager plugin with comprehensive user management, security, and remote maintenance capabilities
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
     * API Key verification - CRITICAL: Uses secure hash_equals() comparison
     */
    public function verify_api_key($request) {
        $api_key = $request->get_header('X-WRM-API-Key') ?: $request->get_header('X-WRMS-API-Key');
        
        if (empty($api_key)) {
            return new WP_Error('missing_api_key', 'API key is required', array('status' => 401));
        }
        
        $stored_key = get_option($this->option_name);
        
        // SECURE COMPARISON - This is what makes the difference!
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
        $api_key_valid = $this->verify_api_key($request);
        if (is_wp_error($api_key_valid)) {
            return $api_key_valid;
        }
        
        if (!current_user_can('administrator') && !current_user_can('manage_options')) {
            return new WP_Error('insufficient_permissions', 'Administrator privileges required', array('status' => 403));
        }
        
        return true;
    }
    
    /**
     * Get site status and information
     */
    public function get_status($request) {
        global $wp_version;
        
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $current_theme = wp_get_theme();
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        $plugin_count = array(
            'total' => count($all_plugins),
            'active' => count($active_plugins),
            'inactive' => count($all_plugins) - count($active_plugins)
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'site_info' => array(
                'site_url' => home_url(),
                'admin_url' => admin_url(),
                'admin_email' => get_option('admin_email'),
                'wordpress_version' => $wp_version,
                'php_version' => phpversion(),
                'mysql_version' => $this->get_mysql_version(),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
                'timezone' => wp_timezone_string(),
                'multisite' => is_multisite(),
                'ssl_enabled' => is_ssl(),
                'debug_enabled' => WP_DEBUG
            ),
            'theme_info' => array(
                'name' => $current_theme->get('Name'),
                'version' => $current_theme->get('Version'),
                'author' => $current_theme->get('Author'),
                'stylesheet' => get_stylesheet(),
                'template' => get_template()
            ),
            'plugin_count' => $plugin_count,
            'maintenance_mode' => file_exists(ABSPATH . '.maintenance'),
            'plugin_version' => $this->version,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get health check
     */
    public function get_health($request) {
        return rest_ensure_response(array(
            'status' => 'healthy',
            'plugin' => 'WP Remote Manager Enhanced Users',
            'version' => $this->version,
            'wordpress_version' => get_bloginfo('version'),
            'timestamp' => current_time('timestamp')
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
     * Generate secure API key
     */
    private function generate_api_key() {
        $api_key = wp_generate_password(64, true, true);
        update_option($this->option_name, $api_key);
        return $api_key;
    }
    
    /**
     * Get available updates with enhanced core update detection
     */
    public function get_updates($request) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        if (!function_exists('get_core_updates')) {
            require_once ABSPATH . 'wp-admin/includes/update.php';
        }
        
        // Force update checks
        wp_clean_update_cache();
        wp_update_plugins();
        wp_update_themes();
        wp_version_check();
        
        $updates = array(
            'wordpress' => $this->get_wordpress_updates(),
            'plugins' => $this->get_plugin_updates(),
            'themes' => $this->get_theme_updates()
        );
        
        $total_count = 0;
        $total_count += $updates['wordpress']['update_available'] ? 1 : 0;
        $total_count += count($updates['plugins']);
        $total_count += count($updates['themes']);
        
        return rest_ensure_response(array(
            'success' => true,
            'updates' => $updates,
            'count' => array(
                'total' => $total_count,
                'core' => $updates['wordpress']['update_available'] ? 1 : 0,
                'plugins' => count($updates['plugins']),
                'themes' => count($updates['themes'])
            ),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get WordPress core updates
     */
    private function get_wordpress_updates() {
        $update_info = array(
            'update_available' => false,
            'current_version' => get_bloginfo('version'),
            'new_version' => null,
            'package' => null
        );
        
        $core_updates = get_core_updates();
        if (!empty($core_updates) && !is_wp_error($core_updates)) {
            foreach ($core_updates as $update) {
                if (isset($update->response) && $update->response === 'upgrade') {
                    $update_info['update_available'] = true;
                    $update_info['new_version'] = $update->version;
                    $update_info['package'] = isset($update->download) ? $update->download : '';
                    break;
                }
            }
        }
        
        return $update_info;
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
                $theme_info = wp_get_theme($theme_slug);
                
                $updates[] = array(
                    'type' => 'theme',
                    'name' => $theme_info->get('Name'),
                    'slug' => $theme_slug,
                    'current_version' => $theme_info->get('Version'),
                    'new_version' => $theme_data['new_version'],
                    'package_url' => isset($theme_data['package']) ? $theme_data['package'] : ''
                );
            }
        }
        
        return $updates;
    }
    
    /**
     * Get plugin list
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
                'description' => $plugin_data['Description'],
                'version' => $plugin_data['Version'],
                'author' => $plugin_data['Author'],
                'plugin_file' => $plugin_path,
                'active' => in_array($plugin_path, $active_plugins),
                'network' => $plugin_data['Network'] === 'true'
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'plugins' => $plugins,
            'count' => count($plugins)
        ));
    }
    
    /**
     * Get theme list
     */
    public function get_themes($request) {
        $all_themes = wp_get_themes();
        $current_theme = wp_get_theme();
        $themes = array();
        
        foreach ($all_themes as $theme_slug => $theme_data) {
            $themes[] = array(
                'name' => $theme_data->get('Name'),
                'description' => $theme_data->get('Description'),
                'version' => $theme_data->get('Version'),
                'author' => $theme_data->get('Author'),
                'slug' => $theme_slug,
                'active' => $theme_slug === $current_theme->get_stylesheet(),
                'screenshot' => $theme_data->get_screenshot()
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'themes' => $themes,
            'count' => count($themes)
        ));
    }
    
    /**
     * Get users with enhanced metadata
     */
    public function get_users($request) {
        $users = get_users(array(
            'fields' => array('ID', 'user_login', 'user_email', 'display_name', 'user_registered')
        ));
        
        $user_data = array();
        foreach ($users as $user) {
            $user_meta = get_userdata($user->ID);
            $user_data[] = array(
                'ID' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'registered' => $user->user_registered,
                'role' => $user_meta->roles[0] ?? 'subscriber',
                'last_login' => get_user_meta($user->ID, 'last_login', true)
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $user_data,
            'count' => count($user_data)
        ));
    }
    
    /**
     * Get detailed users information
     */
    public function get_users_detailed($request) {
        $users = get_users();
        $detailed_users = array();
        
        foreach ($users as $user) {
            $user_meta = get_userdata($user->ID);
            $detailed_users[] = array(
                'ID' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'registered' => $user->user_registered,
                'role' => $user_meta->roles[0] ?? 'subscriber',
                'capabilities' => $user_meta->allcaps,
                'last_login' => get_user_meta($user->ID, 'last_login', true),
                'posts_count' => count_user_posts($user->ID),
                'avatar_url' => get_avatar_url($user->ID)
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'users' => $detailed_users,
            'count' => count($detailed_users)
        ));
    }
    
    /**
     * Track user login
     */
    public function track_user_login($user_login, $user) {
        update_user_meta($user->ID, 'last_login', current_time('mysql'));
    }
    
    /**
     * Get maintenance mode status
     */
    public function get_maintenance_status($request) {
        return rest_ensure_response(array(
            'enabled' => file_exists(ABSPATH . '.maintenance'),
            'message' => 'Maintenance mode endpoint not available',
            'allowed_ips' => array()
        ));
    }
    
    /**
     * Get backup status
     */
    public function get_backup_status($request) {
        // Check if UpdraftPlus is active
        if (is_plugin_active('updraftplus/updraftplus.php')) {
            // Get UpdraftPlus backup status if available
            $backup_status = array(
                'service' => 'UpdraftPlus',
                'last_backup' => 'Available via UpdraftPlus'
            );
        } else {
            $backup_status = array(
                'service' => 'None',
                'last_backup' => 'No backup plugin detected'
            );
        }
        
        return rest_ensure_response($backup_status);
    }
    
    /**
     * Add CORS headers
     */
    public function add_cors_headers() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: X-WRM-API-Key, X-WRMS-API-Key, Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
    }
    
    /**
     * Admin menu
     */
    public function admin_menu() {
        add_options_page(
            'Remote Manager Enhanced',
            'Remote Manager Enhanced',
            'manage_options',
            'wrm-enhanced',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        if (isset($_POST['regenerate_key'])) {
            $this->generate_api_key();
            echo '<div class="notice notice-success"><p>API key regenerated successfully!</p></div>';
        }
        
        $api_key = get_option($this->option_name);
        
        ?>
        <div class="wrap">
            <h1>WP Remote Manager Enhanced Users</h1>
            <h2>API Configuration</h2>
            
            <table class="form-table">
                <tr>
                    <th scope="row">API Key</th>
                    <td>
                        <input type="text" value="<?php echo esc_attr($api_key); ?>" readonly class="regular-text" />
                        <form method="post" style="display: inline;">
                            <input type="submit" name="regenerate_key" value="Regenerate Key" class="button button-secondary" />
                        </form>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Plugin Version</th>
                    <td><?php echo $this->version; ?></td>
                </tr>
                <tr>
                    <th scope="row">API Endpoint</th>
                    <td><code><?php echo home_url('/wp-json/' . $this->api_namespace . '/'); ?></code></td>
                </tr>
            </table>
            
            <h3>Available Endpoints</h3>
            <ul>
                <li><code>/status</code> - Get site status and information</li>
                <li><code>/health</code> - Health check</li>
                <li><code>/updates</code> - Get available updates</li>
                <li><code>/plugins</code> - Get plugin list</li>
                <li><code>/themes</code> - Get theme list</li>
                <li><code>/users</code> - Get user list</li>
                <li><code>/users/detailed</code> - Get detailed user information</li>
                <li><code>/maintenance/status</code> - Get maintenance mode status</li>
                <li><code>/backup/status</code> - Get backup status</li>
            </ul>
        </div>
        <?php
    }
    
    /**
     * Plugin activation
     */
    public function activate_plugin() {
        if (!get_option($this->option_name)) {
            $this->generate_api_key();
        }
    }
}

// Initialize the plugin
new WP_Remote_Manager_Enhanced_Users();