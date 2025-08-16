<?php
/**
 * WP Remote Manager - Enhanced Users Endpoint
 * 
 * IMPORTANT: Add this code to your existing WP Remote Manager plugin
 * Location: wp-content/plugins/wp-remote-manager/wp-remote-manager.php
 * 
 * This enhances the users endpoint to return complete user data including emails
 * like ManageWP and other management platforms do.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enhanced Users Endpoint - Returns complete user data including emails
 */
add_action('rest_api_init', function() {
    // Enhanced users endpoint with complete data
    register_rest_route('wrms/v1', '/users/detailed', array(
        'methods' => 'GET',
        'callback' => 'wrms_get_detailed_users',
        'permission_callback' => 'wrms_verify_api_key'
    ));
    
    // Override existing users endpoint to include emails by default
    register_rest_route('wrms/v1', '/users', array(
        'methods' => 'GET',
        'callback' => 'wrms_get_enhanced_users',
        'permission_callback' => 'wrms_verify_api_key'
    ));
});

/**
 * Enhanced Users - Returns complete user data like ManageWP
 */
function wrms_get_enhanced_users($request) {
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
        
        // Always include email (like ManageWP does)
        $user_data['email'] = $user->user_email;
        $user_data['user_email'] = $user->user_email;
        
        // Additional data for detailed view
        if ($detailed || $include_meta) {
            $user_data['first_name'] = get_user_meta($user->ID, 'first_name', true);
            $user_data['last_name'] = get_user_meta($user->ID, 'last_name', true);
            $user_data['nickname'] = get_user_meta($user->ID, 'nickname', true);
            $user_data['description'] = get_user_meta($user->ID, 'description', true);
            $user_data['website'] = $user->user_url;
            $user_data['locale'] = get_user_meta($user->ID, 'locale', true);
            $user_data['last_login'] = get_user_meta($user->ID, 'wrms_last_login', true);
            
            // Role capabilities
            $user_data['role_names'] = array();
            foreach ($user_meta->roles as $role) {
                $role_obj = get_role($role);
                if ($role_obj) {
                    $user_data['role_names'][] = ucfirst($role);
                }
            }
        }
        
        $formatted_users[] = $user_data;
    }
    
    // Return response with metadata
    return rest_ensure_response(array(
        'success' => true,
        'users' => $formatted_users,
        'count' => count($formatted_users),
        'total_users' => count_users()['total_users'],
        'timestamp' => current_time('c')
    ));
}

/**
 * Detailed Users Endpoint - Maximum user information
 */
function wrms_get_detailed_users($request) {
    // Force detailed mode
    $request->set_param('detailed', 'true');
    $request->set_param('include_email', 'true');
    $request->set_param('include_meta', 'true');
    
    return wrms_get_enhanced_users($request);
}

/**
 * Track user login times (optional - helps with detailed user info)
 */
add_action('wp_login', function($user_login, $user) {
    update_user_meta($user->ID, 'wrms_last_login', current_time('mysql'));
}, 10, 2);

/**
 * Enhanced API Key verification (if not already defined)
 */
if (!function_exists('wrms_verify_api_key')) {
    function wrms_verify_api_key($request) {
        $api_key = $request->get_header('X-WRMS-API-Key') ?: $request->get_header('X-WRM-API-Key');
        
        if (empty($api_key)) {
            return new WP_Error('missing_api_key', 'API key is required', array('status' => 401));
        }
        
        $stored_key = get_option('wrms_api_key') ?: get_option('wrm_api_key');
        
        if (!hash_equals($stored_key, $api_key)) {
            return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 403));
        }
        
        return true;
    }
}

/**
 * Add CORS headers for API access
 */
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: X-WRMS-API-Key, X-WRM-API-Key, Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
});

// Log API access for debugging
add_filter('rest_pre_dispatch', function($result, $server, $request) {
    if (strpos($request->get_route(), '/wrms/') === 0) {
        error_log('WRMS API Request: ' . $request->get_route() . ' - Method: ' . $request->get_method());
    }
    return $result;
}, 10, 3);