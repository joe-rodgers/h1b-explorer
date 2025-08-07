#!/usr/bin/env python3
"""
H1B Explorer Configuration Checker
Verifies Render environment variables and database connectivity
"""

import os
import psycopg2
import sys
from datetime import datetime

def check_environment_variables():
    """Check if all required environment variables are set"""
    print("🔍 Checking Environment Variables")
    print("-" * 40)
    
    required_vars = [
        'DB_HOST',
        'DB_NAME', 
        'DB_USER',
        'DB_PASSWORD',
        'DB_PORT'
    ]
    
    optional_vars = [
        'PORT',
        'FLASK_ENV'
    ]
    
    all_good = True
    
    # Check required variables
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            # Mask password for security
            if var == 'DB_PASSWORD':
                display_value = '*' * len(value)
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: Not set")
            all_good = False
    
    # Check optional variables
    print("\nOptional variables:")
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: Not set (using default)")
    
    return all_good

def test_database_connection():
    """Test database connectivity"""
    print("\n🔍 Testing Database Connection")
    print("-" * 40)
    
    # Database configuration
    DB_CONFIG = {
        'host': os.environ.get('DB_HOST'),
        'database': os.environ.get('DB_NAME'),
        'user': os.environ.get('DB_USER'),
        'password': os.environ.get('DB_PASSWORD'),
        'port': os.environ.get('DB_PORT', '5432')
    }
    
    # Check if we have all required config
    missing_config = [k for k, v in DB_CONFIG.items() if not v]
    if missing_config:
        print(f"❌ Missing database configuration: {missing_config}")
        return False
    
    try:
        print(f"Connecting to: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        print(f"Database: {DB_CONFIG['database']}")
        print(f"User: {DB_CONFIG['user']}")
        
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Test basic connection
        cursor.execute("SELECT version()")
        version = cursor.fetchone()[0]
        print(f"✅ Connected successfully!")
        print(f"   PostgreSQL version: {version}")
        
        # Check if our tables exist
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('h1b_applications', 'h1b_statistics')
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        if tables:
            print(f"✅ Found tables: {tables}")
            
            # Check record counts
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"   {table}: {count} records")
        else:
            print("⚠️  No H1B tables found (run setup_database.py to create them)")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_render_specific():
    """Check Render-specific configuration"""
    print("\n🔍 Checking Render Configuration")
    print("-" * 40)
    
    # Check if we're running on Render
    render_env = os.environ.get('RENDER')
    if render_env:
        print(f"✅ Running on Render: {render_env}")
    else:
        print("⚠️  Not running on Render (local development)")
    
    # Check port configuration
    port = os.environ.get('PORT', '5000')
    print(f"✅ Port configured: {port}")
    
    # Check if we have a database URL (Render provides this)
    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        print("✅ DATABASE_URL found (Render auto-provided)")
    else:
        print("⚠️  No DATABASE_URL (using individual config variables)")
    
    return True

def main():
    """Main configuration check"""
    print("🚀 H1B Explorer Configuration Checker")
    print("=" * 50)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Check environment variables
    env_ok = check_environment_variables()
    
    # Check Render configuration
    render_ok = check_render_specific()
    
    # Test database connection
    db_ok = False
    if env_ok:
        db_ok = test_database_connection()
    else:
        print("\n❌ Skipping database test - missing environment variables")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Configuration Summary")
    print("=" * 50)
    
    if env_ok and render_ok and db_ok:
        print("🎉 All checks passed! Your configuration is ready.")
        print("\nNext steps:")
        print("1. Deploy your backend to Render")
        print("2. Run setup_database.py to create tables")
        print("3. Test your API endpoints")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        
        if not env_ok:
            print("\nTo fix environment variables:")
            print("1. Go to your Render service dashboard")
            print("2. Navigate to Environment tab")
            print("3. Add the missing variables")
        
        if not db_ok:
            print("\nTo fix database issues:")
            print("1. Check your database credentials")
            print("2. Ensure database service is running")
            print("3. Verify network connectivity")
    
    return env_ok and render_ok and db_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
