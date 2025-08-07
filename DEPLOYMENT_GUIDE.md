# 🚀 H1B Explorer Deployment Guide

## Your Configuration

### Backend URL
- **Production**: https://h1b-explorer-backend.onrender.com
- **Status**: ✅ Live and responding

### FTP Configuration (SiteGround)
- **Host**: ftp.h1bexplorer.com
- **Port**: 21
- **Username**: admin@h1bexplorer.com
- **Password**: Bitcoin@2100!

## 🔧 Step 1: Set GitHub Secrets

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** and add these secrets:

| Secret Name | Value |
|-------------|-------|
| `FTP_HOST` | `ftp.h1bexplorer.com` |
| `FTP_USERNAME` | `admin@h1bexplorer.com` |
| `FTP_PASSWORD` | `Bitcoin@2100!` |

## 🚀 Step 2: Deploy Backend to Render

1. **Connect GitHub to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set the following configuration:
     - **Name**: `h1b-explorer-backend`
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`

2. **Set Environment Variables** in Render:
   ```
   DB_HOST=your-postgres-host.onrender.com
   DB_NAME=h1b_explorer
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   PORT=10000
   ```

3. **Deploy**: Render will automatically deploy when you push to main branch

## 🌐 Step 3: Deploy Frontend to SiteGround

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fresh backend with complete API endpoints"
   git push origin main
   ```

2. **Monitor GitHub Actions**:
   - Go to your GitHub repository
   - Click "Actions" tab
   - Watch the deployment progress

3. **Verify Deployment**:
   - Frontend will be deployed to `public_html/` on your SiteGround hosting
   - Access your domain to see the Hello World app

## 🧪 Step 4: Test the System

### Test Backend API
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

### Test Frontend
1. Visit your domain (h1bexplorer.com)
2. Click "Test Backend API" button
3. Click "Test Database Connection" button
4. Check browser console for responses

## 📊 Expected Results

### Backend API Responses

**Root Endpoint** (`/`):
```json
{
  "message": "H1B Explorer Backend API",
  "status": "running",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": {
    "test": "/api/test",
    "db_status": "/api/db-status",
    "health": "/api/health"
  }
}
```

**Test Endpoint** (`/api/test`):
```json
{
  "message": "Backend is live!",
  "status": "success",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

**Database Status** (`/api/db-status`):
```json
{
  "db_connected": true,
  "table_count": 12,
  "db_version": "PostgreSQL 15.4",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔍 Troubleshooting

### If Backend Deployment Fails
1. Check Render build logs
2. Verify `requirements.txt` is in backend folder
3. Ensure `app.py` has correct structure
4. Check environment variables in Render

### If Frontend Deployment Fails
1. Check GitHub Actions logs
2. Verify FTP credentials in GitHub secrets
3. Ensure `public_html` directory exists on SiteGround
4. Check if domain is properly configured

### If Database Connection Fails
1. Verify PostgreSQL is running on Render
2. Check database credentials in environment variables
3. Ensure database exists and is accessible
4. Test connection locally first

## ✅ Success Checklist

- [ ] GitHub secrets configured
- [ ] Backend deployed to Render
- [ ] Frontend deployed to SiteGround
- [ ] `/api/test` endpoint responds
- [ ] `/api/db-status` endpoint responds
- [ ] Frontend buttons work correctly
- [ ] No CORS errors in browser console
- [ ] All systems show green status

## 🎯 Next Steps

After successful deployment:

1. **Add H1B Data**: Import your H1B dataset to PostgreSQL
2. **Create Data Endpoints**: Add API endpoints for H1B data queries
3. **Build Visualizations**: Create charts, maps, and tables
4. **Add Filters**: Implement interactive filtering functionality
5. **Optimize Performance**: Add caching and query optimization

---

**Ready to deploy! 🚀**
