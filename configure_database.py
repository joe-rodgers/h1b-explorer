#!/usr/bin/env python3
"""
H1B Explorer Database Configuration Helper
Helps configure the database connection with your actual PostgreSQL host
"""

import os
import sys

def main():
    print("🔧 H1B Explorer Database Configuration")
    print("=" * 50)
    print(f"Your PostgreSQL Host: dpg-d297jsbe5dus73c1ri90-a")
    print()
    
    print("📋 Required Environment Variables for Render:")
    print("-" * 50)
    print("DB_HOST=dpg-d297jsbe5dus73c1ri90-a")
    print("DB_NAME=h1b_explorer")
    print("DB_USER=<your_database_username>")
    print("DB_PASSWORD=<your_database_password>")
    print("DB_PORT=5432")
    print()
    
    print("🚀 Next Steps:")
    print("1. Go to your Render web service dashboard")
    print("2. Navigate to Environment tab")
    print("3. Add these environment variables:")
    print("   - DB_HOST: dpg-d297jsbe5dus73c1ri90-a")
    print("   - DB_NAME: h1b_explorer")
    print("   - DB_USER: (your database username)")
    print("   - DB_PASSWORD: (your database password)")
    print("   - DB_PORT: 5432")
    print("   - PORT: 10000")
    print("   - FLASK_ENV: production")
    print()
    
    print("🔍 To find your database credentials:")
    print("1. Go to your PostgreSQL service in Render")
    print("2. Check the 'Connections' tab")
    print("3. Look for 'External Database URL'")
    print("4. Extract username and password from the URL")
    print()
    
    print("📝 Example External Database URL format:")
    print("postgresql://username:password@dpg-d297jsbe5dus73c1ri90-a:5432/database_name")
    print()
    
    print("✅ After setting environment variables:")
    print("1. Deploy your backend: git push origin main")
    print("2. Test connection: curl https://h1b-explorer-backend.onrender.com/api/db-status")
    print("3. Run setup: python backend/setup_database.py")
    
    return True

if __name__ == "__main__":
    main()
