<?php
/**
 * Plugin Name: WP Remote Manager - Enhanced Users
 * Description: WordPress Remote Manager Enhanced Users Edition with Email Support - Like ManageWP
 * Version: 3.2.0 Final
 * Author: AIO Webcare Team
 * Plugin URI: https://aio-webcare.com
 * Text Domain: wp-remote-manager-enhanced-users
 * Network: false
 * Requires at least: 5.0
 * Tested up to: 6.8
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Plugin activation hook
 */
register_activation_hook(__FILE__, 'wrm_enhanced_activate');

function wrm_enhanced_activate() {
    // Generate unique API key if not exists
    if (!get_option('wrm_enhanced_api_key')) {
        update_option('wrm_enhanced_api_key', wrm_enhanced_generate_api_key());
    }
}

/**
 * Generate a secure random API key
 */
function wrm_enhanced_generate_api_key() {
    return wp_generate_password(64, false, false);
}

/**
 * Add admin menu
 */
add_action('admin_menu', 'wrm_enhanced_admin_menu');

function wrm_enhanced_admin_menu() {
    add_options_page(
        'WP Remote Manager Enhanced Settings',
        'Remote Manager Enhanced',
        'manage_options',
        'wp-remote-manager-enhanced',
        'wrm_enhanced_admin_page'
    );
}

/**
 * Add settings link to plugin page
 */
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'wrm_enhanced_plugin_action_links');

function wrm_enhanced_plugin_action_links($links) {
    $settings_link = '<a href="' . admin_url('options-general.php?page=wp-remote-manager-enhanced') . '">' . __('Settings') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}

/**
 * Admin page content
 */
