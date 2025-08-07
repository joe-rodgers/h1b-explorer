# 🔐 H1B Explorer Database Credentials

## Database Connection String
```
postgresql://h1b_user:WqAxoWHb1uVTRNZf7sDLWBkZKPckOG0Y@dpg-d297jsbe5dus73c1ri90-a.ohio-postgres.render.com/h1b_explorer
```

## Extracted Credentials
- **Host**: `dpg-d297jsbe5dus73c1ri90-a.ohio-postgres.render.com`
- **Port**: `5432` (default PostgreSQL port)
- **Database**: `h1b_explorer`
- **Username**: `h1b_user`
- **Password**: `WqAxoWHb1uVTRNZf7sDLWBkZKPckOG0Y`

## Render Environment Variables
Add these to your Render web service environment:

```
DB_HOST=dpg-d297jsbe5dus73c1ri90-a.ohio-postgres.render.com
DB_NAME=h1b_explorer
DB_USER=h1b_user
DB_PASSWORD=WqAxoWHb1uVTRNZf7sDLWBkZKPckOG0Y
DB_PORT=5432
PORT=10000
FLASK_ENV=production
```

## Test Connection
After deploying, test with:
```bash
curl https://h1b-explorer-backend.onrender.com/api/db-status
```

## Security Note
⚠️ **Keep these credentials secure!** Don't commit them to version control.
