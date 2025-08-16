import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database Configuration - Use Supabase consistently for development and production
const SUPABASE_URL = 'postgresql://postgres.tqumlkxxzlncilcwoczn:SraCvROITgRPeZLG@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';
const DATABASE_URL = process.env.DATABASE_URL || SUPABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please check your database environment variables.",
  );
}

console.log('🔗 Connecting to database:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown');

// Determine SSL configuration based on database provider
let connectionConfig: any = {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
};

// For external providers like Neon, Supabase, etc., enable SSL
if (DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('supabase.co') || DATABASE_URL.includes('sslmode=require')) {
  connectionConfig.ssl = 'require';
} else if (DATABASE_URL.includes('replit') || DATABASE_URL.includes('repl.co') || DATABASE_URL.includes('localhost')) {
  // For Replit PostgreSQL, disable SSL
  connectionConfig.ssl = false;
} else {
  // For other providers, disable SSL by default (can be overridden with sslmode in URL)
  connectionConfig.ssl = false;
}

// Create postgres client
const client = postgres(DATABASE_URL, connectionConfig);

export const db = drizzle(client, { schema });