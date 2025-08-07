#!/usr/bin/env python3
"""
H1B Explorer Database Setup Script
Creates the initial database schema and test data
"""

import psycopg2
import os
import sys
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'h1b_explorer'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'port': os.environ.get('DB_PORT', '5432')
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

def create_tables(conn):
    """Create the initial database tables"""
    cursor = conn.cursor()
    
    # Create H1B applications table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS h1b_applications (
            id SERIAL PRIMARY KEY,
            employer_name VARCHAR(255) NOT NULL,
            job_title VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            salary DECIMAL(10,2) NOT NULL,
            year INTEGER NOT NULL,
            case_status VARCHAR(100),
            visa_class VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create indexes for performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_employer ON h1b_applications(employer_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_job_title ON h1b_applications(job_title);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_year ON h1b_applications(year);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_location ON h1b_applications(location);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_salary ON h1b_applications(salary);")
    
    # Create statistics table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS h1b_statistics (
            id SERIAL PRIMARY KEY,
            year INTEGER NOT NULL,
            total_applications INTEGER DEFAULT 0,
            avg_salary DECIMAL(10,2) DEFAULT 0,
            top_employer VARCHAR(255),
            top_location VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    conn.commit()
    cursor.close()
    print("✅ Database tables created successfully")

def insert_test_data(conn):
    """Insert sample H1B data"""
    cursor = conn.cursor()
    
    # Sample H1B applications data
    test_data = [
        ('Google LLC', 'Software Engineer', 'Mountain View, CA', 150000, 2023, 'Certified', 'H-1B'),
        ('Microsoft Corporation', 'Data Scientist', 'Redmond, WA', 140000, 2023, 'Certified', 'H-1B'),
        ('Apple Inc.', 'Product Manager', 'Cupertino, CA', 160000, 2023, 'Certified', 'H-1B'),
        ('Amazon.com Services LLC', 'Software Engineer', 'Seattle, WA', 145000, 2023, 'Certified', 'H-1B'),
        ('Meta Platforms Inc.', 'Data Engineer', 'Menlo Park, CA', 155000, 2023, 'Certified', 'H-1B'),
        ('Netflix Inc.', 'Machine Learning Engineer', 'Los Gatos, CA', 170000, 2023, 'Certified', 'H-1B'),
        ('Uber Technologies Inc.', 'Software Engineer', 'San Francisco, CA', 135000, 2023, 'Certified', 'H-1B'),
        ('Airbnb Inc.', 'Data Scientist', 'San Francisco, CA', 145000, 2023, 'Certified', 'H-1B'),
        ('Salesforce Inc.', 'Software Engineer', 'San Francisco, CA', 140000, 2023, 'Certified', 'H-1B'),
        ('Oracle Corporation', 'Database Administrator', 'Austin, TX', 130000, 2023, 'Certified', 'H-1B'),
        ('Intel Corporation', 'Hardware Engineer', 'Santa Clara, CA', 125000, 2023, 'Certified', 'H-1B'),
        ('NVIDIA Corporation', 'AI Engineer', 'Santa Clara, CA', 160000, 2023, 'Certified', 'H-1B'),
    ]
    
    # Insert test data
    cursor.executemany("""
        INSERT INTO h1b_applications (employer_name, job_title, location, salary, year, case_status, visa_class)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, test_data)
    
    # Insert sample statistics
    cursor.execute("""
        INSERT INTO h1b_statistics (year, total_applications, avg_salary, top_employer, top_location)
        VALUES (2023, 12, 145000, 'Google LLC', 'San Francisco, CA')
    """)
    
    conn.commit()
    cursor.close()
    print("✅ Test data inserted successfully")

def verify_setup(conn):
    """Verify the database setup"""
    cursor = conn.cursor()
    
    # Check table count
    cursor.execute("SELECT COUNT(*) FROM h1b_applications")
    app_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM h1b_statistics")
    stats_count = cursor.fetchone()[0]
    
    # Get some sample data
    cursor.execute("SELECT employer_name, job_title, salary FROM h1b_applications LIMIT 3")
    sample_data = cursor.fetchall()
    
    cursor.close()
    
    print(f"✅ Verification complete:")
    print(f"   - H1B Applications: {app_count} records")
    print(f"   - Statistics: {stats_count} records")
    print(f"   - Sample data: {sample_data}")

def main():
    """Main setup function"""
    print("🚀 H1B Explorer Database Setup")
    print("=" * 50)
    print(f"Database: {DB_CONFIG['database']}")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"User: {DB_CONFIG['user']}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database. Check your configuration.")
        sys.exit(1)
    
    try:
        # Create tables
        create_tables(conn)
        
        # Insert test data
        insert_test_data(conn)
        
        # Verify setup
        verify_setup(conn)
        
        print("\n🎉 Database setup completed successfully!")
        print("You can now test the API endpoints:")
        print("  - /api/db-status")
        print("  - /api/health")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