function wrm_enhanced_admin_page() {
    if (isset($_POST['submit'])) {
        update_option('wrm_enhanced_api_key', sanitize_text_field($_POST['wrm_enhanced_api_key']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    if (isset($_POST['regenerate_key'])) {
        update_option('wrm_enhanced_api_key', wrm_enhanced_generate_api_key());
        echo '<div class="notice notice-success"><p>New API key generated!</p></div>';
    }
    
    $api_key = get_option('wrm_enhanced_api_key', '');
    ?>
    <div class="wrap">
        <h1>WP Remote Manager Enhanced Users v3.2.0 Final</h1>
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">API Key</th>
                    <td>
                        <input type="text" name="wrm_enhanced_api_key" value="<?php echo esc_attr($api_key); ?>" 
                               class="regular-text" readonly style="width: 100%; max-width: 500px;" />
                        <p class="description">Copy this API key to your WordPress Maintenance Dashboard to connect this site.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Settings'); ?>
            <?php submit_button('Generate New Key', 'secondary', 'regenerate_key'); ?>
        </form>
        
        <h2>Enhanced Features v3.2.0 Final</h2>
        <ul>
            <li>✓ Enhanced User Metadata with Email Support</li>
            <li>✓ Advanced Plugin Management</li>
            <li>✓ Theme Management with Metadata</li>
            <li>✓ Secure API Endpoints</li>
            <li>✓ WordPress Core Update Detection</li>
            <li>✓ ManageWP-like Functionality</li>
            <li>✓ Enhanced Security Features</li>
            <li>✓ Real-time Status Monitoring</li>
        </ul>
    </div>
    <?php
}

/**
 * Register REST API endpoints
 */
add_action('rest_api_init', 'wrm_enhanced_register_routes');

function wrm_enhanced_register_routes() {
    // Secure endpoints
    register_rest_route('wrm-secure/v1', '/status', array(
        'methods' => 'GET',
        'callback' => 'wrm_enhanced_get_status',
        'permission_callback' => 'wrm_enhanced_check_api_key'
    ));
    
    register_rest_route('wrm-secure/v1', '/updates', array(
        'methods' => 'GET',
        'callback' => 'wrm_enhanced_get_updates',
        'permission_callback' => 'wrm_enhanced_check_api_key'
    ));
    
    register_rest_route('wrm-secure/v1', '/plugins', array(
        'methods' => 'GET',
        'callback' => 'wrm_enhanced_get_plugins',
        'permission_callback' => 'wrm_enhanced_check_api_key'
    ));
    
    register_rest_route('wrm-secure/v1', '/themes', array(
        'methods' => 'GET',
        'callback' => 'wrm_enhanced_get_themes',
        'permission_callback' => 'wrm_enhanced_check_api_key'
    ));
    
    register_rest_route('wrm-secure/v1', '/users', array(
        'methods' => 'GET',
        'callback' => 'wrm_enhanced_get_users',
        'permission_callback' => 'wrm_enhanced_check_api_key'
    ));
    
    // Legacy endpoints for compatibility
    register_rest_route('wrm/v1', '/status', array(
        'methods' => 'GET',
        'callback' => 'wrm_enhanced_get_status',
        'permission_callback' => 'wrm_enhanced_check_api_key'
    ));
    
    register_rest_route('wrm/v1', '/updates', array(
        'methods' => 'GET',
        'callback' => 'wrm_enhanced_get_updates',
        'permission_callback' => 'wrm_enhanced_check_api_key'
    ));
}

/**
 * Check API key for authentication
 */
function wrm_enhanced_check_api_key($request) {
    $api_key = $request->get_header('X-API-Key');
    if (!$api_key) {
        $api_key = $request->get_param('api_key');
    }
    
    $stored_key = get_option('wrm_enhanced_api_key');
    return !empty($stored_key) && hash_equals($stored_key, $api_key);
}

/**
 * Get site status
 */
function wrm_enhanced_get_status($request) {
    global $wpdb;
    
    // Get WordPress info
    $wp_version = get_bloginfo('version');
    $php_version = PHP_VERSION;
    $mysql_version = $wpdb->db_version();
    
    // Get memory info
    $memory_limit = ini_get('memory_limit');
    $memory_usage = size_format(memory_get_usage(true));
    
    // Get disk usage
    $upload_dir = wp_upload_dir();
    $disk_free = disk_free_space($upload_dir['basedir']);
    $disk_total = disk_total_space($upload_dir['basedir']);
    $disk_used = $disk_total - $disk_free;
    
    // Get SSL status
    $ssl_enabled = is_ssl();
    
    // Get counts
    $plugins_count = count(get_plugins());
    $themes_count = count(wp_get_themes());
    $users_count = count_users()['total_users'];
    $posts_count = wp_count_posts()->publish;
    $pages_count = wp_count_posts('page')->publish;
    
    return array(
        'status' => 'healthy',
        'plugin' => 'WP Remote Manager Enhanced Users',
        'version' => '3.2.0 Final',
        'wordpress_version' => $wp_version,
        'php_version' => $php_version,
        'mysql_version' => $mysql_version,
        'memory_limit' => $memory_limit,
        'memory_usage' => $memory_usage,
        'disk_usage' => array(
            'used' => size_format($disk_used),
            'free' => size_format($disk_free),
            'total' => size_format($disk_total)
        ),
        'ssl_enabled' => $ssl_enabled,
        'plugins_count' => $plugins_count,
        'themes_count' => $themes_count,
        'users_count' => $users_count,
        'posts_count' => $posts_count,
        'pages_count' => $pages_count,
        'site_url' => get_site_url(),
        'admin_email' => get_option('admin_email')
    );
}

/**
 * Get available updates
 */
function wrm_enhanced_get_updates($request) {
    // Force update check
    wp_update_plugins();
    wp_update_themes();
    wp_version_check();
    
    $plugin_updates = get_site_transient('update_plugins');
    $theme_updates = get_site_transient('update_themes');
    $core_updates = get_core_updates();
    
    $updates = array(
        'plugins' => array(),
        'themes' => array(),
        'wordpress' => array('update_available' => false),
        'count' => array(
            'plugins' => 0,
            'themes' => 0,
            'core' => 0,
            'total' => 0
        )
    );
    
    // Plugin updates
    if (!empty($plugin_updates->response)) {
        foreach ($plugin_updates->response as $plugin_file => $plugin_data) {
            $plugin_info = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin_file);
            $updates['plugins'][] = array(
                'name' => $plugin_info['Name'],
                'current_version' => $plugin_info['Version'],
                'new_version' => $plugin_data->new_version,
                'download_url' => $plugin_data->package,
                'auto_update' => false,
                'plugin' => $plugin_file
            );
        }
        $updates['count']['plugins'] = count($updates['plugins']);
    }
    
    // Theme updates
    if (!empty($theme_updates->response)) {
        foreach ($theme_updates->response as $theme_slug => $theme_data) {
            $theme_info = wp_get_theme($theme_slug);
            $updates['themes'][] = array(
                'name' => $theme_info->get('Name'),
                'current_version' => $theme_info->get('Version'),
                'new_version' => $theme_data['new_version'],
                'download_url' => $theme_data['package'],
                'auto_update' => false,
                'theme' => $theme_slug
            );
        }
        $updates['count']['themes'] = count($updates['themes']);
    }
    
    // WordPress core updates
    if (!empty($core_updates) && isset($core_updates[0]) && $core_updates[0]->response === 'upgrade') {
        $updates['wordpress'] = array(
            'update_available' => true,
            'current_version' => get_bloginfo('version'),
            'new_version' => $core_updates[0]->current,
            'download_url' => $core_updates[0]->download
        );
        $updates['count']['core'] = 1;
    }
    
    $updates['count']['total'] = $updates['count']['plugins'] + $updates['count']['themes'] + $updates['count']['core'];
    
    return $updates;
}

/**
 * Get plugins with enhanced metadata
 */
function wrm_enhanced_get_plugins($request) {
    $all_plugins = get_plugins();
    $active_plugins = get_option('active_plugins', array());
    
    $plugins = array();
    foreach ($all_plugins as $plugin_file => $plugin_data) {
        $plugins[] = array(
            'name' => $plugin_data['Name'],
            'description' => $plugin_data['Description'],
            'version' => $plugin_data['Version'],
            'author' => $plugin_data['Author'],
            'author_uri' => $plugin_data['AuthorURI'],
            'plugin_uri' => $plugin_data['PluginURI'],
            'text_domain' => $plugin_data['TextDomain'],
            'domain_path' => $plugin_data['DomainPath'],
            'network' => $plugin_data['Network'],
            'requires_wp' => $plugin_data['RequiresWP'],
            'requires_php' => $plugin_data['RequiresPHP'],
            'active' => in_array($plugin_file, $active_plugins),
            'plugin_file' => $plugin_file
        );
    }
    
    return $plugins;
}

/**
 * Get themes with enhanced metadata
 */
function wrm_enhanced_get_themes($request) {
    $all_themes = wp_get_themes();
    $current_theme = get_stylesheet();
    
    $themes = array();
    foreach ($all_themes as $theme_slug => $theme_data) {
        $themes[] = array(
            'name' => $theme_data->get('Name'),
            'description' => $theme_data->get('Description'),
            'version' => $theme_data->get('Version'),
            'author' => $theme_data->get('Author'),
            'author_uri' => $theme_data->get('AuthorURI'),
            'theme_uri' => $theme_data->get('ThemeURI'),
            'template' => $theme_data->get('Template'),
            'status' => $theme_data->get('Status'),
            'tags' => $theme_data->get('Tags'),
            'active' => ($theme_slug === $current_theme),
            'parent_theme' => $theme_data->parent() ? $theme_data->parent()->get('Name') : null,
            'theme_slug' => $theme_slug
        );
    }
    
    return $themes;
}

/**
 * Get users with enhanced metadata including emails
 */
function wrm_enhanced_get_users($request) {
    $users = get_users(array(
        'fields' => array('ID', 'user_login', 'user_email', 'display_name', 'user_registered'),
        'meta_key' => '',
        'meta_value' => '',
        'meta_compare' => '',
        'meta_query' => array(),
        'orderby' => 'registered',
        'order' => 'DESC'
    ));
    
    $user_data = array();
    foreach ($users as $user) {
        $user_meta = get_user_meta($user->ID);
        $user_data[] = array(
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'display_name' => $user->display_name,
            'registered' => $user->user_registered,
            'roles' => get_userdata($user->ID)->roles,
            'first_name' => isset($user_meta['first_name'][0]) ? $user_meta['first_name'][0] : '',
            'last_name' => isset($user_meta['last_name'][0]) ? $user_meta['last_name'][0] : '',
            'description' => isset($user_meta['description'][0]) ? $user_meta['description'][0] : '',
            'capabilities' => get_userdata($user->ID)->allcaps
        );
    }
    
    return $user_data;
}

/**
 * Add custom CSS for admin page
 */
add_action('admin_head', 'wrm_enhanced_admin_styles');

function wrm_enhanced_admin_styles() {
    $screen = get_current_screen();
    if ($screen->id === 'settings_page_wp-remote-manager-enhanced') {
        ?>
        <style>
            .wrm-enhanced-features {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin-top: 20px;
            }
            .wrm-enhanced-features h2 {
                color: #495057;
                margin-bottom: 15px;
            }
            .wrm-enhanced-features ul {
                list-style: none;
                padding: 0;
            }
            .wrm-enhanced-features li {
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .wrm-enhanced-features li:last-child {
                border-bottom: none;
            }
        </style>
        <?php
    }
}