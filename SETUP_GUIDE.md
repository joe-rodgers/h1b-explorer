# 🚀 Complete H1B Explorer Setup Guide

## Current Status
- ✅ **Backend URL**: https://h1b-explorer-backend.onrender.com
- ✅ **Frontend FTP**: ftp.h1bexplorer.com
- ⏳ **Database**: Needs configuration
- ⏳ **API Endpoints**: Need to be updated

## 📋 Step-by-Step Setup

### Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Sign in to your account

2. **Create New PostgreSQL Service**
   - Click **"New"** → **"PostgreSQL"**
   - Fill in the details:
     ```
     Name: h1b-explorer-db
     Database: h1b_explorer
     User: h1b_explorer_user
     Region: Choose closest to your users
     PostgreSQL Version: 15
     ```

3. **Save Database Credentials**
   - After creation, Render will show you the connection details
   - **Save these credentials** - you'll need them for the backend

### Step 2: Configure Backend Service

1. **Update Existing Web Service**
   - Go to your existing `h1b-explorer-backend` service
   - Or create a new one if needed

2. **Set Service Configuration**
   ```
   Name: h1b-explorer-backend
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

3. **Add Environment Variables**
   In the **Environment** tab, add:
   ```
   DB_HOST=your-postgres-host.onrender.com
   DB_NAME=h1b_explorer
   DB_USER=h1b_explorer_user
   DB_PASSWORD=your-database-password
   DB_PORT=5432
   PORT=10000
   FLASK_ENV=production
   ```

4. **Link Database** (Optional but Recommended)
   - In your web service dashboard
   - Go to **Environment** tab
   - Click **"Link Database"**
   - Select your `h1b-explorer-db` service

### Step 3: Deploy Updated Backend

1. **Push Changes to GitHub**
   ```bash
   git add .
   git commit -m "Configure Render database and backend"
   git push origin main
   ```

2. **Monitor Deployment**
   - Watch the build logs in Render dashboard
   - Ensure no errors occur

### Step 4: Test Backend Configuration

1. **Test API Endpoints**
   ```bash
   # Test root endpoint
   curl https://h1b-explorer-backend.onrender.com/
   
   # Test backend connectivity
   curl https://h1b-explorer-backend.onrender.com/api/test
   
   # Test database connection
   curl https://h1b-explorer-backend.onrender.com/api/db-status
   
   # Test health check
   curl https://h1b-explorer-backend.onrender.com/api/health
   ```

2. **Expected Responses**
   - Root endpoint should show API info
   - `/api/test` should return "Backend is live!"
   - `/api/db-status` should show database connection status
   - `/api/health` should show overall system health

### Step 5: Set Up Database Schema

1. **Run Database Setup Script**
   ```bash
   # If you have access to the Render environment
   cd backend
   python setup_database.py
   ```

2. **Or Create Tables Manually**
   Connect to your PostgreSQL database and run:
   ```sql
   -- Create H1B applications table
   CREATE TABLE h1b_applications (
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
   
   -- Create indexes
   CREATE INDEX idx_employer ON h1b_applications(employer_name);
   CREATE INDEX idx_job_title ON h1b_applications(job_title);
   CREATE INDEX idx_year ON h1b_applications(year);
   CREATE INDEX idx_location ON h1b_applications(location);
   CREATE INDEX idx_salary ON h1b_applications(salary);
   ```

### Step 6: Configure GitHub Secrets

1. **Go to GitHub Repository Settings**
   - Navigate to your repository
   - Go to **Settings** → **Secrets and variables** → **Actions**

2. **Add FTP Secrets**
   ```
   FTP_HOST=ftp.h1bexplorer.com
   FTP_USERNAME=admin@h1bexplorer.com
   FTP_PASSWORD=Bitcoin@2100!
   ```

### Step 7: Deploy Frontend

1. **Push to Trigger Deployment**
   ```bash
   git add .
   git commit -m "Ready for frontend deployment"
   git push origin main
   ```

2. **Monitor GitHub Actions**
   - Go to **Actions** tab in your repository
   - Watch the deployment progress
   - Ensure FTP deployment succeeds

3. **Verify Frontend**
   - Visit your domain (h1bexplorer.com)
   - Test the Hello World app
   - Click buttons to test backend connectivity

## 🔍 Troubleshooting

### Database Connection Issues

**Problem**: Database connection fails
**Solutions**:
1. Check environment variables in Render
2. Verify database service is running
3. Ensure credentials are correct
4. Use internal database URL if available

**Problem**: Tables don't exist
**Solutions**:
1. Run `setup_database.py` script
2. Create tables manually via SQL
3. Check database permissions

### Backend Deployment Issues

**Problem**: Build fails
**Solutions**:
1. Check `requirements.txt` is in backend folder
2. Verify all dependencies are listed
3. Check Python version compatibility

**Problem**: API endpoints return 404
**Solutions**:
1. Ensure `app.py` has correct route definitions
2. Check if backend deployed successfully
3. Verify root directory is set to `backend`

### Frontend Deployment Issues

**Problem**: FTP deployment fails
**Solutions**:
1. Check GitHub secrets are correct
2. Verify FTP credentials
3. Ensure `public_html` directory exists
4. Check domain configuration

## ✅ Success Checklist

- [ ] PostgreSQL database created on Render
- [ ] Database credentials saved
- [ ] Backend service configured
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] All API endpoints responding
- [ ] Database connection working
- [ ] Tables created (if needed)
- [ ] GitHub secrets configured
- [ ] Frontend deployed to SiteGround
- [ ] Hello World app working
- [ ] All tests passing

## 🎯 Next Steps

After successful setup:

1. **Import Real H1B Data**
   - Connect your H1B dataset to PostgreSQL
   - Create data import scripts

2. **Build Data Endpoints**
   - Add API endpoints for H1B data queries
   - Implement filtering and search

3. **Create Visualizations**
   - Build charts and graphs
   - Add interactive maps
   - Create data tables

4. **Add Advanced Features**
   - User authentication
   - Data export functionality
   - Advanced analytics

---

**Need Help?** Check the troubleshooting section or review the logs in Render and GitHub Actions.
