import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function fixNotificationsTable() {
  try {
    console.log('Fixing notifications table schema...');
    
    // Drop and recreate the table with correct schema
    await db.execute(sql`DROP TABLE IF EXISTS notifications;`);
    
    // Create notifications table with correct schema including seo_report_id
    await db.execute(sql`
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
        seo_report_id INTEGER REFERENCES seo_reports(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        action_url VARCHAR(500),
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await db.execute(sql`CREATE INDEX idx_notifications_user_id ON notifications(user_id);`);
    await db.execute(sql`CREATE INDEX idx_notifications_website_id ON notifications(website_id);`);
    await db.execute(sql`CREATE INDEX idx_notifications_is_read ON notifications(is_read);`);
    await db.execute(sql`CREATE INDEX idx_notifications_created_at ON notifications(created_at);`);

    console.log('✅ Notifications table fixed successfully!');
    
    // Verify schema
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table schema:', result);
    
  } catch (error) {
    console.error('❌ Error fixing notifications table:', error);
  }
  
  process.exit(0);
}

fixNotificationsTable();