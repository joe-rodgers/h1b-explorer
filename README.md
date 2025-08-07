# 🚀 H1B Explorer - System Integration & Hello World

A data-rich webapp for visualizing H-1B visa applications with interactive filtering capabilities. This repository contains the system integration setup and Hello World app to verify all components are properly connected.

## 📋 Project Overview

**H1B Explorer** allows users to interactively filter H-1B data by:
- Employer
- Job title  
- Location
- Salary
- Year

All KPIs, charts, maps, and tables update in real-time as users apply filters.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (SiteGround)  │◄──►│   (Render)      │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│  - HTML/CSS/JS  │    │  - Flask API    │    │  - H1B Data     │
│  - Interactive  │    │  - CORS Enabled │    │  - 12 Tables    │
│  - Real-time    │    │  - Auto-deploy  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- GitHub repository connected to Render
- SiteGround hosting with FTP access
- PostgreSQL database (already set up on Render)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/h1b-explorer.git
cd h1b-explorer
```

### 2. Configure Environment

Copy the example environment file and update with your values:

```bash
cp env.example .env
```

Update the following variables in `.env`:
- `DB_HOST`: Your PostgreSQL host on Render
- `DB_NAME`: Database name (e.g., `h1b_explorer`)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `BACKEND_URL`: Your Render backend URL

### 3. Set GitHub Secrets

In your GitHub repository settings, add these secrets:

| Secret Name | Description |
|-------------|-------------|
| `FTP_HOST` | Your SiteGround domain |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |

### 4. Deploy

Push to main branch to trigger automatic deployment:

```bash
git add .
git commit -m "Initial H1B Explorer setup"
git push origin main
```

## 🔧 API Endpoints

### Test Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Root endpoint | API status |
| `/api/test` | GET | Backend connectivity test | `{"message": "Backend is live!"}` |
| `/api/db-status` | GET | Database connection test | `{"db_connected": true, "table_count": 12}` |
| `/api/health` | GET | Comprehensive health check | Full system status |

### Example Responses

**Backend Test:**
```json
{
  "message": "Backend is live!",
  "status": "success",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Database Status:**
```json
{
  "db_connected": true,
  "table_count": 12,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Hello World App

The frontend includes a Hello World app for testing system integration:

### Features
- ✅ Real-time status indicators
- ✅ Backend connectivity test
- ✅ Database connection test
- ✅ Comprehensive system test
- ✅ Response logging
- ✅ Modern, responsive UI

### Testing Checklist

| Test | Status | Description |
|------|--------|-------------|
| GitHub → Render (Backend) | ⏳ | Auto-deploy on push to main |
| GitHub → SiteGround (Frontend) | ⏳ | FTP deployment via GitHub Actions |
| `/api/test` responds | ⏳ | Backend connectivity verified |
| `/api/db-status` confirms DB | ⏳ | Database connection verified |
| Frontend buttons work | ⏳ | User interaction tested |

## 📁 Project Structure

```
h1b-explorer/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Hello World app
│   └── dist/               # Build output (auto-generated)
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment
├── env.example             # Environment configuration template
└── README.md               # This file
```

## 🔄 Deployment Pipeline

### Frontend (SiteGround)
1. Push to `main` branch
2. GitHub Actions triggers
3. Build frontend files
4. Deploy via FTP to `public_html/`
5. App available at your domain

### Backend (Render)
1. Push to `main` branch  
2. Render auto-detects changes
3. Builds and deploys Flask app
4. API available at Render URL

## 🛠️ Development

### Local Development

1. **Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

2. **Frontend:**
```bash
cd frontend
# Open index.html in browser
# Update BACKEND_URL to localhost:5000 for testing
```

### Environment Variables

Key variables for development:
- `FLASK_ENV=development`
- `DEBUG=True`
- `BACKEND_URL=http://localhost:5000`

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS is enabled in backend
   - Check frontend BACKEND_URL is correct

2. **Database Connection Failed**
   - Verify DB credentials in Render environment
   - Check network connectivity

3. **FTP Deployment Failed**
   - Verify GitHub secrets are set correctly
   - Check SiteGround FTP credentials

4. **Backend Not Deploying**
   - Ensure Render is connected to GitHub repo
   - Check build logs in Render dashboard

### Debug Commands

```bash
# Test backend locally
curl http://localhost:5000/api/test

# Test database connection
curl http://localhost:5000/api/db-status

# Check GitHub Actions logs
# Go to Actions tab in GitHub repository
```

## 📊 Next Steps

After Hello World verification:

1. **Data Integration**
   - Connect to H1B dataset
   - Create database schema
   - Implement data loading scripts

2. **Frontend Development**
   - Build interactive filters
   - Create data visualizations
   - Implement real-time updates

3. **Advanced Features**
   - User authentication
   - Data export functionality
   - Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review GitHub Actions logs
- Check Render deployment logs
- Open an issue in the repository

---

**Happy coding! 🚀**
