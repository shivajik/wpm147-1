-- SEO Analysis Database Schema
-- Import this SQL manually to create the required tables

-- Main SEO Reports table
CREATE TABLE IF NOT EXISTS seo_reports (
    id SERIAL PRIMARY KEY,
    website_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- in_progress, completed, failed
    overall_score INTEGER, -- 0-100 score, null while in progress
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP, -- null until analysis completes
    report_data JSONB NOT NULL DEFAULT '{}', -- stores full analysis results
    error_message TEXT, -- stores error if analysis fails
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Metrics detailed breakdown table
CREATE TABLE IF NOT EXISTS seo_metrics (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL REFERENCES seo_reports(id) ON DELETE CASCADE,
    technical_seo INTEGER, -- 0-100 score
    content_quality INTEGER, -- 0-100 score
    user_experience INTEGER, -- 0-100 score
    mobile_optimization INTEGER, -- 0-100 score
    site_speed INTEGER, -- 0-100 score
    security INTEGER, -- 0-100 score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Issues tracking table
CREATE TABLE IF NOT EXISTS seo_issues (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL REFERENCES seo_reports(id) ON DELETE CASCADE,
    issue_type VARCHAR(20) NOT NULL, -- critical, warning, suggestion
    issue_category VARCHAR(50) NOT NULL, -- technical, content, performance, etc.
    issue_title VARCHAR(255) NOT NULL,
    issue_description TEXT,
    page_url VARCHAR(500), -- specific page where issue was found
    recommendation TEXT,
    priority INTEGER DEFAULT 5, -- 1-10 priority scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Recommendations table
CREATE TABLE IF NOT EXISTS seo_recommendations (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL REFERENCES seo_reports(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- technical, content, performance, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact VARCHAR(20) NOT NULL, -- high, medium, low
    difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard
    estimated_time VARCHAR(50), -- e.g., "2-4 hours", "1 week"
    priority INTEGER DEFAULT 5, -- 1-10 priority scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Page Analysis table (for individual page analysis)
CREATE TABLE IF NOT EXISTS seo_page_analysis (
    id SERIAL PRIMARY KEY,
    seo_report_id INTEGER NOT NULL REFERENCES seo_reports(id) ON DELETE CASCADE,
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
    page_load_time DECIMAL(5,2), -- in seconds
    mobile_score INTEGER, -- 0-100
    desktop_score INTEGER, -- 0-100
    issues_found JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table for SEO report completion alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    seo_report_id INTEGER REFERENCES seo_reports(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- seo_report_completed, seo_analysis_failed, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500), -- link to view the report
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_reports_website_id ON seo_reports(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_reports_status ON seo_reports(status);
CREATE INDEX IF NOT EXISTS idx_seo_reports_created_at ON seo_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_report_id ON seo_metrics(seo_report_id);
CREATE INDEX IF NOT EXISTS idx_seo_issues_report_id ON seo_issues(seo_report_id);
CREATE INDEX IF NOT EXISTS idx_seo_issues_type ON seo_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_seo_recommendations_report_id ON seo_recommendations(seo_report_id);
CREATE INDEX IF NOT EXISTS idx_seo_page_analysis_report_id ON seo_page_analysis(seo_report_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

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

-- Insert sample data for testing (optional)
-- Uncomment the following lines if you want sample data

/*
-- Sample SEO report (completed)
INSERT INTO seo_reports (website_id, status, overall_score, completed_at, report_data) 
VALUES (
    1, 
    'completed', 
    85, 
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    '{"analysis_version": "1.0", "total_pages_analyzed": 15, "analysis_duration": 120}'
);

-- Sample SEO metrics for the above report
INSERT INTO seo_metrics (seo_report_id, technical_seo, content_quality, user_experience, mobile_optimization, site_speed, security)
VALUES (1, 88, 82, 90, 85, 78, 95);

-- Sample SEO issues
INSERT INTO seo_issues (seo_report_id, issue_type, issue_category, issue_title, issue_description, recommendation, priority)
VALUES 
(1, 'critical', 'technical', 'Missing meta descriptions', '5 pages are missing meta descriptions', 'Add unique meta descriptions for each page', 8),
(1, 'warning', 'performance', 'Large image files', 'Several images are larger than 1MB', 'Optimize images and use WebP format', 6),
(1, 'suggestion', 'content', 'Low word count', 'Some pages have less than 300 words', 'Expand content with relevant information', 4);

-- Sample recommendations
INSERT INTO seo_recommendations (seo_report_id, category, title, description, impact, difficulty, estimated_time, priority)
VALUES 
(1, 'technical', 'Implement schema markup', 'Add structured data to improve search engine understanding', 'high', 'medium', '4-6 hours', 9),
(1, 'performance', 'Optimize Core Web Vitals', 'Improve LCP, FID, and CLS scores', 'high', 'hard', '1-2 weeks', 10),
(1, 'content', 'Update outdated content', 'Review and refresh content from 2022', 'medium', 'easy', '2-3 hours', 5);
*/

-- Verification queries (run these after import to confirm tables were created)
/*
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
*/