# WordPress Maintenance Dashboard - Database Schema Documentation

## Overview

This document provides a comprehensive overview of the PostgreSQL database structure for the WordPress Maintenance Dashboard. The application uses Drizzle ORM with PostgreSQL for type-safe database operations and robust data management.

## Database Connection

- **Provider**: Replit PostgreSQL (Development) / Supabase PostgreSQL (Production)
- **Connection**: Managed via `DATABASE_URL` environment variable
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Handled through Drizzle Kit (`npm run db:push`)

## Table Structure

### Core Entity Relationships

```
users (1) ←→ (n) clients (1) ←→ (n) websites (1) ←→ (n) tasks
                                       ↓
                                performance_scans (n)
```

## Tables Overview

### 1. sessions
**Purpose**: Session storage for authentication (mandatory for Replit Auth compatibility)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| sid | varchar (PK) | Primary Key | Session identifier |
| sess | jsonb | NOT NULL | Session data |
| expire | timestamp | NOT NULL | Session expiration time |

**Indexes**: 
- `IDX_session_expire` on `expire` column

### 2. users
**Purpose**: User authentication and profile management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | Primary Key | Unique user identifier |
| email | varchar(255) | UNIQUE, NOT NULL | User email address |
| password | varchar(255) | NOT NULL | Hashed password (bcrypt) |
| first_name | varchar(100) | | User's first name |
| last_name | varchar(100) | | User's last name |
| phone | varchar(50) | | Contact phone number |
| company | varchar(255) | | Company name |
| bio | text | | User biography |
| website | varchar(500) | | Personal/company website |
| location | varchar(255) | | Geographic location |
| avatar | varchar(500) | | Avatar image URL |
| profile_image_url | varchar(500) | | Profile image URL |

**Notification Preferences**:
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| email_notifications | boolean | true | Email notification preference |
| push_notifications | boolean | true | Push notification preference |
| sms_notifications | boolean | false | SMS notification preference |
| security_alerts | boolean | true | Security alert preference |
| maintenance_updates | boolean | true | Maintenance update preference |
| weekly_reports | boolean | true | Weekly report preference |

**Subscription Management**:
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| stripe_customer_id | varchar(255) | | Stripe customer identifier |
| stripe_subscription_id | varchar(255) | | Stripe subscription identifier |
| subscription_plan | varchar(50) | 'free' | Current plan (free, maintain, protect, perform) |
| subscription_status | varchar(50) | 'inactive' | Status (active, inactive, canceled, past_due) |
| subscription_ends_at | timestamp | | Subscription end date |

**Timestamps**:
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| created_at | timestamp | NOW() | Account creation timestamp |
| updated_at | timestamp | NOW() | Last update timestamp |

### 3. subscription_plans
**Purpose**: Available subscription plan definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | Primary Key | Plan identifier |
| name | varchar(50) | UNIQUE, NOT NULL | Plan name (maintain, protect, perform) |
| display_name | varchar(100) | NOT NULL | Display name for UI |
| description | text | | Plan description |
| monthly_price | integer | NOT NULL | Monthly price in cents |
| yearly_price | integer | NOT NULL | Yearly price in cents |
| features | jsonb | NOT NULL | Feature list array |
| is_active | boolean | true | Plan availability status |
| stripe_price_id_monthly | varchar(255) | | Stripe monthly price ID |
| stripe_price_id_yearly | varchar(255) | | Stripe yearly price ID |
| created_at | timestamp | NOW() | Plan creation timestamp |
| updated_at | timestamp | NOW() | Last update timestamp |

### 4. clients
**Purpose**: Business clients managed by users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | Primary Key | Client identifier |
| name | varchar(255) | NOT NULL | Client name |
| email | varchar(255) | NOT NULL | Client email address |
| phone | varchar(50) | | Client phone number |
| company | varchar(255) | | Client company name |
| status | varchar(20) | 'active' | Client status (active, inactive, pending) |
| user_id | integer | FK to users.id | Owner user reference |
| created_at | timestamp | NOW() | Client creation timestamp |
| updated_at | timestamp | NOW() | Last update timestamp |

### 5. websites
**Purpose**: WordPress websites managed for clients

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | Primary Key | Website identifier |
| name | varchar(255) | NOT NULL | Website display name |
| url | varchar(500) | NOT NULL | Website URL |
| wp_admin_username | varchar(255) | | WordPress admin username |
| wp_admin_password | varchar(255) | | WordPress admin password (encrypted) |
| worker_api_key | varchar(255) | | WordPress Worker Plugin API key |
| wp_version | varchar(50) | | Current WordPress version |
| last_backup | timestamp | | Last backup timestamp |
| last_update | timestamp | | Last update timestamp |
| last_sync | timestamp | | Last data sync timestamp |
| health_status | varchar(20) | 'good' | Health status (good, warning, error) |
| uptime | varchar(10) | '100%' | Uptime percentage |
| connection_status | varchar(20) | 'disconnected' | Connection status |
| wp_data | text | | JSON storage for WordPress data |
| client_id | integer | FK to clients.id | Associated client reference |
| created_at | timestamp | NOW() | Website creation timestamp |
| updated_at | timestamp | NOW() | Last update timestamp |

