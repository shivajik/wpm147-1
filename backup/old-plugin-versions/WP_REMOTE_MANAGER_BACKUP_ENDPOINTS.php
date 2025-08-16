<?php
/**
 * WP Remote Manager - Backup Endpoints Enhancement
 * 
 * IMPORTANT: Add this code to your existing WP Remote Manager plugin
 * Location: wp-content/plugins/wp-remote-manager/wp-remote-manager.php
 * 
 * This code adds backup monitoring and status endpoints for UpdraftPlus integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register backup-related endpoints
 */
add_action('rest_api_init', function() {
    // Backup status endpoint
    register_rest_route('wrm/v1', '/backup/status', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_backup_status',
        'permission_callback' => 'wrm_verify_api_key'
    ));
    
    // List available backups endpoint
    register_rest_route('wrm/v1', '/backup/list', array(
        'methods' => 'GET',
        'callback' => 'wrm_list_backups',
        'permission_callback' => 'wrm_verify_api_key'
    ));
    
    // Trigger backup endpoint
    register_rest_route('wrm/v1', '/backup/trigger', array(
        'methods' => 'POST',
        'callback' => 'wrm_trigger_backup',
        'permission_callback' => 'wrm_verify_api_key',
        'args' => array(
            'backup_type' => array(
                'required' => false,
                'type' => 'string',
                'default' => 'full',
                'description' => 'Type of backup: full, database, files'
            )
        )
    ));
    
    // Backup configuration endpoint
    register_rest_route('wrm/v1', '/backup/config', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_backup_config',
        'permission_callback' => 'wrm_verify_api_key'
    ));
    
    // UpdraftPlus plugin status endpoint
    register_rest_route('wrm/v1', '/backup/plugin-status', array(
        'methods' => 'GET',
        'callback' => 'wrm_get_backup_plugin_status',
        'permission_callback' => 'wrm_verify_api_key'
    ));
});

/**
 * Get current backup status from UpdraftPlus
 */
function wrm_get_backup_status($request) {
    try {
        // Check if UpdraftPlus is installed and active
        if (!is_plugin_active('updraftplus/updraftplus.php')) {
            return array(
                'success' => false,
                'error' => 'UpdraftPlus plugin is not installed or active',
                'status' => 'plugin_not_available'
            );
        }

        // Get UpdraftPlus options and status
        $updraftplus_options = get_option('updraft_interval', array());
        $backup_history = get_option('updraft_backup_history', array());
        
        // Check for active backup jobs
        $active_jobs = array();
        $backup_status = 'idle';
        
        // Try to get active job status from UpdraftPlus
        if (class_exists('UpdraftPlus_Options')) {
            $job_status = UpdraftPlus_Options::get_updraft_option('updraft_jobdata_backup', array());
            if (!empty($job_status)) {
                $backup_status = 'running';
                $active_jobs[] = array(
                    'type' => 'backup',
                    'status' => 'running',
                    'started' => $job_status['backup_time'] ?? time(),
                    'progress' => $job_status['backup_percent'] ?? 0
                );
            }
        }
        
        // Get last backup information
        $last_backup = null;
        if (!empty($backup_history)) {
            $last_backup_key = max(array_keys($backup_history));
            $last_backup_data = $backup_history[$last_backup_key];
            
            $last_backup = array(
                'timestamp' => $last_backup_key,
                'date' => date('Y-m-d H:i:s', $last_backup_key),
                'status' => isset($last_backup_data['backup_successful']) && $last_backup_data['backup_successful'] ? 'completed' : 'failed',
                'size' => $last_backup_data['backup_size'] ?? 0,
                'components' => array_keys($last_backup_data['meta_foreign'] ?? array())
            );
        }

        return array(
            'success' => true,
            'status' => $backup_status,
            'active_jobs' => $active_jobs,
            'last_backup' => $last_backup,
            'backup_count' => count($backup_history),
            'plugin_version' => defined('UPDRAFTPLUS_VERSION') ? UPDRAFTPLUS_VERSION : 'unknown',
            'timestamp' => current_time('timestamp')
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'error' => 'Failed to get backup status: ' . $e->getMessage(),
            'status' => 'error'
        );
    }
}

