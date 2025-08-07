# 🔐 SiteGround PostgreSQL Configuration

## Database Details
- **Database Name**: `dbibgk9afya5vu`
- **Username**: `u68bxgiobe3si`
- **Host**: (Need to find from SiteGround control panel)
- **Password**: (Need to find from SiteGround control panel)
- **Port**: `5432` (default)

## Render Environment Variables
Once you have the host and password, update these in Render:

```
DB_HOST=<your-siteground-host>
DB_NAME=dbibgk9afya5vu
DB_USER=u68bxgiobe3si
DB_PASSWORD=<your-database-password>
DB_PORT=5432
```

## How to Find Host and Password

### 1. **Find Host**
1. Go to SiteGround Control Panel
2. Navigate to **Site Tools** → **Databases** → **PostgreSQL**
3. Click on your database `dbibgk9afya5vu`
4. Look for **"Host"** or **"Server"** field
5. Usually it's `localhost` or your domain like `h1bexplorer.com`

### 2. **Find Password**
1. In the same PostgreSQL section
2. Look for **"Password"** field
3. Or click **"Change Password"** to set a new one

## Test Connection
After updating Render environment variables:

```bash
# Test database connection
curl https://h1b-explorer-backend.onrender.com/api/db-status

# Setup database tables
curl https://h1b-explorer-backend.onrender.com/api/setup-db
```

## Expected Response
```json
{
  "db_connected": true,
  "table_count": 0,
  "db_version": "PostgreSQL x.x",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
