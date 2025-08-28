<?php
/**
 * Plugin Name: WP Remote Manager - Enhanced Users v3.2.0 (Comment Removal Complete)
 * Description: Advanced WordPress Remote Manager plugin with comprehensive comment removal functionality - WP-Optimize style
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
 * Main WP Remote Manager Enhanced Users Class with Comment Management
 */
class WP_Remote_Manager_Enhanced_Users {
    
    private $version = '3.2.0';
    private $api_namespace = 'wrms/v1';
    private $option_name = 'wrm_api_key';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('admin_menu', array($this, 'admin_menu'));
        
        // Add security headers
        add_action('rest_api_init', array($this, 'add_cors_headers'));
        
        // Plugin activation hook
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));
        
        // AJAX handlers for API key management
        add_action('wp_ajax_wrm_regenerate_key', array($this, 'ajax_regenerate_key'));
        add_action('wp_ajax_wrm_update_key', array($this, 'ajax_update_key'));
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
        
        // Comment management endpoints (WP-Optimize style)
        register_rest_route($this->api_namespace, '/comments/remove-unapproved', array(
            'methods' => 'POST',
            'callback' => array($this, 'remove_unapproved_comments'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
        ));
        
        register_rest_route($this->api_namespace, '/comments/remove-spam-trash', array(
            'methods' => 'POST',
            'callback' => array($this, 'remove_spam_and_trash_comments'),
            'permission_callback' => array($this, 'verify_admin_capabilities')
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
        return rest_ensure_response(array(
            'success' => true,
            'version' => $this->version,
            'wordpress_version' => get_bloginfo('version'),
            'php_version' => phpversion(),
            'plugin_status' => 'active',
            'comment_management' => 'enabled'
        ));
    }
    
    /**
     * Remove all unapproved comments (WP-Optimize style)
     * Matches exact WordPress WP-Optimize plugin behavior
     */
    public function remove_unapproved_comments($request) {
        global $wpdb;
        
        // Get all unapproved comments (status = 0 means unapproved/pending)
        $unapproved_comments = $wpdb->get_results(
            "SELECT comment_ID FROM {$wpdb->comments} WHERE comment_approved = '0'"
        );
        
        if (empty($unapproved_comments)) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'No unapproved comments found to remove',
                'deleted_count' => 0,
                'details' => 'Database query found 0 unapproved comments'
            ));
        }
        
        $deleted_count = 0;
        $errors = array();
        
        // Delete each unapproved comment
        foreach ($unapproved_comments as $comment) {
            $result = wp_delete_comment($comment->comment_ID, true); // Force delete (skip trash)
            
            if ($result) {
                $deleted_count++;
            } else {
                $errors[] = "Failed to delete comment ID: {$comment->comment_ID}";
            }
        }
        
        // Log the action for audit
        error_log("WRM: Removed {$deleted_count} unapproved comments via API");
        
        return rest_ensure_response(array(
            'success' => $deleted_count > 0,
            'message' => "Successfully removed {$deleted_count} unapproved comments" . 
                        (count($errors) > 0 ? " (with " . count($errors) . " errors)" : ""),
            'deleted_count' => $deleted_count,
            'errors' => $errors,
            'total_found' => count($unapproved_comments)
        ));
    }
    
    /**
     * Remove all spam and trashed comments (WP-Optimize style)
     * Matches exact WordPress WP-Optimize plugin behavior
     */
    public function remove_spam_and_trash_comments($request) {
        global $wpdb;
        
        // Get all spam comments (comment_approved = 'spam')
        $spam_comments = $wpdb->get_results(
            "SELECT comment_ID FROM {$wpdb->comments} WHERE comment_approved = 'spam'"
        );
        
        // Get all trashed comments (comment_approved = 'trash')
        $trash_comments = $wpdb->get_results(
            "SELECT comment_ID FROM {$wpdb->comments} WHERE comment_approved = 'trash'"
        );
        
        $total_comments = array_merge($spam_comments, $trash_comments);
        
        if (empty($total_comments)) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'No spam or trashed comments found to remove',
                'deleted_count' => 0,
                'details' => array(
                    'spam_found' => count($spam_comments),
                    'trash_found' => count($trash_comments)
                )
            ));
        }
        
        $deleted_count = 0;
        $errors = array();
        
        // Delete each spam and trashed comment
        foreach ($total_comments as $comment) {
            $result = wp_delete_comment($comment->comment_ID, true); // Force delete (skip trash)
            
            if ($result) {
                $deleted_count++;
            } else {
                $errors[] = "Failed to delete comment ID: {$comment->comment_ID}";
            }
        }
        
        // Log the action for audit
        error_log("WRM: Removed {$deleted_count} spam and trashed comments via API");
        
        return rest_ensure_response(array(
            'success' => $deleted_count > 0,
            'message' => "Successfully removed {$deleted_count} spam and trashed comments" . 
                        (count($errors) > 0 ? " (with " . count($errors) . " errors)" : ""),
            'deleted_count' => $deleted_count,
            'errors' => $errors,
            'details' => array(
                'spam_found' => count($spam_comments),
                'trash_found' => count($trash_comments),
                'total_found' => count($total_comments)
            )
        ));
    }
    
    /**
     * Generate API key
     */
    public function generate_api_key() {
        $api_key = wp_generate_password(32, false, false) . bin2hex(random_bytes(16));
        update_option($this->option_name, $api_key);
        return $api_key;
    }
    
    /**
     * Plugin activation
     */
    public function activate_plugin() {
        $this->generate_api_key();
    }
    
    /**
     * Add admin menu
     */
    public function admin_menu() {
        add_options_page(
            'WP Remote Manager',
            'WP Remote Manager', 
            'manage_options',
            'wp-remote-manager',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        $api_key = get_option($this->option_name);
        ?>
        <div class="wrap">
            <h1>WP Remote Manager - Enhanced Users</h1>
            <div class="card">
                <h3>API Configuration</h3>
                <p><strong>API Key:</strong> <code><?php echo esc_html($api_key); ?></code></p>
                <p><strong>Endpoint:</strong> <code><?php echo site_url('/wp-json/wrms/v1/'); ?></code></p>
                
                <h4>Comment Management Endpoints:</h4>
                <ul>
                    <li><strong>Remove Unapproved Comments:</strong> <code>POST /wp-json/wrms/v1/comments/remove-unapproved</code></li>
                    <li><strong>Remove Spam & Trash Comments:</strong> <code>POST /wp-json/wrms/v1/comments/remove-spam-trash</code></li>
                </ul>
                
                <form method="post">
                    <input type="hidden" name="action" value="regenerate_key">
                    <button type="submit" class="button">Regenerate API Key</button>
                </form>
            </div>
        </div>
        <?php
        
        if (isset($_POST['action']) && $_POST['action'] === 'regenerate_key') {
            $this->generate_api_key();
            echo '<div class="notice notice-success"><p>API key regenerated successfully!</p></div>';
        }
    }
    
    /**
     * Add CORS headers
     */
    public function add_cors_headers() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WRM-API-Key, X-WRMS-API-Key');
    }
    
    /**
     * AJAX regenerate key
     */
    public function ajax_regenerate_key() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $new_key = $this->generate_api_key();
        wp_send_json_success(array(
            'new_api_key' => $new_key,
            'message' => 'New API key generated successfully'
        ));
    }
    
    /**
     * AJAX update key
     */
    public function ajax_update_key() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $new_key = sanitize_text_field($_POST['new_key']);
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
}

// Initialize the plugin
new WP_Remote_Manager_Enhanced_Users();