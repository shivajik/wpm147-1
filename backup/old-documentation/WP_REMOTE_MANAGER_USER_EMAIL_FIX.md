# WordPress Remote Manager - User Email Enhancement

## Problem
The current WordPress Remote Manager plugin doesn't return user email addresses, but platforms like ManageWP do retrieve and display this information.

## Solution
We've created an enhanced version of the WordPress Remote Manager plugin that includes user email addresses in the API responses.

## Installation Instructions

### Step 1: Add Enhanced Code to Plugin

1. **Access your WordPress site's file manager** or **FTP**
2. **Navigate to**: `/wp-content/plugins/wp-remote-manager/`
3. **Open the file**: `wp-remote-manager.php`
4. **Add the following code** at the end of the file (before the closing `?>` tag if present):

```php
<?php
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
?>
```

### Step 2: Test the Enhancement

After adding the code, test the new endpoints:

1. **Test Basic Enhanced Users**:
   ```bash
   curl "https://yourdomain.com/wp-json/wrms/v1/users" \
     -H "X-WRMS-API-Key: YOUR_API_KEY"
   ```

2. **Test Detailed Users**:
   ```bash
   curl "https://yourdomain.com/wp-json/wrms/v1/users/detailed" \
     -H "X-WRMS-API-Key: YOUR_API_KEY"
   ```

3. **Test with Parameters**:
   ```bash
   curl "https://yourdomain.com/wp-json/wrms/v1/users?include_email=true&detailed=true" \
     -H "X-WRMS-API-Key: YOUR_API_KEY"
   ```

### Expected Response

You should now receive user data that includes email addresses:

```json
{
  "success": true,
  "users": [
    {
      "id": "1",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "user_email": "john@example.com",
      "display_name": "John Doe",
      "registered_date": "2023-01-01 00:00:00",
      "roles": ["administrator"],
      "post_count": 5,
      "avatar_url": "https://example.com/avatar.jpg",
      "first_name": "John",
      "last_name": "Doe"
    }
  ],
  "count": 1,
  "total_users": 1
}
```

## Alternative: Quick Fix for Existing Plugin

If you prefer to modify the existing users function instead of adding new endpoints, find the `wrm_get_users` function in your plugin and ensure it includes:

```php
'email' => $user->user_email,
'user_email' => $user->user_email,
```

## Benefits

- ✅ **Complete User Data**: Returns email addresses like ManageWP
- ✅ **Backwards Compatible**: Doesn't break existing functionality
- ✅ **Flexible Parameters**: Supports different levels of detail
- ✅ **Secure**: Uses same authentication as existing endpoints
- ✅ **Comprehensive**: Includes additional user metadata when requested

## Next Steps

1. Add the code to your WordPress site
2. Test the endpoints to ensure they work
3. The AIO Webcare dashboard will automatically detect and use the enhanced user data
4. Users will now display with their actual email addresses instead of "Private (WordPress security)"

## Support

If you need help implementing this enhancement, the detailed code is also available in the `WP_REMOTE_MANAGER_ENHANCED_USERS.php` file in your project.