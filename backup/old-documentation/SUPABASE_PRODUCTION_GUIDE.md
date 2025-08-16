# Supabase Production Integration Guide

## Overview

This comprehensive guide provides step-by-step instructions for integrating the WordPress Maintenance Dashboard with Supabase PostgreSQL for production deployment. Supabase offers a fully managed PostgreSQL database with additional features like real-time subscriptions, built-in authentication, and automatic backups.

## Prerequisites

- Supabase account (free tier available)
- Production deployment environment (Replit Deployments, Vercel, Railway, etc.)
- Administrative access to configure environment variables
- Basic understanding of PostgreSQL and database management

## Part 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. **Sign up/Login to Supabase**
   - Visit [https://supabase.com](https://supabase.com)
   - Create account or login with existing credentials
   - Navigate to Dashboard

2. **Create New Project**
   ```
   Project Name: wp-maintenance-dashboard
   Organization: [Your Organization]
   Region: [Choose closest to your users]
   Database Password: [Generate strong password - SAVE THIS]
   ```

3. **Wait for Project Provisioning**
   - Typically takes 1-2 minutes
   - Project will appear in dashboard when ready

### 1.2 Configure Database Settings

1. **Access Project Settings**
   - Navigate to Settings → Database
   - Note the connection details

2. **Connection Information**
   ```
   Host: [project-ref].supabase.co
   Database name: postgres
   Port: 5432
   User: postgres
   Password: [password from setup]
   ```

3. **Connection String Format**
   ```
   postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   ```

## Part 2: Database Migration

### 2.1 Schema Deployment

1. **Update Drizzle Configuration**
   ```typescript
   // drizzle.config.ts
   import { defineConfig } from "drizzle-kit";
   
   export default defineConfig({
     schema: "./shared/schema.ts",
     out: "./migrations",
     dialect: "postgresql",
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
     verbose: true,
     strict: true,
   });
   ```

2. **Environment Variables Setup**
   ```bash
   # .env (for local testing)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Generate and Push Schema**
   ```bash
   # Generate migration files
   npm run db:generate
   
   # Push schema to Supabase
   npm run db:push
   
   # Verify tables created
   npm run db:studio
   ```

### 2.2 Initial Data Seeding

1. **Subscription Plans Setup**
   ```bash
   # Run the seeding script
   npm run seed:plans
   ```

2. **Create Admin User** (Optional)
   ```sql
   -- Execute in Supabase SQL Editor
   INSERT INTO users (
     email, 
     password, 
     first_name, 
     last_name, 
     subscription_plan, 
     subscription_status
   ) VALUES (
     'admin@yourdomain.com',
     '$2b$10$[bcrypt-hashed-password]',
     'Admin',
     'User',
     'perform',
     'active'
   );
   ```

## Part 3: Application Configuration

### 3.1 Environment Variables

**Production Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"

# Application
NODE_ENV="production"
PORT="5000"

# Optional: Stripe Integration
STRIPE_SECRET_KEY="sk_live_[your-stripe-secret]"
STRIPE_WEBHOOK_SECRET="whsec_[your-webhook-secret]"

# Optional: Email Service
SMTP_HOST="smtp.yourprovider.com"
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-app-password"
```

### 3.2 Database Connection Setup

1. **Update Database Client**
   ```typescript
   // server/db.ts
   import { drizzle } from "drizzle-orm/postgres-js";
   import postgres from "postgres";
   
   const connectionString = process.env.DATABASE_URL!;
   
   // Configure for production
   const client = postgres(connectionString, {
     ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
     max: 10, // Connection pool size
     idle_timeout: 20,
     connect_timeout: 60,
   });
   
   export const db = drizzle(client);
   ```

2. **Connection Health Check**
   ```typescript
   // server/health.ts
   export async function checkDatabaseHealth(): Promise<boolean> {
     try {
       await db.execute(sql`SELECT 1`);
       return true;
     } catch (error) {
       console.error('Database health check failed:', error);
       return false;
     }
   }
   ```

## Part 4: Deployment Configuration

### 4.1 Replit Deployments

1. **Deployment Settings**
   ```toml
   # .replit
   [deployment]
   build = "npm install && npm run build"
   run = "npm start"
   
   [env]
   DATABASE_URL.description = "Supabase PostgreSQL connection string"
   JWT_SECRET.description = "JWT secret for authentication"
   ```

2. **Production Build Command**
   ```json
   // package.json
   {
     "scripts": {
       "build": "tsc && vite build",
       "start": "node dist/index.js",
       "deploy": "npm run build && npm run db:push"
     }
   }
   ```

### 4.2 Alternative Deployments

**Railway.app:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway add DATABASE_URL=[supabase-url]
railway deploy
```

**Vercel (API + Static):**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {"src": "server/index.ts", "use": "@vercel/node"},
    {"src": "dist/**", "use": "@vercel/static"}
  ],
  "routes": [
    {"src": "/api/(.*)", "dest": "/server/index.ts"},
    {"src": "/(.*)", "dest": "/dist/$1"}
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

## Part 5: Security and Performance

### 5.1 Database Security

1. **Row Level Security (RLS)**
   ```sql
   -- Enable RLS on sensitive tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
   
   -- Create policies (if using Supabase Auth)
   CREATE POLICY "Users can view own data" ON users
   FOR ALL USING (auth.uid() = id);
   ```

2. **Connection Security**
   ```typescript
   // Ensure SSL in production
   const connectionString = process.env.DATABASE_URL!;
   const client = postgres(connectionString, {
     ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
     // Additional security options
     prepare: false,
     transform: postgres.camel
   });
   ```

### 5.2 Performance Optimization

1. **Connection Pooling**
   ```typescript
   // Optimize connection pool
   const client = postgres(connectionString, {
     max: process.env.NODE_ENV === 'production' ? 20 : 5,
     idle_timeout: 20,
     connect_timeout: 60,
     prepare: false
   });
   ```

2. **Query Optimization**
   ```sql
   -- Add performance indexes
   CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
   CREATE INDEX IF NOT EXISTS idx_websites_client_id ON websites(client_id);
   CREATE INDEX IF NOT EXISTS idx_tasks_website_id ON tasks(website_id);
   CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
   CREATE INDEX IF NOT EXISTS idx_performance_scans_website_timestamp 
   ON performance_scans(website_id, scan_timestamp DESC);
   ```

## Part 6: Monitoring and Maintenance

### 6.1 Supabase Dashboard Monitoring

1. **Database Metrics**
   - CPU Usage
   - Memory Consumption
   - Active Connections
   - Query Performance

2. **Set Up Alerts**
   ```
   Supabase Dashboard → Settings → Billing → Usage Alerts
   - Database Size Limit
   - Bandwidth Usage
   - API Requests
   ```

### 6.2 Application Health Monitoring

1. **Health Check Endpoint**
   ```typescript
   // server/routes.ts
   app.get('/health', async (req, res) => {
     const dbHealth = await checkDatabaseHealth();
     res.json({
       status: 'ok',
       database: dbHealth ? 'connected' : 'error',
       timestamp: new Date().toISOString()
     });
   });
   ```

2. **Error Logging**
   ```typescript
   // Implement proper error logging
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.Console()
     ]
   });
   ```

## Part 7: Backup and Disaster Recovery

### 7.1 Automated Backups

1. **Supabase Backup Settings**
   ```
   Supabase Dashboard → Settings → Database → Backups
   - Point-in-time recovery enabled by default
   - Daily automated backups
   - Configure retention period
   ```

2. **Manual Backup Process**
   ```bash
   # Create manual backup
   pg_dump "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" > backup.sql
   
   # Restore from backup
   psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" < backup.sql
   ```

### 7.2 Data Migration Scripts

1. **Export Data Script**
   ```typescript
   // scripts/export-data.ts
   import { db } from '../server/db.js';
   import { users, clients, websites, tasks } from '../shared/schema.js';
   
   async function exportData() {
     const allUsers = await db.select().from(users);
     const allClients = await db.select().from(clients);
     // ... export logic
   }
   ```

## Part 8: Troubleshooting Guide

### 8.1 Common Issues

**Connection Timeout:**
```typescript
// Increase timeout values
const client = postgres(connectionString, {
  connect_timeout: 120,
  idle_timeout: 30,
  max_lifetime: 300
});
```

**SSL Certificate Issues:**
```bash
# For development/testing only
export PGSSLMODE=require
# Or in connection string
postgresql://user:pass@host:5432/db?sslmode=require
```

**Migration Conflicts:**
```bash
# Reset migrations (careful in production!)
rm -rf migrations/
npm run db:generate
npm run db:push --force
```

### 8.2 Performance Issues

**Slow Queries:**
```sql
-- Enable query logging in Supabase
-- Dashboard → Settings → Database → Query Performance
-- Identify slow queries and add indexes

