-- Migration script to update users table and related tables for custom authentication

-- Drop existing foreign key constraints
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_users_id_fk;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_client_id_clients_id_fk;
ALTER TABLE websites DROP CONSTRAINT IF EXISTS websites_client_id_clients_id_fk;

-- Drop and recreate users table with new schema
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id serial PRIMARY KEY,
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  first_name varchar(100),
  last_name varchar(100),
  profile_image_url varchar(500),
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Update clients table to use integer user_id
ALTER TABLE clients DROP COLUMN IF EXISTS user_id;
ALTER TABLE clients ADD COLUMN user_id integer NOT NULL REFERENCES users(id);

-- Recreate foreign key constraints
ALTER TABLE websites ADD CONSTRAINT websites_client_id_clients_id_fk 
  FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_client_id_clients_id_fk 
  FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_website_id_websites_id_fk 
  FOREIGN KEY (website_id) REFERENCES websites(id);