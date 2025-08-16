-- SEO Analysis Database Schema (Fixed Version)
-- Import this SQL manually to create the required tables

-- Main SEO Reports table
CREATE TABLE seo_reports (
    id SERIAL PRIMARY KEY,
    website_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    overall_score INTEGER,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    report_data JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Metrics detailed breakdown table
CREATE TABLE seo_metrics (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL,
    technical_seo INTEGER,
    content_quality INTEGER,
    user_experience INTEGER,
    mobile_optimization INTEGER,
    site_speed INTEGER,
    security INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Issues tracking table
CREATE TABLE seo_issues (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL,
    issue_type VARCHAR(20) NOT NULL,
    issue_category VARCHAR(50) NOT NULL,
    issue_title VARCHAR(255) NOT NULL,
    issue_description TEXT,
    page_url VARCHAR(500),
    recommendation TEXT,
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Recommendations table
CREATE TABLE seo_recommendations (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    estimated_time VARCHAR(50),
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Page Analysis table
CREATE TABLE seo_page_analysis (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    meta_description TEXT,
    h1_tags INTEGER DEFAULT 0,
    h2_tags INTEGER DEFAULT 0,
    h3_tags INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    images_total INTEGER DEFAULT 0,
    images_with_alt INTEGER DEFAULT 0,
    internal_links INTEGER DEFAULT 0,
    external_links INTEGER DEFAULT 0,
    page_load_time DECIMAL(5,2),
    mobile_score INTEGER,
    desktop_score INTEGER,
    issues_found JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    website_id INTEGER,
    seo_report_id INTEGER,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_seo_reports_website_id ON seo_reports(website_id);
CREATE INDEX idx_seo_reports_status ON seo_reports(status);
CREATE INDEX idx_seo_reports_created_at ON seo_reports(created_at);
CREATE INDEX idx_seo_metrics_report_id ON seo_metrics(seo_report_id);
CREATE INDEX idx_seo_issues_report_id ON seo_issues(seo_report_id);
CREATE INDEX idx_seo_issues_type ON seo_issues(issue_type);
CREATE INDEX idx_seo_recommendations_report_id ON seo_recommendations(seo_report_id);
CREATE INDEX idx_seo_page_analysis_report_id ON seo_page_analysis(seo_report_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Add updated_at trigger for seo_reports
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seo_reports_updated_at 
    BEFORE UPDATE ON seo_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraints after tables are created
ALTER TABLE seo_reports ADD CONSTRAINT fk_seo_reports_website_id FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE;
ALTER TABLE seo_metrics ADD CONSTRAINT fk_seo_metrics_report_id FOREIGN KEY (seo_report_id) REFERENCES seo_reports(id) ON DELETE CASCADE;
ALTER TABLE seo_issues ADD CONSTRAINT fk_seo_issues_report_id FOREIGN KEY (seo_report_id) REFERENCES seo_reports(id) ON DELETE CASCADE;
ALTER TABLE seo_recommendations ADD CONSTRAINT fk_seo_recommendations_report_id FOREIGN KEY (seo_report_id) REFERENCES seo_reports(id) ON DELETE CASCADE;
ALTER TABLE seo_page_analysis ADD CONSTRAINT fk_seo_page_analysis_report_id FOREIGN KEY (seo_report_id) REFERENCES seo_reports(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_website_id FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_seo_report_id FOREIGN KEY (seo_report_id) REFERENCES seo_reports(id) ON DELETE CASCADE;

-- Verification query (run this after import to confirm tables were created)
SELECT 'seo_reports' as table_name, count(*) as row_count FROM seo_reports
UNION ALL
SELECT 'seo_metrics' as table_name, count(*) as row_count FROM seo_metrics
UNION ALL
SELECT 'seo_issues' as table_name, count(*) as row_count FROM seo_issues
UNION ALL
SELECT 'seo_recommendations' as table_name, count(*) as row_count FROM seo_recommendations
UNION ALL
SELECT 'seo_page_analysis' as table_name, count(*) as row_count FROM seo_page_analysis
UNION ALL
SELECT 'notifications' as table_name, count(*) as row_count FROM notifications;