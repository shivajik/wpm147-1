<?php
/**
 * AS College WP Remote Manager Diagnostic Script
 * Upload this file to AS College website root and access via browser
 */

// Prevent direct access unless intentional
if (!isset($_GET['diagnose'])) {
    die('Add ?diagnose=1 to URL to run diagnostic');
}

echo "<h2>AS College WP Remote Manager Diagnostic</h2>";

// Include WordPress
require_once('./wp-config.php');
require_once('./wp-load.php');

echo "<h3>1. Plugin Status</h3>";
if (!function_exists('get_plugins')) {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
}

$all_plugins = get_plugins();
$active_plugins = get_option('active_plugins', array());

echo "<h4>WP Remote Manager Plugins Found:</h4>";
foreach ($all_plugins as $plugin_path => $plugin_data) {
    if (stripos($plugin_data['Name'], 'remote manager') !== false || 
        stripos($plugin_data['Name'], 'wrm') !== false) {
        $is_active = in_array($plugin_path, $active_plugins);
        echo "<p><strong>{$plugin_data['Name']}</strong> v{$plugin_data['Version']}<br>";
        echo "File: {$plugin_path}<br>";
        echo "Status: " . ($is_active ? '<span style="color:green">ACTIVE</span>' : '<span style="color:red">INACTIVE</span>') . "</p>";
    }
}

echo "<h3>2. API Key Configuration</h3>";
$api_key = get_option('wrm_api_key');
if ($api_key) {
    echo "<p><strong>Current API Key:</strong> {$api_key}<br>";
    echo "<strong>Length:</strong> " . strlen($api_key) . " characters</p>";
} else {
    echo "<p style='color:red'>No API key found in database</p>";
}

echo "<h3>3. REST API Endpoints Test</h3>";
$endpoints = array(
    '/wp-json/wrms/v1/',
    '/wp-json/wrm/v1/',
    '/wp-json/wrms/v1/health',
    '/wp-json/wrm/v1/health'
);

foreach ($endpoints as $endpoint) {
    $url = home_url($endpoint);
    $response = wp_remote_get($url);
    if (!is_wp_error($response)) {
        $body = wp_remote_retrieve_body($response);
        $status = wp_remote_retrieve_response_code($response);
        echo "<p><strong>{$endpoint}:</strong> Status {$status}<br>";
        if ($status == 200) {
            echo "<span style='color:green'>✓ Available</span>";
        } else {
            echo "<span style='color:orange'>⚠ Response: " . substr($body, 0, 100) . "...</span>";
        }
        echo "</p>";
    } else {
        echo "<p><strong>{$endpoint}:</strong> <span style='color:red'>✗ Error: {$response->get_error_message()}</span></p>";
    }
}

echo "<h3>4. Suggested Fix</h3>";
if (isset($_GET['fix'])) {
    // Generate new 32-character API key
    $new_key = substr(md5(uniqid(rand(), true)), 0, 32);
    update_option('wrm_api_key', $new_key);
    echo "<p style='color:green'><strong>NEW API KEY GENERATED:</strong> {$new_key}</p>";
    echo "<p>Copy this key to your AIO Webcare dashboard</p>";
} else {
    echo "<p><a href='?diagnose=1&fix=1' style='background:green;color:white;padding:10px;text-decoration:none;'>Generate New 32-Character API Key</a></p>";
}

echo "<h3>5. WordPress Info</h3>";
echo "<p><strong>WordPress Version:</strong> " . get_bloginfo('version') . "<br>";
echo "<strong>Site URL:</strong> " . home_url() . "<br>";
echo "<strong>Admin URL:</strong> " . admin_url() . "</p>";
?>