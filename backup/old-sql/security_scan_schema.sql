-- Security Scan History Table Schema
-- This table stores comprehensive security scan results and history

CREATE TABLE IF NOT EXISTS security_scan_history (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  scan_completed_at TIMESTAMP,
  scan_duration INTEGER, -- in seconds
  scan_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  overall_security_score INTEGER DEFAULT 0, -- 0-100
  threat_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
  
  -- Malware scan results
  malware_status VARCHAR(20) DEFAULT 'clean', -- clean, infected, suspicious, error
  threats_detected INTEGER DEFAULT 0,
  infected_files JSONB DEFAULT '[]', -- Array of infected file paths
  
  -- Blacklist check results
  blacklist_status VARCHAR(20) DEFAULT 'clean', -- clean, blacklisted, error
  services_checked JSONB DEFAULT '[]', -- Array of services checked
  flagged_by JSONB DEFAULT '[]', -- Array of services that flagged the site
  
  -- Vulnerability scan results
  core_vulnerabilities INTEGER DEFAULT 0,
  plugin_vulnerabilities INTEGER DEFAULT 0,
  theme_vulnerabilities INTEGER DEFAULT 0,
  outdated_software JSONB DEFAULT '[]', -- Array of outdated software
  
  -- Security headers check
  security_headers JSONB DEFAULT '{}', -- Object with header status
  
  -- File integrity results
  core_files_modified INTEGER DEFAULT 0,
  suspicious_files JSONB DEFAULT '[]', -- Array of suspicious files
  file_permission_issues JSONB DEFAULT '[]', -- Array of permission issues
  
  -- Additional security checks
  ssl_enabled BOOLEAN DEFAULT FALSE,
  file_permissions_secure BOOLEAN DEFAULT FALSE,
  admin_user_secure BOOLEAN DEFAULT FALSE,
  wp_version_hidden BOOLEAN DEFAULT FALSE,
  login_attempts_limited BOOLEAN DEFAULT FALSE,
  security_plugins_active JSONB DEFAULT '[]', -- Array of active security plugins
  
  -- Full scan data
  full_scan_data JSONB DEFAULT '{}', -- Complete scan results for detailed view
  scan_trigger VARCHAR(50) DEFAULT 'manual', -- manual, scheduled, automated
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_security_scan_website_id ON security_scan_history(website_id);
CREATE INDEX IF NOT EXISTS idx_security_scan_user_id ON security_scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_security_scan_started_at ON security_scan_history(scan_started_at);
CREATE INDEX IF NOT EXISTS idx_security_scan_status ON security_scan_history(scan_status);

-- Update notifications table to reference security scans
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS security_scan_id INTEGER REFERENCES security_scan_history(id);

-- Sample data structure for JSONB fields:

-- infected_files example:
-- ["wp-content/uploads/malicious.php", "wp-includes/suspicious-script.js"]

-- services_checked example:
-- ["Google Safe Browsing", "Norton Safe Web", "McAfee SiteAdvisor", "Sucuri"]

-- flagged_by example:
-- ["Google Safe Browsing", "Norton Safe Web"]

-- outdated_software example:
-- [{"name": "WordPress", "current": "6.1.1", "latest": "6.4.2"}, {"name": "Yoast SEO", "current": "20.1", "latest": "21.7"}]

-- security_headers example:
-- {"x_frame_options": true, "x_content_type_options": false, "x_xss_protection": true, "strict_transport_security": false, "content_security_policy": false}

-- suspicious_files example:
-- ["wp-content/themes/suspicious/hidden.php", "wp-admin/admin-ajax-backup.php"]

-- file_permission_issues example:
-- [{"file": "wp-config.php", "permissions": "777", "recommended": "644"}, {"file": "wp-admin", "permissions": "777", "recommended": "755"}]

-- security_plugins_active example:
-- ["Wordfence Security", "Sucuri Security", "iThemes Security"]

-- full_scan_data example:
-- Complete scan results object containing all detailed information, raw responses, and additional metadata