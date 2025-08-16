<?php
/**
 * WordPress Remote Manager API Key Helper
 * 
 * Upload this file to your WordPress site via FTP or file manager,
 * then visit: https://yourdomain.com/WP_REMOTE_MANAGER_API_KEY_HELPER.php
 * 
 * This will show you the current API key and allow you to regenerate it.
 */

// Security check - only allow access from specific IPs or with password
$allowed_ips = ['127.0.0.1', 'localhost']; // Add your IP here
$password = 'admin123'; // Change this password

$client_ip = $_SERVER['REMOTE_ADDR'] ?? '';
$provided_password = $_GET['password'] ?? '';

if (!in_array($client_ip, $allowed_ips) && $provided_password !== $password) {
    die('Access denied. Add ?password=admin123 to the URL or contact your administrator.');
}

// Load WordPress
$wp_load_paths = [
    __DIR__ . '/wp-load.php',
    __DIR__ . '/../wp-load.php',
    __DIR__ . '/../../wp-load.php',
    __DIR__ . '/../../../wp-load.php',
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
    die('Could not load WordPress. Make sure this file is in your WordPress directory.');
}

// Check if WP Remote Manager plugin is active
if (!function_exists('get_option') || !is_plugin_active('wp-remote-manager/wp-remote-manager.php')) {
    die('WP Remote Manager plugin is not active.');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>WP Remote Manager API Key Helper</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .key-box { background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .success { color: green; }
        .error { color: red; }
        .button { background: #0073aa; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }
        .button:hover { background: #005a87; }
    </style>
</head>
<body>
    <div class="container">
        <h1>WP Remote Manager API Key Helper</h1>
        
        <?php
        $action = $_POST['action'] ?? '';
        
        if ($action === 'regenerate') {
            // Generate new API key
            $new_api_key = wp_generate_password(64, false);
            update_option('wrm_api_key', $new_api_key);
            echo '<div class="success">✓ New API key generated successfully!</div>';
        }
        
        // Get current API key
        $current_api_key = get_option('wrm_api_key', '');
        
        if (empty($current_api_key)) {
            echo '<div class="error">⚠ No API key found. Generating one now...</div>';
            $current_api_key = wp_generate_password(64, false);
            update_option('wrm_api_key', $current_api_key);
            echo '<div class="success">✓ API key generated!</div>';
        }
        ?>
        
        <h2>Current API Key</h2>
        <div class="key-box">
            <strong>API Key:</strong><br>
            <code id="api-key"><?php echo esc_html($current_api_key); ?></code>
            <br><br>
            <button onclick="copyToClipboard()" class="button">Copy to Clipboard</button>
        </div>
        
        <h2>WordPress Site Information</h2>
        <div class="key-box">
            <strong>Site URL:</strong> <?php echo esc_html(home_url()); ?><br>
            <strong>WordPress Version:</strong> <?php echo esc_html(get_bloginfo('version')); ?><br>
            <strong>PHP Version:</strong> <?php echo esc_html(PHP_VERSION); ?><br>
            <strong>WP Remote Manager Plugin:</strong> 
            <?php 
            if (is_plugin_active('wp-remote-manager/wp-remote-manager.php')) {
                echo '<span class="success">✓ Active</span>';
            } else {
                echo '<span class="error">✗ Not Active</span>';
            }
            ?>
        </div>
        
        <h2>Test API Connection</h2>
        <div class="key-box">
            <p>Test URL: <code><?php echo esc_html(home_url('/wp-json/wrms/v1/status')); ?></code></p>
            <p>Headers to include:</p>
            <ul>
                <li><code>X-WRMS-API-Key: <?php echo esc_html($current_api_key); ?></code></li>
                <li><code>Content-Type: application/json</code></li>
            </ul>
        </div>
        
        <form method="post" style="margin-top: 30px;">
            <input type="hidden" name="action" value="regenerate">
            <button type="submit" class="button" onclick="return confirm('Are you sure you want to generate a new API key? This will invalidate the current key.')">
                Generate New API Key
            </button>
        </form>
        
        <div style="margin-top: 40px; padding: 20px; background: #fff3cd; border-radius: 5px;">
            <h3>Instructions:</h3>
            <ol>
                <li>Copy the API key above</li>
                <li>Go to your AIO Webcare dashboard</li>
                <li>Navigate to the website settings for: <strong><?php echo esc_html(home_url()); ?></strong></li>
                <li>Update the WP Remote Manager API Key field</li>
                <li>Save the changes</li>
                <li>Test the connection</li>
            </ol>
        </div>
    </div>
    
    <script>
        function copyToClipboard() {
            const apiKey = document.getElementById('api-key').textContent;
            navigator.clipboard.writeText(apiKey).then(function() {
                alert('API key copied to clipboard!');
            });
        }
    </script>
</body>
</html>
</php>