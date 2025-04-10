#!/usr/bin/env python3
"""
Script to update the database schema to match our models.
This is a simple migration script - in production you would use Alembic.
"""
import sys
import os
from sqlalchemy import text

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine

# Columns to add to existing tables
MIGRATIONS = [
    # Create users table if it doesn't exist
    """CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid()
    );""",
    
    # Add core columns to users table
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR UNIQUE;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR NOT NULL DEFAULT '';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
    
    # Add additional user fields
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR DEFAULT 'light';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate FLOAT;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status VARCHAR;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications JSONB;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS tools_expertise JSONB;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS methodology_expertise JSONB;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;",
    
    # Add status, created_at, updated_at to projects table
    "ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR;",
    "ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
    "ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
    
    # Add title, description_md, poc_type fields to vulnerabilities table
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS title VARCHAR;",
    
    # Check if description column exists before renaming
    """DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='vulnerabilities' AND column_name='description') THEN
            ALTER TABLE vulnerabilities RENAME COLUMN description TO description_md;
        ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='vulnerabilities' AND column_name='description_md') THEN
            ALTER TABLE vulnerabilities ADD COLUMN description_md TEXT;
        END IF;
    END $$;""",
    
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS poc_type VARCHAR;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS poc_zip_path VARCHAR;",
    
    # Add missing columns to vulnerabilities table
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS severity VARCHAR;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'open';",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS cvss_score FLOAT;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS cvss_vector VARCHAR;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS steps_to_reproduce TEXT;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS impact TEXT;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS recommendation TEXT;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS reference_urls JSONB;",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS discovered_by UUID REFERENCES users(id);",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS fixed_by UUID REFERENCES users(id);",
    "ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS fixed_at TIMESTAMP;",
    
    # Add missing columns to missions table
    "ALTER TABLE missions ADD COLUMN IF NOT EXISTS estimated_hours INTEGER;",
    "ALTER TABLE missions ADD COLUMN IF NOT EXISTS actual_hours INTEGER;",
    "ALTER TABLE missions ADD COLUMN IF NOT EXISTS budget INTEGER;",
    "ALTER TABLE missions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);",
    
    # Add missing columns to clients table
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS description TEXT;",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person VARCHAR;",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_email VARCHAR;",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_phone VARCHAR;",
    
    # Create missing tables if they don't exist
    """CREATE TABLE IF NOT EXISTS specialities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );""",
    
    """CREATE TABLE IF NOT EXISTS pentester_specialities (
        pentester_id UUID REFERENCES users(id),
        speciality_id UUID REFERENCES specialities(id),
        level VARCHAR,
        PRIMARY KEY (pentester_id, speciality_id)
    );""",
    
    """CREATE TABLE IF NOT EXISTS mission_pentesters (
        mission_id UUID REFERENCES missions(id),
        pentester_id UUID REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role VARCHAR,
        PRIMARY KEY (mission_id, pentester_id)
    );""",
    
    """CREATE TABLE IF NOT EXISTS mission_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mission_id UUID REFERENCES missions(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );""",
    
    """CREATE TABLE IF NOT EXISTS mission_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mission_id UUID REFERENCES missions(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        filename VARCHAR NOT NULL,
        file_path VARCHAR NOT NULL,
        file_type VARCHAR,
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );""",
    
    """CREATE TABLE IF NOT EXISTS timesheets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mission_id UUID REFERENCES missions(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        date DATE NOT NULL,
        hours_spent INTEGER NOT NULL,
        description VARCHAR,
        status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );""",
    
    """CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        content TEXT,
        findings JSONB DEFAULT '[]',
        recommendations JSONB DEFAULT '[]',
        status VARCHAR DEFAULT 'draft',
        mission_id UUID REFERENCES missions(id),
        author_id UUID REFERENCES users(id),
        reviewer_id UUID REFERENCES users(id),
        submitted_at TIMESTAMP,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );"""
]

def run_migrations():
    """Run all migrations to update schema"""
    db = SessionLocal()
    try:
        connection = engine.connect()
        
        print("Running database migrations...")
        for i, migration in enumerate(MIGRATIONS):
            try:
                print(f"[{i+1}/{len(MIGRATIONS)}] Executing migration...")
                with connection.begin():
                    connection.execute(text(migration))
                print("  Success!")
            except Exception as e:
                print(f"  Error: {str(e)}")
                # Continue with other migrations - each migration is in its own transaction
        
        print("Database schema update complete!")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_migrations() 