### 6. tasks
**Purpose**: Maintenance tasks and activities

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | Primary Key | Task identifier |
| title | varchar(255) | NOT NULL | Task title |
| description | text | | Task description |
| type | varchar(50) | NOT NULL | Task type (update, backup, security, maintenance) |
| status | varchar(20) | 'pending' | Task status (pending, in_progress, completed, overdue) |
| priority | varchar(20) | 'medium' | Priority level (low, medium, high, urgent) |
| due_date | timestamp | | Task due date |
| completed_at | timestamp | | Task completion timestamp |
| website_id | integer | FK to websites.id | Associated website reference |
| client_id | integer | FK to clients.id | Associated client reference |
| created_at | timestamp | NOW() | Task creation timestamp |
| updated_at | timestamp | NOW() | Last update timestamp |

### 7. performance_scans
**Purpose**: Website performance monitoring data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | Primary Key | Scan identifier |
| website_id | integer | FK to websites.id | Associated website reference |
| scan_timestamp | timestamp | NOW() | Scan execution time |
| scan_region | varchar(50) | 'us-east-1' | Scan region |
| pagespeed_score | integer | NOT NULL | PageSpeed Insights score |
| yslow_score | integer | NOT NULL | YSlow performance score |
| core_web_vitals_grade | varchar(20) | NOT NULL | Core Web Vitals grade |
| lcp_score | integer | NOT NULL | Largest Contentful Paint score |
| fid_score | integer | NOT NULL | First Input Delay score |
| cls_score | integer | NOT NULL | Cumulative Layout Shift score |
| scan_data | jsonb | NOT NULL | Complete scan results |
| recommendations | jsonb | NOT NULL | Performance recommendations |
| previous_score | integer | | Previous scan score |
| score_change | integer | | Score change from previous scan |
| created_at | timestamp | NOW() | Scan creation timestamp |

## Data Relationships

### User → Client → Website → Task Hierarchy
- Each **user** can have multiple **clients**
- Each **client** can have multiple **websites**
- Each **website** can have multiple **tasks**
- **Performance scans** are directly linked to **websites**

### Access Control
All data access is controlled through user ownership:
- **Clients** are filtered by `user_id`
- **Websites** are accessed through client ownership validation
- **Tasks** are filtered through client ownership
- **Performance scans** are validated through website ownership

## CRUD Operations Summary

### User Management
- ✅ **Create**: User registration with password hashing
- ✅ **Read**: User profile retrieval and authentication
- ✅ **Update**: Profile updates, password changes, notification preferences
- ✅ **Delete**: Not implemented (data retention policy)

### Client Management
- ✅ **Create**: Add new clients with user association
- ✅ **Read**: List user's clients with filtering
- ✅ **Update**: Client information updates
- ✅ **Delete**: Client removal with cascade considerations

### Website Management
- ✅ **Create**: Add websites to clients with WordPress connection details
- ✅ **Read**: Retrieve websites with WordPress data integration
- ✅ **Update**: Website configuration and WordPress data sync
- ✅ **Delete**: Website removal with task cleanup

### Task Management
- ✅ **Create**: Create maintenance tasks for websites
- ✅ **Read**: Retrieve tasks with filtering by status, priority, and date
- ✅ **Update**: Task status updates and completion tracking
- ✅ **Delete**: Task removal

### Performance Monitoring
- ✅ **Create**: Store performance scan results
- ✅ **Read**: Retrieve scan history and latest results
- ✅ **Update**: Update scan data with score changes
- ✅ **Delete**: Historical data cleanup

### Subscription Management
- ✅ **Create**: Subscription plan creation
- ✅ **Read**: Plan listing and user subscription status
- ✅ **Update**: User subscription changes and Stripe integration
- ✅ **Delete**: Plan deactivation

## Data Storage Patterns

### JSON Storage
- **websites.wp_data**: WordPress plugin, theme, and system information
- **performance_scans.scan_data**: Complete performance analysis results
- **performance_scans.recommendations**: Optimization suggestions
- **subscription_plans.features**: Plan feature lists

### Timestamp Management
- All tables include `created_at` and `updated_at` timestamps
- Automatic timestamp updates on record modifications
- Task completion tracking with `completed_at`

### Security Considerations
- Passwords stored with bcrypt hashing
- WordPress credentials should be encrypted in production
- User data isolation through ownership validation
- Session management for authentication

## Database Optimization

### Indexes
- Primary keys on all tables
- Foreign key indexes for relationships
- Session expiration index for cleanup
- Consider adding indexes on frequently queried columns:
  - `users.email` (already unique)
  - `websites.health_status`
  - `tasks.status` and `tasks.priority`
  - `performance_scans.scan_timestamp`

### Query Optimization
- User data filtering implemented at database level
- JOIN operations for related data retrieval
- Pagination support for large datasets
- Efficient counting queries for dashboard statistics

## Backup and Migration Strategy

### Development (Replit PostgreSQL)
- Automatic backups managed by Replit
- Schema migrations through Drizzle Kit
- Development data seeding through application

### Production (Supabase)
- Point-in-time recovery available
- Regular automated backups
- Schema migrations through Drizzle migrations
- Environment variable configuration for connection

## Performance Considerations

### Connection Management
- Connection pooling through Drizzle ORM
- Environment-based configuration
- Proper connection cleanup

### Query Performance
- Efficient JOIN operations for user data filtering
- Indexed foreign key relationships
- Optimized dashboard statistics queries
- WordPress data caching in `wp_data` field

### Scalability
- Horizontal scaling support through Supabase
- Efficient data access patterns
- Minimal database round trips for dashboard operations