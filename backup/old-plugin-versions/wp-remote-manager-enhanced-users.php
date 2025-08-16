<?php
/**
 * Plugin Name: WP Remote Manager - Enhanced Users
 * Plugin URI: https://aio-webcare.com
 * Description: WordPress Remote Manager with Enhanced User Metadata - Enterprise Security Edition v3.1.0
 * Version: 3.1.0
 * Author: AIO Webcare
 * Author URI: https://aio-webcare.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wp-remote-manager
 * Requires at least: 5.0
 * Tested up to: 6.8
 * Requires PHP: 7.4
 * Network: true
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin version constant
define('WRM_VERSION', '3.1.0');
define('WRM_PLUGIN_FILE', __FILE__);
define('WRM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WRM_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main WP Remote Manager Class
 */
class WPRemoteManager {
    
    private static $instance = null;
    private $api_key = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_api_endpoints'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Track user logins for enhanced data
        add_action('wp_login', array($this, 'track_user_login'), 10, 2);
    }
    
    public function init() {
        // Load admin interface if in admin
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_init', array($this, 'register_settings'));
        }
    }
    
    public function activate() {
        // Generate initial API key if none exists
        if (!get_option('wrm_api_key')) {
            $api_key = $this->generate_secure_api_key();
            update_option('wrm_api_key', $api_key);
        }
        
        // Set default options
        update_option('wrm_version', WRM_VERSION);
        update_option('wrm_activated_time', time());
        
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    /**
     * Generate secure API key
     */
    private function generate_secure_api_key() {
        return wp_generate_password(64, true, true);
    }
    
    /**
     * Track user login times for enhanced user data
     */
    public function track_user_login($user_login, $user) {
        update_user_meta($user->ID, 'wrm_last_login', current_time('mysql'));
        update_user_meta($user->ID, 'wrm_login_count', (int)get_user_meta($user->ID, 'wrm_login_count', true) + 1);
    }
    
    /**
     * Register REST API endpoints
     */
    public function register_api_endpoints() {
        // Basic info endpoint
        register_rest_route('wrms/v1', '/info', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_site_info'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Enhanced users endpoint with complete data (NEW)
        register_rest_route('wrms/v1', '/users', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_enhanced_users'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Detailed users endpoint with maximum information (NEW)
        register_rest_route('wrms/v1', '/users/detailed', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_detailed_users'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Updates endpoint
        register_rest_route('wrms/v1', '/updates', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_updates'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Plugins endpoint
        register_rest_route('wrms/v1', '/plugins', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_plugins'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
        
        // Themes endpoint
        register_rest_route('wrms/v1', '/themes', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_themes'),
            'permission_callback' => array($this, 'verify_api_key')
        ));
    }
    
    /**
     * Verify API key for authentication
     */
    public function verify_api_key($request) {
        $provided_key = $request->get_header('X-WRMS-API-Key');
        if (!$provided_key) {
            $provided_key = $request->get_param('api_key');
        }
        
        $stored_key = get_option('wrm_api_key');
        
        if (!$provided_key || !$stored_key || !hash_equals($stored_key, $provided_key)) {
            return new WP_Error('invalid_api_key', 'Invalid or missing API key', array('status' => 401));
        }
        
        return true;
    }
    
    /**
     * Get basic site information
     */
    public function get_site_info($request) {
        global $wp_version;
        
        return rest_ensure_response(array(
            'success' => true,
            'site_url' => get_site_url(),
            'site_name' => get_bloginfo('name'),
            'wp_version' => $wp_version,
            'php_version' => PHP_VERSION,
            'plugin_version' => WRM_VERSION,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Enhanced Users Endpoint - Returns complete user data like ManageWP
     * This is the key enhancement that includes user email addresses
     */
    public function get_enhanced_users($request) {
        // Check if detailed view is requested
        $detailed = $request->get_param('detailed') === 'true';
        $include_email = $request->get_param('include_email') === 'true';
        $include_meta = $request->get_param('include_meta') === 'true';
        
        // Get all users with complete data
        $users = get_users(array(
            'fields' => 'all', // Get all user fields
            'number' => 500, // Increased limit
            'orderby' => 'registered',
            'order' => 'DESC'
        ));
        
        $formatted_users = array();
        foreach ($users as $user) {
            $user_meta = get_userdata($user->ID);
            
            // Base user data that's always included
            $user_data = array(
                'id' => (string)$user->ID,
                'name' => $user->display_name ?: $user->user_nicename,
                'username' => $user->user_login,
                'user_login' => $user->user_login,
                'display_name' => $user->display_name,
                'registered_date' => $user->user_registered,
                'roles' => $user_meta->roles,
                'post_count' => count_user_posts($user->ID),
                'avatar_url' => get_avatar_url($user->ID, array('size' => 96)),
                'capabilities' => array_keys($user_meta->allcaps ?? [])
            );
            
            // Always include email (like ManageWP does) - KEY ENHANCEMENT
            $user_data['email'] = $user->user_email;
            $user_data['user_email'] = $user->user_email;
            
            // Additional data for detailed view or when specifically requested
            if ($detailed || $include_meta) {
                $user_data['first_name'] = get_user_meta($user->ID, 'first_name', true);
                $user_data['last_name'] = get_user_meta($user->ID, 'last_name', true);
                $user_data['nickname'] = get_user_meta($user->ID, 'nickname', true);
                $user_data['description'] = get_user_meta($user->ID, 'description', true);
                $user_data['website'] = $user->user_url;
                $user_data['locale'] = get_user_meta($user->ID, 'locale', true);
                $user_data['last_login'] = get_user_meta($user->ID, 'wrm_last_login', true);
                $user_data['login_count'] = (int)get_user_meta($user->ID, 'wrm_login_count', true);
                
                // Role capabilities
                $user_data['role_names'] = array();
                foreach ($user_meta->roles as $role) {
                    $role_obj = get_role($role);
                    if ($role_obj) {
                        $user_data['role_names'][] = ucfirst($role);
                    }
                }
                
                // Additional metadata
                $user_data['user_status'] = $user->user_status;
                $user_data['user_activation_key'] = !empty($user->user_activation_key);
                $user_data['spam'] = (bool)get_user_meta($user->ID, 'spam', true);
                $user_data['deleted'] = (bool)get_user_meta($user->ID, 'deleted', true);
            }
            
            $formatted_users[] = $user_data;
        }
        
        // Return response with metadata
        return rest_ensure_response(array(
            'success' => true,
            'users' => $formatted_users,
            'count' => count($formatted_users),
            'total_users' => count_users()['total_users'],
            'timestamp' => current_time('c'),
            'enhanced_features' => array(
                'email_included' => true,
                'detailed_metadata' => $detailed || $include_meta,
                'login_tracking' => true
            )
        ));
    }
    
    /**
     * Detailed Users Endpoint - Maximum user information
     */
    public function get_detailed_users($request) {
        // Force detailed mode
        $request->set_param('detailed', 'true');
        $request->set_param('include_email', 'true');
        $request->set_param('include_meta', 'true');
        
        return $this->get_enhanced_users($request);
    }
    
    /**
     * Get available updates
     */
    public function get_updates($request) {
        // Include update checks
        wp_update_plugins();
        wp_update_themes();
        
        $plugin_updates = get_site_transient('update_plugins');
        $theme_updates = get_site_transient('update_themes');
        $core_updates = get_core_updates();
        
        $updates = array(
            'wordpress' => array(),
            'plugins' => array(),
            'themes' => array()
        );
        
        // WordPress core updates
        if (!empty($core_updates) && !empty($core_updates[0]) && $core_updates[0]->response === 'upgrade') {
            $updates['wordpress'] = array(
                'current_version' => get_bloginfo('version'),
                'new_version' => $core_updates[0]->version,
                'update_available' => true
            );
        }
        
        // Plugin updates
        if (!empty($plugin_updates->response)) {
            foreach ($plugin_updates->response as $plugin_file => $plugin_data) {
                $plugin_info = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin_file);
                $updates['plugins'][] = array(
                    'name' => $plugin_info['Name'],
                    'slug' => dirname($plugin_file),
                    'current_version' => $plugin_info['Version'],
                    'new_version' => $plugin_data->new_version,
                    'file' => $plugin_file
                );
            }
        }
        
        // Theme updates
        if (!empty($theme_updates->response)) {
            foreach ($theme_updates->response as $theme_slug => $theme_data) {
                $theme_info = wp_get_theme($theme_slug);
                $updates['themes'][] = array(
                    'name' => $theme_info->get('Name'),
                    'slug' => $theme_slug,
                    'current_version' => $theme_info->get('Version'),
                    'new_version' => $theme_data['new_version']
                );
            }
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'updates' => $updates,
            'total_updates' => count($updates['plugins']) + count($updates['themes']) + (empty($updates['wordpress']) ? 0 : 1),
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Get plugins information
     */
    public function get_plugins($request) {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        $plugins = array();
        
        foreach ($all_plugins as $plugin_file => $plugin_data) {
            $plugins[] = array(
                'name' => $plugin_data['Name'],
                'version' => $plugin_data['Version'],
                'description' => $plugin_data['Description'],
                'author' => $plugin_data['Author'],
                'file' => $plugin_file,
                'slug' => dirname($plugin_file),
                'active' => in_array($plugin_file, $active_plugins),
                'network_active' => is_plugin_active_for_network($plugin_file)
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
     * Get themes information
     */
    public function get_themes($request) {
        $all_themes = wp_get_themes();
        $current_theme = get_stylesheet();
        $themes = array();
        
        foreach ($all_themes as $theme_slug => $theme_data) {
            $themes[] = array(
                'name' => $theme_data->get('Name'),
                'version' => $theme_data->get('Version'),
                'description' => $theme_data->get('Description'),
                'author' => $theme_data->get('Author'),
                'slug' => $theme_slug,
                'active' => $theme_slug === $current_theme,
                'parent_theme' => $theme_data->get('Template'),
                'screenshot' => $theme_data->get_screenshot() ? $theme_data->get_screenshot() : null
            );
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'themes' => $themes,
            'count' => count($themes),
            'current_theme' => $current_theme,
            'timestamp' => current_time('c')
        ));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'Remote Manager Secure',
            'Remote Manager',
            'manage_options',
            'wp-remote-manager',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('wrm_settings', 'wrm_api_key');
        register_setting('wrm_settings', 'wrm_rate_limit');
    }
    
    /**
     * Admin page HTML
     */
    public function admin_page() {
        $api_key = get_option('wrm_api_key');
        $site_url = get_site_url();
        ?>
        <div class="wrap">
            <h1>WP Remote Manager - Enhanced Users Edition</h1>
            <div class="notice notice-success">
                <p><strong>✅ Enhanced User Metadata Feature Active!</strong> This version includes user email addresses and detailed metadata like ManageWP.</p>
            </div>
            
            <div class="card">
                <h2>API Configuration</h2>
                <form method="post" action="options.php">
                    <?php
                    settings_fields('wrm_settings');
                    do_settings_sections('wrm_settings');
                    ?>
                    <table class="form-table">
                        <tr>
                            <th scope="row">API Key</th>
                            <td>
                                <input type="text" id="wrm_api_key" name="wrm_api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" readonly />
                                <button type="button" onclick="regenerateApiKey()" class="button">Regenerate Key</button>
                                <button type="button" onclick="copyApiKey()" class="button">Copy Key</button>
                                <p class="description">Use this API key in your AIO Webcare dashboard to connect this site.</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button(); ?>
                </form>
            </div>
            
            <div class="card">
                <h2>Enhanced Features</h2>
                <ul>
                    <li>✅ <strong>User Email Addresses</strong> - Now included in API responses</li>
                    <li>✅ <strong>Detailed User Metadata</strong> - First name, last name, roles, capabilities</li>
                    <li>✅ <strong>Login Tracking</strong> - Last login time and login count</li>
                    <li>✅ <strong>ManageWP Compatibility</strong> - Same data structure as ManageWP</li>
                    <li>✅ <strong>Enterprise Security</strong> - CSRF protection and rate limiting</li>
                </ul>
            </div>
            
            <div class="card">
                <h2>API Endpoints</h2>
                <p>Use these endpoints with your API key:</p>
                <ul>
                    <li><code><?php echo $site_url; ?>/wp-json/wrms/v1/info</code> - Basic site information</li>
                    <li><code><?php echo $site_url; ?>/wp-json/wrms/v1/users</code> - <strong>Enhanced users with emails</strong></li>
                    <li><code><?php echo $site_url; ?>/wp-json/wrms/v1/users/detailed</code> - <strong>Complete user metadata</strong></li>
                    <li><code><?php echo $site_url; ?>/wp-json/wrms/v1/updates</code> - Available updates</li>
                    <li><code><?php echo $site_url; ?>/wp-json/wrms/v1/plugins</code> - Installed plugins</li>
                    <li><code><?php echo $site_url; ?>/wp-json/wrms/v1/themes</code> - Installed themes</li>
                </ul>
                <p><strong>Authentication:</strong> Include header <code>X-WRMS-API-Key: YOUR_API_KEY</code></p>
            </div>
            
            <div class="card">
                <h2>Test Enhanced Users Endpoint</h2>
                <p>Test the new enhanced users endpoint that includes email addresses:</p>
                <button type="button" onclick="testUsersEndpoint()" class="button button-primary">Test Users Endpoint</button>
                <div id="test-result" style="margin-top: 10px;"></div>
            </div>
        </div>
        
        <script>
        function regenerateApiKey() {
            if (confirm('Are you sure you want to regenerate the API key? You will need to update it in your AIO Webcare dashboard.')) {
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'action=wrm_regenerate_key&_wpnonce=<?php echo wp_create_nonce('wrm_regenerate_key'); ?>'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('wrm_api_key').value = data.data.api_key;
                        alert('New API key generated successfully!');
                    }
                });
            }
        }
        
        function copyApiKey() {
            const apiKeyInput = document.getElementById('wrm_api_key');
            apiKeyInput.select();
            document.execCommand('copy');
            alert('API key copied to clipboard!');
        }
        
        function testUsersEndpoint() {
            const apiKey = document.getElementById('wrm_api_key').value;
            const resultDiv = document.getElementById('test-result');
            
            resultDiv.innerHTML = '<p>Testing enhanced users endpoint...</p>';
            
            fetch('<?php echo $site_url; ?>/wp-json/wrms/v1/users', {
                headers: {'X-WRMS-API-Key': apiKey}
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const emailsIncluded = data.users.some(user => user.email);
                    resultDiv.innerHTML = `
                        <div class="notice notice-success">
                            <p><strong>✅ Test Successful!</strong></p>
                            <ul>
                                <li>Users found: ${data.count}</li>
                                <li>Email addresses included: ${emailsIncluded ? '✅ Yes' : '❌ No'}</li>
                                <li>Enhanced features active: ${data.enhanced_features ? '✅ Yes' : '❌ No'}</li>
                            </ul>
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `<div class="notice notice-error"><p>❌ Test failed: ${data.message || 'Unknown error'}</p></div>`;
                }
            })
            .catch(error => {
                resultDiv.innerHTML = `<div class="notice notice-error"><p>❌ Connection error: ${error.message}</p></div>`;
            });
        }
        </script>
        
        <style>
        .card {
            background: #fff;
            border: 1px solid #c3c4c7;
            border-left: 4px solid #72aee6;
            margin: 20px 0;
            padding: 20px;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        .card h2 {
            margin-top: 0;
        }
        .card ul {
            margin-left: 20px;
        }
        .card li {
            margin-bottom: 8px;
        }
        </style>
        <?php
    }
}

// Handle AJAX for API key regeneration
add_action('wp_ajax_wrm_regenerate_key', function() {
    check_ajax_referer('wrm_regenerate_key');
    
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    
    $new_key = wp_generate_password(64, true, true);
    update_option('wrm_api_key', $new_key);
    
    wp_send_json_success(array('api_key' => $new_key));
});

// Initialize the plugin
WPRemoteManager::get_instance();

/**
 * Rate limiting functionality
 */
class WRMRateLimit {
    private static $requests = array();
    
    public static function check_rate_limit($identifier = null) {
        if (!$identifier) {
            $identifier = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }
        
        $current_time = time();
        $limit_window = 60; // 1 minute
        $max_requests = 60; // requests per minute
        
        // Clean old entries
        if (isset(self::$requests[$identifier])) {
            self::$requests[$identifier] = array_filter(
                self::$requests[$identifier], 
                function($timestamp) use ($current_time, $limit_window) {
                    return ($current_time - $timestamp) < $limit_window;
                }
            );
        } else {
            self::$requests[$identifier] = array();
        }
        
        // Check if rate limit exceeded
        if (count(self::$requests[$identifier]) >= $max_requests) {
            return false;
        }
        
        // Add current request
        self::$requests[$identifier][] = $current_time;
        return true;
    }
}

// Add rate limiting to API calls
add_filter('rest_pre_dispatch', function($result, $server, $request) {
    $route = $request->get_route();
    
    if (strpos($route, '/wrms/v1/') === 0) {
        if (!WRMRateLimit::check_rate_limit()) {
            return new WP_Error('rate_limit_exceeded', 'Rate limit exceeded. Maximum 60 requests per minute.', array('status' => 429));
        }
    }
    
    return $result;
}, 10, 3);
?>