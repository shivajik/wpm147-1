<?php
/**
 * Plugin Name: WP Remote Manager - Enhanced Users v3.1.1 FIXED
 * Description: Enhanced WordPress Remote Manager plugin with user email retrieval and FIXED core update functionality
 * Version: 3.1.1
 * Author: AIO Webcare
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class WPRemoteManager {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route('wrms/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_status'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route('wrms/v1', '/updates', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_updates'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route('wrms/v1', '/plugins', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_plugins'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route('wrms/v1', '/themes', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_themes'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route('wrms/v1', '/users', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_users'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route('wrms/v1', '/users/detailed', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_users_detailed'),
            'permission_callback' => array($this, 'verify_api_key')
        ));

        register_rest_route('wrms/v1', '/health', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_health'),
            'permission_callback' => '__return_true'
        ));
    }

    public function verify_api_key($request) {
        $api_key = $request->get_header('X-WRM-API-Key');
        $stored_key = get_option('wrm_api_key', 'sVWd014sp0b1xmXZGUItiMYB1v7h3c3O');
        return $api_key === $stored_key;
    }

    public function get_status($request) {
        global $wp_version;
        
        // Include necessary files
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        $admin_email = get_option('admin_email');
        $current_theme = wp_get_theme();
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        $plugins = array();
        
        foreach ($all_plugins as $plugin_path => $plugin_data) {
            $plugins[] = array(
                'name' => $plugin_data['Name'],
                'version' => $plugin_data['Version'],
                'active' => in_array($plugin_path, $active_plugins)
            );
        }
        
        return rest_ensure_response(array(
            'site_url' => home_url(),
            'admin_email' => $admin_email,
            'wordpress_version' => $wp_version,
            'php_version' => phpversion(),
            'theme' => array(
                'name' => $current_theme->get('Name'),
                'version' => $current_theme->get('Version'),
                'author' => $current_theme->get('Author')
            ),
            'plugins' => $plugins,
            'maintenance_mode' => file_exists(ABSPATH . '.maintenance') ? '1' : '0',
            'ssl_enabled' => is_ssl(),
            'multisite' => is_multisite()
        ));
    }

    public function get_updates($request) {
        // CRITICAL FIX: Include all necessary WordPress core update files BEFORE calling any update functions
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        if (!function_exists('get_core_updates')) {
            require_once ABSPATH . 'wp-admin/includes/update.php';
        }
        if (!function_exists('wp_update_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/update.php';
        }
        
        // Force update checks
        wp_clean_update_cache();
        wp_update_plugins();
        wp_update_themes();
        wp_version_check(); // This ensures core updates are properly checked
        
        // Plugin updates
        $plugin_updates = get_site_transient('update_plugins');
        $plugins = array();
        
        if ($plugin_updates && isset($plugin_updates->response)) {
            foreach ($plugin_updates->response as $plugin_path => $plugin_data) {
                $current_plugin = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin_path);
                
                $plugins[] = array(
                    'type' => 'plugin',
                    'name' => $current_plugin['Name'],
                    'current_version' => $current_plugin['Version'],
                    'new_version' => $plugin_data->new_version,
                    'package_url' => isset($plugin_data->package) ? $plugin_data->package : '',
                    'auto_update' => isset($plugin_data->auto_update) ? $plugin_data->auto_update : false,
                    'plugin' => $plugin_path
                );
            }
        }
        
        // Theme updates
        $theme_updates = get_site_transient('update_themes');
        $themes = array();
        
        if ($theme_updates && isset($theme_updates->response)) {
            foreach ($theme_updates->response as $theme_slug => $theme_data) {
                $current_theme = wp_get_theme($theme_slug);
                
                $themes[] = array(
                    'type' => 'theme',
                    'name' => $current_theme->get('Name'),
                    'current_version' => $current_theme->get('Version'),
                    'new_version' => $theme_data['new_version'],
                    'package_url' => isset($theme_data['package']) ? $theme_data['package'] : '',
                    'theme' => $theme_slug
                );
            }
        }
        
        // WordPress core update - NOW WITH PROPER INCLUDES
        $wordpress_update = array(
            'update_available' => false,
            'current_version' => get_bloginfo('version'),
            'new_version' => null,
            'package' => null
        );
        
        // Use the properly included get_core_updates() function
        $core_updates = get_core_updates();
        if (!empty($core_updates) && !is_wp_error($core_updates)) {
            foreach ($core_updates as $update) {
                if (isset($update->response) && $update->response === 'upgrade') {
                    $wordpress_update['update_available'] = true;
                    $wordpress_update['new_version'] = $update->version;
                    $wordpress_update['package'] = isset($update->download) ? $update->download : '';
                    break;
                }
            }
        }
        
        $total_count = count($plugins) + count($themes) + ($wordpress_update['update_available'] ? 1 : 0);
        
        return rest_ensure_response(array(
            'wordpress' => $wordpress_update,
            'plugins' => $plugins,
            'themes' => $themes,
            'count' => array(
                'total' => $total_count,
                'plugins' => count($plugins),
                'themes' => count($themes),
                'core' => $wordpress_update['update_available'] ? 1 : 0
            )
        ));
    }

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
                'active' => in_array($plugin_path, $active_plugins),
                'path' => $plugin_path,
                'plugin' => $plugin_path
            );
        }
        
        return rest_ensure_response($plugins);
    }

    public function get_themes($request) {
        $themes = wp_get_themes();
        $current_theme = get_stylesheet();
        $theme_list = array();
        
        foreach ($themes as $theme_slug => $theme) {
            $theme_list[] = array(
                'name' => $theme->get('Name'),
                'version' => $theme->get('Version'),
                'description' => $theme->get('Description'),
                'author' => $theme->get('Author'),
                'active' => ($theme_slug === $current_theme),
                'stylesheet' => $theme_slug
            );
        }
        
        return rest_ensure_response($theme_list);
    }

    public function get_users($request) {
        $users = get_users(array(
            'fields' => array('ID', 'user_login', 'user_email', 'display_name', 'user_registered'),
            'number' => 100
        ));
        
        $formatted_users = array();
        foreach ($users as $user) {
            $user_meta = get_userdata($user->ID);
            $formatted_users[] = array(
                'id' => $user->ID,
                'name' => $user->display_name,
                'username' => $user->user_login,
                'email' => $user->user_email, // EMAIL FUNCTIONALITY WORKING
                'registered_date' => $user->user_registered,
                'roles' => $user_meta->roles
            );
        }
        
        return rest_ensure_response($formatted_users);
    }

    public function get_users_detailed($request) {
        $users = get_users(array(
            'fields' => 'all',
            'number' => 100
        ));
        
        $formatted_users = array();
        foreach ($users as $user) {
            $user_meta = get_userdata($user->ID);
            $last_login = get_user_meta($user->ID, 'last_login', true);
            
            $formatted_users[] = array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email, // CRITICAL: Email addresses included
                'display_name' => $user->display_name,
                'first_name' => get_user_meta($user->ID, 'first_name', true),
                'last_name' => get_user_meta($user->ID, 'last_name', true),
                'roles' => $user_meta->roles,
                'registered_date' => $user->user_registered,
                'last_login' => $last_login ? $last_login : null,
                'post_count' => count_user_posts($user->ID),
                'status' => 'active' // WordPress doesn't have inactive users by default
            );
        }
        
        // Return in the expected format with users wrapper
        return rest_ensure_response(array(
            'success' => true,
            'users' => $formatted_users,
            'count' => count($formatted_users)
        ));
    }

    public function get_health($request) {
        return rest_ensure_response(array(
            'status' => 'healthy',
            'plugin_version' => '3.1.1',
            'wordpress_version' => get_bloginfo('version'),
            'timestamp' => current_time('timestamp')
        ));
    }
}

// Initialize the plugin
new WPRemoteManager();

// Add admin menu for API key management
add_action('admin_menu', function() {
    add_options_page(
        'WP Remote Manager',
        'WP Remote Manager',
        'manage_options',
        'wp-remote-manager',
        'wrm_admin_page'
    );
});

function wrm_admin_page() {
    if (isset($_POST['wrm_api_key'])) {
        update_option('wrm_api_key', sanitize_text_field($_POST['wrm_api_key']));
        echo '<div class="notice notice-success"><p>API Key updated successfully!</p></div>';
    }
    
    $current_key = get_option('wrm_api_key', 'sVWd014sp0b1xmXZGUItiMYB1v7h3c3O');
    ?>
    <div class="wrap">
        <h1>WP Remote Manager - Enhanced Users v3.1.1 FIXED</h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row">API Key</th>
                    <td>
                        <input type="text" name="wrm_api_key" value="<?php echo esc_attr($current_key); ?>" class="regular-text" />
                        <p class="description">This key is used to authenticate API requests.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        
        <h2>Plugin Status</h2>
        <p><strong>Version:</strong> 3.1.1 FIXED</p>
        <p><strong>Status:</strong> ✅ Core update functionality FIXED</p>
        <p><strong>Endpoints Available:</strong></p>
        <ul>
            <li>✅ /wp-json/wrms/v1/status</li>
            <li>✅ /wp-json/wrms/v1/updates (FIXED)</li>
            <li>✅ /wp-json/wrms/v1/plugins</li>
            <li>✅ /wp-json/wrms/v1/themes</li>
            <li>✅ /wp-json/wrms/v1/users (basic user data)</li>
            <li>✅ /wp-json/wrms/v1/users/detailed (with email addresses)</li>
            <li>✅ /wp-json/wrms/v1/health</li>
        </ul>
    </div>
    <?php
}
?>