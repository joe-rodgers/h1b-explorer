#!/usr/bin/env python3
"""
H1B Explorer SiteGround Database Configuration Helper
Helps configure the database connection with your SiteGround PostgreSQL
"""

import os
import sys

def main():
    print("🔧 H1B Explorer SiteGround Database Configuration")
    print("=" * 60)
    print()
    
    print("📋 SiteGround PostgreSQL Configuration:")
    print("-" * 40)
    print("1. Go to SiteGround Control Panel")
    print("2. Navigate to: Site Tools → Databases → PostgreSQL")
    print("3. Find your 'h1b_explorer' database")
    print("4. Note down the connection details")
    print()
    
    print("🔍 Required Information:")
    print("-" * 25)
    print("• Database Host (usually localhost or your domain)")
    print("• Database Name: h1b_explorer")
    print("• Username")
    print("• Password")
    print("• Port (usually 5432)")
    print()
    
    print("🚀 Next Steps:")
    print("-" * 15)
    print("1. Update Render environment variables:")
    print("   DB_HOST=<your-siteground-host>")
    print("   DB_NAME=h1b_explorer")
    print("   DB_USER=<your-siteground-username>")
    print("   DB_PASSWORD=<your-siteground-password>")
    print("   DB_PORT=5432")
    print()
    
    print("2. Deploy updated backend:")
    print("   git add .")
    print("   git commit -m 'Configure SiteGround PostgreSQL'")
    print("   git push origin main")
    print()
    
    print("3. Test database connection:")
    print("   curl https://h1b-explorer-backend.onrender.com/api/db-status")
    print()
    
    print("4. Run database setup:")
    print("   curl https://h1b-explorer-backend.onrender.com/api/setup-db")
    print()
    
    return True

if __name__ == "__main__":
    main()
