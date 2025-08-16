# WP Remote Manager Plugin Upgrade Instructions

## Overview

Your WordPress maintenance dashboard requires additional API endpoints in the WP Remote Manager plugin to provide comprehensive management capabilities. Currently, the plugin only supports the `/status` endpoint, but we need dedicated endpoints for plugins, themes, and users management.

## Current Status

✅ **Working Endpoint:**
- `/wp-json/wrm/v1/status` - Returns system info, active theme, and plugin list

❌ **Missing Endpoints:**
- `/wp-json/wrm/v1/plugins` - Dedicated plugin management
- `/wp-json/wrm/v1/themes` - Complete theme listing
- `/wp-json/wrm/v1/users` - User management
- `/wp-json/wrm/v1/updates` - Update management
- `/wp-json/wrm/v1/backup` - Backup operations

## Required Plugin Code Updates

### 1. Add Plugins Endpoint

Add this to your WP Remote Manager plugin's main PHP file:

```php
/**
 * Register plugins endpoint
 */
add_action('rest_api_init', function() {
    register_rest_route('wrm/v1', '/plugins', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_plugins',
        'permission_callback' => 'wrm_verify_api_key'
    ));
});

/**
 * Get detailed plugin information
 */
function wrm_get_plugins($request) {
    if (!function_exists('get_plugins')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    
    $all_plugins = get_plugins();
    $active_plugins = get_option('active_plugins');
    $plugins = array();
    
    foreach ($all_plugins as $plugin_path => $plugin_data) {
        $plugins[] = array(
            'name' => $plugin_data['Name'],
            'version' => $plugin_data['Version'],
            'description' => $plugin_data['Description'],
            'author' => $plugin_data['Author'],
            'author_name' => $plugin_data['AuthorName'] ?? $plugin_data['Author'],
            'plugin_uri' => $plugin_data['PluginURI'],
            'active' => in_array($plugin_path, $active_plugins),
            'update_available' => wrm_check_plugin_update($plugin_path),
            'new_version' => wrm_get_plugin_new_version($plugin_path),
            'path' => $plugin_path,
            'network' => $plugin_data['Network'] ?? false,
            'title' => $plugin_data['Title'] ?? $plugin_data['Name']
        );
    }
    
    return rest_ensure_response(array(
        'success' => true,
        'plugins' => $plugins,
        'total' => count($plugins),
        'active_count' => count($active_plugins)
    ));
}
```

### 2. Add Themes Endpoint

```php
/**
 * Register themes endpoint
 */
add_action('rest_api_init', function() {
    register_rest_route('wrm/v1', '/themes', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_themes',
        'permission_callback' => 'wrm_verify_api_key'
    ));
});

/**
 * Get all theme information
 */
function wrm_get_themes($request) {
    $all_themes = wp_get_themes();
    $current_theme = get_stylesheet();
    $themes = array();
    
    foreach ($all_themes as $theme_slug => $theme_data) {
        $themes[] = array(
            'name' => $theme_data->get('Name'),
            'version' => $theme_data->get('Version'),
            'description' => $theme_data->get('Description'),
            'author' => $theme_data->get('Author'),
            'author_uri' => $theme_data->get('AuthorURI'),
            'theme_uri' => $theme_data->get('ThemeURI'),
            'template' => $theme_data->get_template(),
            'stylesheet' => $theme_data->get_stylesheet(),
            'status' => ($theme_slug === $current_theme) ? 'active' : 'inactive',
            'screenshot' => $theme_data->get_screenshot(),
            'tags' => $theme_data->get('Tags'),
            'parent' => $theme_data->parent() ? $theme_data->parent()->get('Name') : null,
            'update_available' => wrm_check_theme_update($theme_slug)
        );
    }
    
    return rest_ensure_response(array(
        'success' => true,
        'themes' => $themes,
        'total' => count($themes),
        'active_theme' => $current_theme
    ));
}
```

### 3. Add Users Endpoint

```php
/**
 * Register users endpoint
 */
add_action('rest_api_init', function() {
    register_rest_route('wrm/v1', '/users', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_users',
        'permission_callback' => 'wrm_verify_api_key'
    ));
});

/**
 * Get user information
 */
function wrm_get_users($request) {
    $users = get_users(array(
        'number' => 100,
        'orderby' => 'registered',
        'order' => 'DESC'
    ));
    
    $user_data = array();
    
    foreach ($users as $user) {
        $user_data[] = array(
            'id' => $user->ID,
            'name' => $user->display_name,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'registered_date' => $user->user_registered,
            'roles' => $user->roles,
            'post_count' => count_user_posts($user->ID),
            'avatar_url' => get_avatar_url($user->ID),
            'first_name' => get_user_meta($user->ID, 'first_name', true),
            'last_name' => get_user_meta($user->ID, 'last_name', true),
            'website' => $user->user_url,
            'description' => get_user_meta($user->ID, 'description', true)
        );
    }
    
    return rest_ensure_response(array(
        'success' => true,
        'users' => $user_data,
        'total' => count($user_data)
    ));
}
```

### 4. Add Updates Endpoint

