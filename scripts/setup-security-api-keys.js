#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { securityApiKeys } from '../shared/schema.js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.tqumlkxxzlncilcwoczn:SraCvROITgRPeZLG@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require';

const client = postgres(DATABASE_URL, { ssl: 'require' });
const db = drizzle(client);

async function setupApiKeys() {
  try {
    console.log('🔐 Setting up security API keys...');
    
    // VirusTotal API Key
    const virusTotalKey = '083b0f225cf277364a17d924ac5d4bb289ff6345ede556e4f65a20bad116a9bb';
    
    // WPScan API Key  
    const wpScanKey = 'iOjqiSxpEfHwlWlBa4butsyFSRRXjWZJ5XNsvsMRsFI';
    
    // Insert or update the keys
    await db.insert(securityApiKeys).values([
      {
        keyName: 'virustotal',
        keyValue: virusTotalKey,
        isActive: true,
      },
      {
        keyName: 'wpscan',
        keyValue: wpScanKey,
        isActive: true,
      }
    ]).onConflictDoUpdate({
      target: securityApiKeys.keyName,
      set: {
        keyValue: excluded.keyValue,
        isActive: excluded.isActive,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Security API keys have been configured');
    console.log('   - VirusTotal API key: Set');
    console.log('   - WPScan API key: Set');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up API keys:', error);
    process.exit(1);
  }
}

setupApiKeys();