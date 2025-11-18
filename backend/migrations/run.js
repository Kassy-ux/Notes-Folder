import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE NOT NULL
      )
    `;
    console.log('✅ Users table created\n');

    // Create notes table
    console.log('Creating notes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general' NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
        color VARCHAR(50),
        image_url TEXT,
        reminder_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMP
      )
    `;
    console.log('✅ Notes table created\n');

    // Create shared_notes table
    console.log('Creating shared_notes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS shared_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
        shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission VARCHAR(20) DEFAULT 'view' NOT NULL,
        shared_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Shared notes table created\n');

    // Create attachments table
    console.log('Creating attachments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Attachments table created\n');

    // Create tags table
    console.log('Creating tags table...');
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✅ Tags table created\n');

    // Create note_tags junction table
    console.log('Creating note_tags table...');
    await sql`
      CREATE TABLE IF NOT EXISTS note_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Note tags table created\n');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned)`;
    console.log('✅ Indexes created\n');

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
