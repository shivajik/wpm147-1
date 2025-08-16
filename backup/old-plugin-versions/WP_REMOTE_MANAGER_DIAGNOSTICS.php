<?php
/**
 * WordPress Remote Manager Diagnostics Tool
 * 
 * Upload this file to your WordPress site and visit:
 * https://yourdomain.com/WP_REMOTE_MANAGER_DIAGNOSTICS.php?password=admin123
 * 
 * This will diagnose the API key configuration and test various authentication methods.
 */

// Security check
$password = 'admin123';
$provided_password = $_GET['password'] ?? '';

if ($provided_password !== $password) {
    die('Access denied. Add ?password=admin123 to the URL.');
}

// Load WordPress
$wp_load_paths = [
    __DIR__ . '/wp-load.php',
    __DIR__ . '/../wp-load.php',
    __DIR__ . '/../../wp-load.php',
];

$wp_loaded = false;
foreach ($wp_load_paths as $path) {
    if (file_exists($path)) {
        require_once($path);
        $wp_loaded = true;
        break;
    }
}

if (!$wp_loaded) {
    die('Could not load WordPress.');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>WP Remote Manager Diagnostics</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 1000px; margin: 0 auto; }
        .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .button { background: #0073aa; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; margin: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>WP Remote Manager Diagnostics</h1>
        
        <div class="section">
            <h2>Plugin Status</h2>
            <?php
            $plugin_file = 'wp-remote-manager/wp-remote-manager.php';
            $plugin_active = is_plugin_active($plugin_file);
            $plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin_file);
            ?>
            <table>
                <tr><td><strong>Plugin Active:</strong></td><td><?php echo $plugin_active ? '<span class="success">✓ Yes</span>' : '<span class="error">✗ No</span>'; ?></td></tr>
                <tr><td><strong>Plugin Name:</strong></td><td><?php echo esc_html($plugin_data['Name'] ?? 'Unknown'); ?></td></tr>
                <tr><td><strong>Version:</strong></td><td><?php echo esc_html($plugin_data['Version'] ?? 'Unknown'); ?></td></tr>
                <tr><td><strong>Description:</strong></td><td><?php echo esc_html($plugin_data['Description'] ?? 'Unknown'); ?></td></tr>
            </table>
        </div>
        
        <div class="section">
            <h2>WordPress Information</h2>
            <table>
                <tr><td><strong>WordPress Version:</strong></td><td><?php echo esc_html(get_bloginfo('version')); ?></td></tr>
                <tr><td><strong>Site URL:</strong></td><td><?php echo esc_html(home_url()); ?></td></tr>
                <tr><td><strong>PHP Version:</strong></td><td><?php echo esc_html(PHP_VERSION); ?></td></tr>
                <tr><td><strong>MySQL Version:</strong></td><td><?php global $wpdb; echo esc_html($wpdb->db_version()); ?></td></tr>
            </table>
        </div>
        
        <div class="section">
            <h2>API Key Configuration</h2>
            <?php
            // Check various possible option names for the API key
            $possible_keys = [
                'wrm_api_key',
                'wrms_api_key', 
                'wp_remote_manager_api_key',
                'wprm_api_key',
                'remote_manager_api_key'
            ];
            
            $found_keys = [];
            foreach ($possible_keys as $key) {
                $value = get_option($key);
                if (!empty($value)) {
                    $found_keys[$key] = $value;
                }
            }
            ?>
            
            <?php if (empty($found_keys)): ?>
                <div class="error">⚠ No API keys found in WordPress options table.</div>
                <p>Possible solutions:</p>
                <ul>
                    <li>Go to WordPress Admin → Settings → WP Remote Manager</li>
                    <li>Generate a new API key</li>
                    <li>Check if the plugin stores keys in a different location</li>
                </ul>
            <?php else: ?>
                <div class="success">✓ Found API key configuration(s):</div>
                <table>
                    <tr><th>Option Name</th><th>API Key</th><th>Length</th></tr>
                    <?php foreach ($found_keys as $option => $key): ?>
                    <tr>
                        <td><code><?php echo esc_html($option); ?></code></td>
                        <td><code><?php echo esc_html($key); ?></code></td>
                        <td><?php echo strlen($key); ?> characters</td>
                    </tr>
                    <?php endforeach; ?>
                </table>
            <?php endif; ?>
        </div>
        
        <div class="section">
            <h2>REST API Test</h2>
            <?php
            $rest_url = home_url('/wp-json/wrms/v1/');
            echo "<p><strong>Base URL:</strong> <code>" . esc_html($rest_url) . "</code></p>";
            
            // Test if REST API is accessible
            $response = wp_remote_get($rest_url);
            if (is_wp_error($response)) {
                echo '<div class="error">✗ REST API not accessible: ' . esc_html($response->get_error_message()) . '</div>';
            } else {
                echo '<div class="success">✓ REST API is accessible</div>';
                echo '<p><strong>Response:</strong></p>';
                echo '<pre>' . esc_html(wp_remote_retrieve_body($response)) . '</pre>';
            }
            ?>
        </div>
        
        <div class="section">
            <h2>Authentication Test</h2>
            <?php if (!empty($found_keys)): ?>
                <?php foreach ($found_keys as $option => $api_key): ?>
                    <h3>Testing with <?php echo esc_html($option); ?></h3>
                    <?php
                    $test_url = home_url('/wp-json/wrms/v1/status');
                    
                    // Test different authentication methods
                    $auth_methods = [
                        'X-WRMS-API-Key' => $api_key,
                        'X-WRM-API-Key' => $api_key,
                        'X-Auth-Key' => $api_key,
                        'X-API-Key' => $api_key,
                        'Authorization' => 'Bearer ' . $api_key,
                        'Authorization' => 'Api-Key ' . $api_key,
                    ];
                    
                    foreach ($auth_methods as $header => $value) {
                        echo "<h4>Method: {$header}</h4>";
                        
                        $args = [
                            'headers' => [
                                $header => $value,
                                'Content-Type' => 'application/json',
                                'User-Agent' => 'WP-Diagnostics/1.0'
                            ],
                            'timeout' => 10
                        ];
                        
                        $response = wp_remote_get($test_url, $args);
                        
                        if (is_wp_error($response)) {
                            echo '<div class="error">✗ Error: ' . esc_html($response->get_error_message()) . '</div>';
                        } else {
                            $status_code = wp_remote_retrieve_response_code($response);
                            $body = wp_remote_retrieve_body($response);
                            
                            if ($status_code === 200) {
                                echo '<div class="success">✓ Success! Status: ' . $status_code . '</div>';
                            } else {
                                echo '<div class="warning">⚠ Status: ' . $status_code . '</div>';
                            }
                            
                            echo '<p><strong>Response:</strong></p>';
                            echo '<pre>' . esc_html($body) . '</pre>';
                        }
                        echo '<hr>';
                    }
                    ?>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="error">Cannot test authentication without API key.</div>
            <?php endif; ?>
        </div>
        
        <div class="section">
            <h2>Recommended Actions</h2>
            <ol>
                <li>If no API keys found: Go to WordPress Admin and configure the plugin</li>
                <li>If authentication fails: Check the header format expected by your plugin version</li>
                <li>Copy the working API key and header format to your dashboard</li>
                <li>Test the connection in your AIO Webcare dashboard</li>
            </ol>
        </div>
    </div>
</body>
</html>