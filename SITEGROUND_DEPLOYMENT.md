# 🚀 H1B Explorer SiteGround Deployment Guide

## Overview
Deploy the complete H1B Explorer stack on SiteGround:
- ✅ **Frontend**: HTML/CSS/JS in `public_html/`
- ✅ **Backend**: Flask API in `backend/`
- ✅ **Database**: PostgreSQL `dbibgk9afya5vu`

## 🐍 Step 1: Enable Python on SiteGround

1. **Go to SiteGround Control Panel**
2. **Navigate to Site Tools** → **DevOps** → **Python**
3. **Enable Python** for your domain
4. **Choose Python version**: 3.11 or 3.12
5. **Note the Python path** (usually `/usr/bin/python3`)

## 📁 Step 2: Upload Files to SiteGround

### File Structure
```
public_html/
├── index.html (frontend)
└── backend/
    ├── app.py
    ├── requirements.txt
    ├── wsgi.py
    └── venv/ (will be created)
```

### Upload Process
1. **Use FTP/SFTP** to connect to SiteGround
2. **Upload backend folder** to `public_html/backend/`
3. **Ensure all files** are uploaded correctly

## 🔧 Step 3: Set Up Python Environment

### Via SSH (if available)
```bash
# Connect to SiteGround via SSH
ssh username@your-domain.com

# Navigate to backend directory
cd public_html/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Via SiteGround Control Panel
1. **Go to Site Tools** → **DevOps** → **Python**
2. **Create virtual environment** in `backend/` directory
3. **Install requirements** using the interface

## 🗄️ Step 4: Configure Database

### Environment Variables
Set these in your Python environment or `.env` file:
```
DB_HOST=localhost
DB_NAME=dbibgk9afya5vu
DB_USER=u68bxgiobe3si
DB_PASSWORD=<your-database-password>
DB_PORT=5432
```

### Test Database Connection
```bash
# Test connection
curl https://h1bexplorer.com/backend/api/db-status

# Setup tables
curl https://h1bexplorer.com/backend/api/setup-db
```

## 🌐 Step 5: Configure Web Server

### Option 1: WSGI Configuration
1. **Create `.htaccess`** in `backend/` directory:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ wsgi.py/$1 [QSA,L]
```

### Option 2: Python App Configuration
1. **In SiteGround Control Panel**
2. **Go to Python Apps**
3. **Create new Python app**
4. **Point to**: `backend/wsgi.py`
5. **Set working directory**: `backend/`

## 🧪 Step 6: Test the Application

### Test Endpoints
```bash
# Test backend
curl https://h1bexplorer.com/backend/api/test

# Test database
curl https://h1bexplorer.com/backend/api/db-status

# Test health
curl https://h1bexplorer.com/backend/api/health
```

### Expected Responses
```json
{
  "message": "Backend is live!",
  "status": "success",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔍 Troubleshooting

### Common Issues
1. **Python not found**: Check Python path in SiteGround
2. **Module not found**: Install requirements in virtual environment
3. **Database connection failed**: Check credentials and host
4. **Permission denied**: Check file permissions (755 for directories, 644 for files)

### Debug Commands
```bash
# Check Python version
python3 --version

# Check installed packages
pip list

# Test database connection
python3 -c "import psycopg2; print('Database module OK')"
```

## 🎯 Final Configuration

### Frontend Update
Update `frontend/index.html` to point to SiteGround backend:
```javascript
const BACKEND_URL = 'https://h1bexplorer.com/backend';
```

### Environment Variables
- `DB_HOST`: `localhost`
- `DB_NAME`: `dbibgk9afya5vu`
- `DB_USER`: `u68bxgiobe3si`
- `DB_PASSWORD`: `<your-password>`
- `DB_PORT`: `5432`

## ✅ Success Checklist

- [ ] Python enabled on SiteGround
- [ ] Backend files uploaded
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Database connected
- [ ] API endpoints responding
- [ ] Frontend updated
- [ ] All tests passing

---

**Need help?** Check SiteGround's Python documentation or contact support.