/**
 * List available backups from UpdraftPlus
 */
function wrm_list_backups($request) {
    try {
        // Check if UpdraftPlus is installed and active
        if (!is_plugin_active('updraftplus/updraftplus.php')) {
            return array(
                'success' => false,
                'error' => 'UpdraftPlus plugin is not installed or active',
                'backups' => array()
            );
        }

        $backup_history = get_option('updraft_backup_history', array());
        $backups = array();
        
        foreach ($backup_history as $timestamp => $backup_data) {
            $backups[] = array(
                'id' => $timestamp,
                'timestamp' => $timestamp,
                'date' => date('Y-m-d H:i:s', $timestamp),
                'status' => isset($backup_data['backup_successful']) && $backup_data['backup_successful'] ? 'completed' : 'failed',
                'size' => $backup_data['backup_size'] ?? 0,
                'size_formatted' => size_format($backup_data['backup_size'] ?? 0),
                'components' => array_keys($backup_data['meta_foreign'] ?? array()),
                'description' => $backup_data['backup_nonce'] ?? 'Manual backup',
                'files' => $backup_data['meta_foreign'] ?? array()
            );
        }
        
        // Sort by timestamp descending (newest first)
        usort($backups, function($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        return array(
            'success' => true,
            'backups' => $backups,
            'total_count' => count($backups),
            'total_size' => array_sum(array_column($backups, 'size')),
            'plugin_version' => defined('UPDRAFTPLUS_VERSION') ? UPDRAFTPLUS_VERSION : 'unknown'
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'error' => 'Failed to list backups: ' . $e->getMessage(),
            'backups' => array()
        );
    }
}

/**
 * Trigger a backup via UpdraftPlus
 */
function wrm_trigger_backup($request) {
    try {
        // Check if UpdraftPlus is installed and active
        if (!is_plugin_active('updraftplus/updraftplus.php')) {
            return array(
                'success' => false,
                'error' => 'UpdraftPlus plugin is not installed or active',
                'requiresManualTrigger' => true,
                'message' => 'Please install and activate UpdraftPlus plugin first'
            );
        }

        $backup_type = $request->get_param('backup_type') ?: 'full';
        
        // For UpdraftPlus, we'll provide manual trigger instructions
        // as automatic triggering requires complex integration
        
        $dashboard_url = admin_url('options-general.php?page=updraftplus');
        
        $instructions = array(
            'step1' => 'Go to your WordPress admin dashboard',
            'step2' => 'Navigate to UpdraftPlus plugin settings',
            'step3' => "Click 'Backup Now' and select appropriate {$backup_type} options",
            'step4' => 'Return here to monitor backup progress automatically'
        );
        
        if ($backup_type === 'database') {
            $instructions['step3'] = "Click 'Backup Now', uncheck 'Files' and keep only 'Database' selected";
        } elseif ($backup_type === 'files') {
            $instructions['step3'] = "Click 'Backup Now', uncheck 'Database' and keep only 'Files' selected";
        }

        return array(
            'success' => true,
            'requiresManualTrigger' => true,
            'backupType' => $backup_type,
            'message' => "Ready to create {$backup_type} backup",
            'instructions' => $instructions,
            'dashboardUrl' => $dashboard_url,
            'autoRefresh' => true,
            'timestamp' => current_time('timestamp')
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'error' => 'Failed to trigger backup: ' . $e->getMessage(),
            'requiresManualTrigger' => true
        );
    }
}

/**
 * Get backup configuration from UpdraftPlus
 */
function wrm_get_backup_config($request) {
    try {
        // Check if UpdraftPlus is installed and active
        if (!is_plugin_active('updraftplus/updraftplus.php')) {
            return array(
                'success' => false,
                'error' => 'UpdraftPlus plugin is not installed or active',
                'configured' => false
            );
        }

        // Get UpdraftPlus settings
        $settings = array(
            'backup_interval' => get_option('updraft_interval', 'manual'),
            'backup_retain' => get_option('updraft_retain', 2),
            'backup_retain_db' => get_option('updraft_retain_db', 2),
            'backup_dir' => get_option('updraft_dir', 'updraft'),
            'remote_storage' => get_option('updraft_service', array()),
            'include_plugins' => get_option('updraft_include_plugins', 1),
            'include_themes' => get_option('updraft_include_themes', 1),
            'include_uploads' => get_option('updraft_include_uploads', 1),
            'include_others' => get_option('updraft_include_others', 1)
        );

        $storage_methods = get_option('updraft_service', array());
        $configured_storage = array();
        
        foreach ($storage_methods as $method) {
            $configured_storage[] = array(
                'method' => $method,
                'name' => ucfirst($method),
                'configured' => !empty(get_option("updraft_{$method}", array()))
            );
        }

        return array(
            'success' => true,
            'configured' => true,
            'plugin_version' => defined('UPDRAFTPLUS_VERSION') ? UPDRAFTPLUS_VERSION : 'unknown',
            'settings' => $settings,
            'storage_methods' => $configured_storage,
            'backup_directory' => wp_upload_dir()['basedir'] . '/updraft',
            'last_check' => current_time('timestamp')
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'error' => 'Failed to get backup configuration: ' . $e->getMessage(),
            'configured' => false
        );
    }
}

/**
 * Get UpdraftPlus plugin status and installation info
 */
function wrm_get_backup_plugin_status($request) {
    try {
        $plugin_path = 'updraftplus/updraftplus.php';
        $is_installed = file_exists(WP_PLUGIN_DIR . '/' . $plugin_path);
        $is_active = is_plugin_active($plugin_path);
        
        $status = array(
            'installed' => $is_installed,
            'active' => $is_active,
            'plugin_path' => $plugin_path,
            'install_url' => admin_url('plugin-install.php?s=updraftplus&tab=search&type=term'),
            'activate_url' => $is_installed ? admin_url('plugins.php') : null,
            'settings_url' => $is_active ? admin_url('options-general.php?page=updraftplus') : null
        );
        
        if ($is_installed) {
            $plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin_path);
            $status['version'] = $plugin_data['Version'] ?? 'unknown';
            $status['name'] = $plugin_data['Name'] ?? 'UpdraftPlus';
            $status['description'] = $plugin_data['Description'] ?? '';
        }
        
        if (!$is_installed) {
            $status['message'] = 'UpdraftPlus plugin is not installed. Please install it to enable backup functionality.';
            $status['action_required'] = 'install';
        } elseif (!$is_active) {
            $status['message'] = 'UpdraftPlus plugin is installed but not active. Please activate it to enable backup functionality.';
            $status['action_required'] = 'activate';
        } else {
            $status['message'] = 'UpdraftPlus plugin is installed and active. Backup functionality is available.';
            $status['action_required'] = 'none';
        }

        return array(
            'success' => true,
            'plugin_status' => $status,
            'backup_ready' => $is_installed && $is_active,
            'timestamp' => current_time('timestamp')
        );
        
    } catch (Exception $e) {
        return array(
            'success' => false,
            'error' => 'Failed to check plugin status: ' . $e->getMessage(),
            'backup_ready' => false
        );
    }
}

/**
 * Verify API key for backup endpoints (reuse existing function if available)
 */
if (!function_exists('wrm_verify_api_key')) {
    function wrm_verify_api_key($request) {
        // Use existing API key verification if available
        if (function_exists('wrm_authenticate_request')) {
            return wrm_authenticate_request($request);
        }
        
        // Fallback verification
        $api_key = $request->get_header('X-API-Key') ?: $request->get_param('api_key');
        $stored_key = get_option('wrm_api_key', '');
        
        if (empty($api_key) || empty($stored_key)) {
            return new WP_Error('missing_api_key', 'API key is required', array('status' => 401));
        }
        
        if ($api_key !== $stored_key) {
            return new WP_Error('invalid_api_key', 'Invalid API key', array('status' => 403));
        }
        
        return true;
    }
}