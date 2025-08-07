# 🔧 Render Configuration Guide

## Current Status
- **Backend URL**: https://h1b-explorer-backend.onrender.com
- **Status**: ✅ Live but needs updated API endpoints
- **Database**: ⏳ Needs configuration

## 🗄️ Step 1: Create PostgreSQL Database on Render

### 1.1 Create Database Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `h1b-explorer-db`
   - **Database**: `h1b_explorer`
   - **User**: `h1b_explorer_user`
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 15 (latest stable)

### 1.2 Get Database Credentials
After creation, Render will provide:
- **Internal Database URL**: `postgresql://h1b_explorer_user:password@host:port/h1b_explorer`
- **External Database URL**: `postgresql://h1b_explorer_user:password@host:port/h1b_explorer`

**Save these credentials!** You'll need them for the backend configuration.

## 🚀 Step 2: Configure Backend Service

### 2.1 Create/Update Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

```
Name: h1b-explorer-backend
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

### 2.2 Set Environment Variables
In your Render web service, go to **Environment** tab and add:

```
# Database Configuration
DB_HOST=your-postgres-host.onrender.com
DB_NAME=h1b_explorer
DB_USER=h1b_explorer_user
DB_PASSWORD=your-database-password
DB_PORT=5432

# Application Configuration
PORT=10000
FLASK_ENV=production
```

### 2.3 Link Database to Web Service
1. In your web service dashboard
2. Go to **Environment** tab
3. Click **"Link Database"**
4. Select your `h1b-explorer-db` service
5. This will automatically add the database URL as an environment variable

## 🧪 Step 3: Test Configuration

### 3.1 Test Database Connection
```bash
# Test the database connection endpoint
curl https://h1b-explorer-backend.onrender.com/api/db-status
```

Expected response:
```json
{
  "db_connected": true,
  "table_count": 0,
  "db_version": "PostgreSQL 15.x",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3.2 Test All Endpoints
```bash
# Test root endpoint
curl https://h1b-explorer-backend.onrender.com/

# Test backend connectivity
curl https://h1b-explorer-backend.onrender.com/api/test

# Test health check
curl https://h1b-explorer-backend.onrender.com/api/health
```

## 🔍 Step 4: Troubleshooting

### Database Connection Issues

**Error**: "Failed to connect to database"
**Solutions**:
1. Check environment variables in Render
2. Verify database service is running
3. Ensure database credentials are correct
4. Check if database exists

**Error**: "Connection timeout"
**Solutions**:
1. Use internal database URL (if available)
2. Check firewall settings
3. Verify database is in same region as web service

### Backend Deployment Issues

**Error**: "Module not found"
**Solutions**:
1. Check `requirements.txt` is in backend folder
2. Verify all dependencies are listed
3. Check build logs in Render

**Error**: "Port already in use"
**Solutions**:
1. Use `PORT=10000` in environment variables
2. Let Render assign port automatically

## 📊 Step 5: Database Schema Setup

### 5.1 Create Initial Tables
Once connected, you can create your H1B tables:

```sql
-- Example H1B table structure
CREATE TABLE h1b_applications (
    id SERIAL PRIMARY KEY,
    employer_name VARCHAR(255),
    job_title VARCHAR(255),
    location VARCHAR(255),
    salary DECIMAL(10,2),
    year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_employer ON h1b_applications(employer_name);
CREATE INDEX idx_job_title ON h1b_applications(job_title);
CREATE INDEX idx_year ON h1b_applications(year);
CREATE INDEX idx_location ON h1b_applications(location);
```

### 5.2 Test Data Insertion
```sql
-- Insert test data
INSERT INTO h1b_applications (employer_name, job_title, location, salary, year)
VALUES 
    ('Google LLC', 'Software Engineer', 'Mountain View, CA', 150000, 2023),
    ('Microsoft Corporation', 'Data Scientist', 'Redmond, WA', 140000, 2023),
    ('Apple Inc.', 'Product Manager', 'Cupertino, CA', 160000, 2023);
```

## 🔄 Step 6: Auto-Deploy Configuration

### 6.1 GitHub Integration
1. Ensure your GitHub repo is connected to Render
2. Set auto-deploy to trigger on push to `main` branch
3. Verify webhook is working

### 6.2 Environment Variable Management
- Use Render's environment variable interface
- Never commit sensitive data to Git
- Use different values for development/production

## ✅ Configuration Checklist

- [ ] PostgreSQL database created on Render
- [ ] Database credentials saved
- [ ] Web service configured with correct root directory
- [ ] Environment variables set
- [ ] Database linked to web service
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn app:app`
- [ ] Auto-deploy enabled
- [ ] All API endpoints responding
- [ ] Database connection successful

## 🎯 Next Steps After Configuration

1. **Deploy the updated backend**:
   ```bash
   git add .
   git commit -m "Configure Render database and backend"
   git push origin main
   ```

2. **Monitor deployment** in Render dashboard

3. **Test all endpoints** to ensure they work

4. **Import H1B data** to PostgreSQL

5. **Deploy frontend** to SiteGround

---

**Need help?** Check Render logs and this guide for troubleshooting steps.