-- Example: Add missing indexes
CREATE INDEX CONCURRENTLY idx_websites_health_status ON websites(health_status);
```

**Memory Issues:**
```typescript
// Implement query pagination
const getWebsitesPaginated = async (page: number, limit: number) => {
  return await db
    .select()
    .from(websites)
    .limit(limit)
    .offset(page * limit);
};
```

## Part 9: Cost Optimization

### 9.1 Supabase Pricing Tiers

**Free Tier Limits:**
- 500MB database size
- 2GB bandwidth
- 50,000 monthly active users
- 500,000 Edge Function invocations

**Pro Tier ($25/month):**
- 8GB database size
- 250GB bandwidth
- 100,000 monthly active users
- 2,000,000 Edge Function invocations

### 9.2 Optimization Strategies

1. **Database Size Management**
   ```sql
   -- Regular cleanup of old performance scans
   DELETE FROM performance_scans 
   WHERE scan_timestamp < NOW() - INTERVAL '90 days';
   
   -- Archive old tasks
   CREATE TABLE tasks_archive AS 
   SELECT * FROM tasks WHERE created_at < NOW() - INTERVAL '1 year';
   ```

2. **Efficient Queries**
   ```typescript
   // Use select specific columns
   const users = await db
     .select({ id: users.id, email: users.email })
     .from(users)
     .where(eq(users.subscriptionStatus, 'active'));
   ```

## Part 10: Migration Checklist

### Pre-Migration
- [ ] Supabase project created and configured
- [ ] Environment variables documented
- [ ] Database schema tested locally
- [ ] Backup strategy implemented
- [ ] Performance monitoring setup

### Migration Day
- [ ] Deploy database schema to Supabase
- [ ] Migrate existing data (if any)
- [ ] Update application environment variables
- [ ] Deploy application to production
- [ ] Run health checks
- [ ] Monitor for 24 hours

### Post-Migration
- [ ] Verify all CRUD operations working
- [ ] Test authentication flow
- [ ] Validate WordPress integrations
- [ ] Set up monitoring alerts
- [ ] Document any issues and resolutions

## Support and Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Community Support
- [Supabase Discord](https://discord.supabase.com/)
- [Drizzle Discord](https://discord.gg/yfjTbVXMW4)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

This guide provides a comprehensive approach to migrating from development to production with Supabase. Follow each section carefully and test thoroughly in a staging environment before production deployment.