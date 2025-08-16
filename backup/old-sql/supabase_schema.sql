-- WordPress SaaS Platform - Complete Database Schema for Supabase
-- Import this SQL into your Supabase database manually

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (required for authentication)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index for session expiration
CREATE INDEX IDX_session_expire ON sessions (expire);

-- Users table with comprehensive profile and subscription fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    company VARCHAR(255),
    bio TEXT,
    website VARCHAR(500),
    location VARCHAR(255),
    avatar VARCHAR(500),
    profile_image_url VARCHAR(500),
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    security_alerts BOOLEAN DEFAULT true,
    maintenance_updates BOOLEAN DEFAULT true,
    weekly_reports BOOLEAN DEFAULT true,
    
    -- Stripe integration fields
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, maintain, protect, perform
    subscription_status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, canceled, past_due
    subscription_ends_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- maintain, protect, perform
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    monthly_price INTEGER NOT NULL, -- Price in cents
    yearly_price INTEGER NOT NULL, -- Price in cents
    features JSONB NOT NULL, -- Array of feature descriptions
    is_active BOOLEAN DEFAULT true,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, pending
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Websites table with WordPress management fields
CREATE TABLE websites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    wp_admin_username VARCHAR(255),
    wp_admin_password VARCHAR(255), -- Should be encrypted in production
    worker_api_key VARCHAR(255), -- WordPress Maintenance Worker plugin API key
    wp_version VARCHAR(50),
    last_backup TIMESTAMP,
    last_update TIMESTAMP,
    last_sync TIMESTAMP,
    health_status VARCHAR(20) NOT NULL DEFAULT 'good', -- good, warning, error
    uptime VARCHAR(10) DEFAULT '100%',
    connection_status VARCHAR(20) DEFAULT 'disconnected', -- connected, disconnected, error
    wp_data TEXT, -- JSON storage for WordPress data (plugins, themes, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE
);

-- Tasks table for maintenance and management tasks
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- update, backup, security, maintenance
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, overdue
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE
);

-- Performance scans table for website monitoring
CREATE TABLE performance_scans (
    id SERIAL PRIMARY KEY,
    website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    scan_timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    scan_region VARCHAR(50) NOT NULL DEFAULT 'us-east-1',
    pagespeed_score INTEGER NOT NULL,
    yslow_score INTEGER NOT NULL,
    core_web_vitals_grade VARCHAR(20) NOT NULL, -- good, needs-improvement, poor
    lcp_score INTEGER NOT NULL,
    fid_score INTEGER NOT NULL,
    cls_score INTEGER NOT NULL,
    scan_data JSONB NOT NULL, -- Full scan results as JSON
    recommendations JSONB NOT NULL, -- Performance recommendations
    previous_score INTEGER,
    score_change INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_websites_client_id ON websites(client_id);
CREATE INDEX idx_tasks_website_id ON tasks(website_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_performance_scans_website_id ON performance_scans(website_id);
CREATE INDEX idx_performance_scans_timestamp ON performance_scans(scan_timestamp);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, monthly_price, yearly_price, features) VALUES
('maintain', 'Maintain Plan', 'Essential WordPress maintenance and monitoring', 2900, 29000, '["Site monitoring", "Automatic updates", "Basic security", "Email support"]'),
('protect', 'Protect Plan', 'Advanced security and performance optimization', 4900, 49000, '["Everything in Maintain", "Advanced security", "Performance optimization", "Priority support", "Daily backups"]'),
('perform', 'Perform Plan', 'Complete WordPress management solution', 9900, 99000, '["Everything in Protect", "White-label reports", "Custom integrations", "24/7 phone support", "Multiple sites"]');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at field
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (basic examples - adjust based on your needs)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Clients can only be accessed by their owner
CREATE POLICY "Users can view own clients" ON clients
    FOR ALL USING (user_id = auth.uid());

-- Websites can only be accessed through client ownership
CREATE POLICY "Users can view websites through clients" ON websites
    FOR ALL USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Tasks can only be accessed through client ownership
CREATE POLICY "Users can view tasks through clients" ON tasks
    FOR ALL USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

-- Performance scans can only be accessed through website ownership
CREATE POLICY "Users can view performance scans through websites" ON performance_scans
    FOR ALL USING (website_id IN (
        SELECT w.id FROM websites w 
        JOIN clients c ON w.client_id = c.id 
        WHERE c.user_id = auth.uid()
    ));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with profile and subscription information';
COMMENT ON TABLE clients IS 'Client records managed by users';
COMMENT ON TABLE websites IS 'WordPress websites with connection and monitoring data';
COMMENT ON TABLE tasks IS 'Maintenance and management tasks for websites';
COMMENT ON TABLE performance_scans IS 'Website performance monitoring results';
COMMENT ON TABLE subscription_plans IS 'Available subscription tiers and pricing';
COMMENT ON TABLE sessions IS 'Session storage for authentication (required)';