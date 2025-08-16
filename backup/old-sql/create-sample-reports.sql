-- Insert sample client reports for testing
INSERT INTO client_reports (
  user_id,
  template_id,
  title,
  client_id,
  website_ids,
  date_from,
  date_to,
  status,
  report_data,
  email_recipients,
  created_at,
  updated_at
) VALUES 
(
  1, -- Assuming user ID 1 exists
  NULL,
  'Monthly Security & SEO Report - August 2025',
  1, -- Assuming client ID 1 exists
  '[1, 2]'::jsonb, -- Website IDs as JSON array
  '2025-08-01'::timestamp,
  '2025-08-31'::timestamp,
  'draft',
  '{}'::jsonb,
  '["client@example.com"]'::jsonb,
  NOW(),
  NOW()
),
(
  1,
  NULL,
  'Weekly Performance Report - Week 32',
  1,
  '[1]'::jsonb,
  '2025-08-01'::timestamp,
  '2025-08-07'::timestamp,
  'draft',
  '{}'::jsonb,
  '["client@example.com"]'::jsonb,
  NOW(),
  NOW()
);