```php
/**
 * Register updates endpoint
 */
add_action('rest_api_init', function() {
    register_rest_route('wrm/v1', '/updates', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_updates',
        'permission_callback' => 'wrm_verify_api_key'
    ));
});

/**
 * Get available updates
 */
function wrm_get_updates($request) {
    // Force update checks
    wp_update_plugins();
    wp_update_themes();
    wp_version_check();
    
    $updates = array(
        'wordpress' => array(),
        'plugins' => array(),
        'themes' => array()
    );
    
    // WordPress core updates
    $core_updates = get_site_transient('update_core');
    if ($core_updates && !empty($core_updates->updates)) {
        foreach ($core_updates->updates as $update) {
            if ($update->response === 'upgrade') {
                $updates['wordpress'][] = array(
                    'current_version' => get_bloginfo('version'),
                    'new_version' => $update->version,
                    'package' => $update->download ?? null,
                    'type' => 'core'
                );
                break;
            }
        }
    }
    
    // Plugin updates
    $plugin_updates = get_site_transient('update_plugins');
    if ($plugin_updates && !empty($plugin_updates->response)) {
        foreach ($plugin_updates->response as $plugin_path => $plugin_data) {
            $updates['plugins'][] = array(
                'name' => $plugin_data->slug,
                'current_version' => $plugin_updates->checked[$plugin_path] ?? 'unknown',
                'new_version' => $plugin_data->new_version,
                'package' => $plugin_data->package ?? null,
                'path' => $plugin_path
            );
        }
    }
    
    // Theme updates  
    $theme_updates = get_site_transient('update_themes');
    if ($theme_updates && !empty($theme_updates->response)) {
        foreach ($theme_updates->response as $theme_slug => $theme_data) {
            $updates['themes'][] = array(
                'name' => $theme_slug,
                'current_version' => $theme_updates->checked[$theme_slug] ?? 'unknown',
                'new_version' => $theme_data['new_version'],
                'package' => $theme_data['package'] ?? null,
                'slug' => $theme_slug
            );
        }
    }
    
    return rest_ensure_response(array(
        'success' => true,
        'updates' => $updates,
        'total' => count($updates['wordpress']) + count($updates['plugins']) + count($updates['themes'])
    ));
}
```

### 5. Add Helper Functions

```php
/**
 * Check if plugin has update available
 */
function wrm_check_plugin_update($plugin_path) {
    $update_plugins = get_site_transient('update_plugins');
    return isset($update_plugins->response[$plugin_path]);
}

/**
 * Get plugin new version
 */
function wrm_get_plugin_new_version($plugin_path) {
    $update_plugins = get_site_transient('update_plugins');
    if (isset($update_plugins->response[$plugin_path])) {
        return $update_plugins->response[$plugin_path]->new_version;
    }
    return null;
}

/**
 * Check if theme has update available
 */
function wrm_check_theme_update($theme_slug) {
    $update_themes = get_site_transient('update_themes');
    return isset($update_themes->response[$theme_slug]);
}

/**
 * Verify API key for authentication
 */
function wrm_verify_api_key($request) {
    $api_key = $request->get_header('X-WRM-API-Key');
    $stored_key = get_option('wrm_api_key', '');
    
    if (empty($api_key) || empty($stored_key)) {
        return new WP_Error('missing_api_key', 'API key required', array('status' => 401));
    }
    
    if (!hash_equals($stored_key, $api_key)) {
        return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 401));
    }
    
    return true;
}
```

## Implementation Steps

1. **Access your WordPress admin panel**
2. **Go to Plugins → Editor**
3. **Select the WP Remote Manager plugin**
4. **Add the above code to the main plugin file**
5. **Save the changes**
6. **Test the new endpoints:**

```bash
# Test plugins endpoint
curl -X GET "https://your-site.com/wp-json/wrm/v1/plugins" \
-H "X-WRM-API-Key: YOUR_API_KEY"

# Test themes endpoint  
curl -X GET "https://your-site.com/wp-json/wrm/v1/themes" \
-H "X-WRM-API-Key: YOUR_API_KEY"

# Test users endpoint
curl -X GET "https://your-site.com/wp-json/wrm/v1/users" \
-H "X-WRM-API-Key: YOUR_API_KEY"

# Test updates endpoint
curl -X GET "https://your-site.com/wp-json/wrm/v1/updates" \
-H "X-WRM-API-Key: YOUR_API_KEY"
```

## Expected Benefits

After implementing these endpoints, your WordPress maintenance dashboard will:

✅ **Display complete plugin information** with proper authors, descriptions, and versions
✅ **Show all installed themes** (not just the active one) with full metadata
✅ **Provide comprehensive user management** with roles, post counts, and profile data
✅ **Enable automatic update detection** for WordPress core, plugins, and themes
✅ **Support advanced maintenance operations** like bulk updates and user management

## Security Notes

- All endpoints require API key authentication via `X-WRM-API-Key` header
- API keys should be stored securely in WordPress options
- Consider implementing rate limiting for production use
- Regularly rotate API keys for enhanced security

## Testing Your Current Setup

Your current API key: `sVWd014sp0b1xmXZGUItiMYB1v7h3c3O`
Your WordPress site: `https://ascollegechincholi.com`

After implementation, test with:
```bash
curl -X GET "https://ascollegechincholi.com/wp-json/wrm/v1/plugins" \
-H "X-WRM-API-Key: sVWd014sp0b1xmXZGUItiMYB1v7h3c3O"
```

## Support

Once you've implemented these changes, your WordPress maintenance dashboard will automatically use the new endpoints and provide much richer data for all maintenance operations.