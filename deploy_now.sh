#!/bin/bash

# H1B Explorer Quick Deployment Script
echo "🚀 H1B Explorer Deployment"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    echo "❌ Error: Please run this script from the h1b-explorer root directory"
    exit 1
fi

echo "📋 Database Configuration:"
echo "   Host: dpg-d297jsbe5dus73c1ri90-a.ohio-postgres.render.com"
echo "   Database: h1b_explorer"
echo "   User: h1b_user"
echo ""

echo "🔧 Next Steps:"
echo "1. Go to your Render web service dashboard"
echo "2. Navigate to Environment tab"
echo "3. Add these environment variables:"
echo ""
echo "   DB_HOST=dpg-d297jsbe5dus73c1ri90-a.ohio-postgres.render.com"
echo "   DB_NAME=h1b_explorer"
echo "   DB_USER=h1b_user"
echo "   DB_PASSWORD=WqAxoWHb1uVTRNZf7sDLWBkZKPckOG0Y"
echo "   DB_PORT=5432"
echo "   PORT=10000"
echo "   FLASK_ENV=production"
echo ""

echo "4. Set GitHub secrets for frontend deployment:"
echo "   FTP_HOST=ftp.h1bexplorer.com"
echo "   FTP_USERNAME=admin@h1bexplorer.com"
echo "   FTP_PASSWORD=Bitcoin@2100!"
echo ""

read -p "Press Enter when you've configured Render environment variables..."

echo "🚀 Deploying to GitHub..."
git add .
git commit -m "Configure database connection with actual credentials"
git push origin main

echo ""
echo "✅ Deployment triggered!"
echo ""
echo "📊 Monitor deployment:"
echo "   - Backend: Check Render dashboard"
echo "   - Frontend: Check GitHub Actions tab"
echo ""
echo "🧪 Test after deployment:"
echo "   curl https://h1b-explorer-backend.onrender.com/api/db-status"
echo ""
echo "🌐 Frontend will be available at: h1bexplorer.com"
