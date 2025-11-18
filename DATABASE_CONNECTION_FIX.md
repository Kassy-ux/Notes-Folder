# Database Connection Fix 🔧

## The Problem

Your local backend can't connect to Neon database with error:
```
❌ Database connection failed: Error connecting to database: fetch failed
```

## Likely Causes

1. **Channel Binding Issue**: Your connection string has `channel_binding=require` which may not work locally
2. **Pooler Connection**: You're using `-pooler` connection which is for serverless (Railway works, local doesn't)
3. **Network/Firewall**: Local machine can't reach Neon
4. **Connection String Expired**: Neon rotated the credentials

## Quick Fix Options

### Option 1: Update Connection String (RECOMMENDED)

Go to [Neon Console](https://console.neon.tech/) and get a **Direct Connection String** (not pooler):

1. Log into Neon
2. Go to your project
3. Click "Connection Details"
4. Switch from "Pooled" to **"Direct"**
5. Copy the new connection string
6. Update your `.env` file:

```bash
# Old (Pooler - for serverless)
DATABASE_URL=postgresql://neondb_owner:npg_sAX1WQMhtF5e@ep-rough-union-a4saenmr-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# New (Direct - for local dev)
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-rough-union-a4saenmr.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Notice:
- ❌ Removed `-pooler` from hostname
- ❌ Removed `channel_binding=require`
- ✅ Keep `sslmode=require`

### Option 2: Remove Channel Binding

If you want to keep the pooler, just remove the channel_binding:

In your `.env`:
```bash
DATABASE_URL=postgresql://neondb_owner:npg_sAX1WQMhtF5e@ep-rough-union-a4saenmr-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Option 3: Use Local Database for Development

Install PostgreSQL locally:

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb notes_app_dev

# Create user
sudo -u postgres psql -c "CREATE USER notesapp WITH PASSWORD 'devpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE notes_app_dev TO notesapp;"

# Update .env for local dev
DATABASE_URL=postgresql://notesapp:devpassword@localhost:5432/notes_app_dev?sslmode=disable
```

Then run migrations:
```bash
cd backend
node migrations/run.js
```

### Option 4: Use Two .env Files

**For Railway (production)** - keep in Railway dashboard:
```
DATABASE_URL=postgresql://...pooler...?channel_binding=require
```

**For local dev** - create `.env.local`:
```bash
cp .env .env.local
# Edit .env.local with direct connection string
```

Then in `package.json`:
```json
{
  "scripts": {
    "dev": "dotenv -e .env.local nodemon server.js",
    "start": "node server.js"
  }
}
```

Install dotenv-cli:
```bash
pnpm add -D dotenv-cli
```

## Test Your Fix

After updating the connection string:

```bash
# Test connection
cd backend
pnpm run dev
```

Should see:
```
✅ Database connected successfully!
📅 Server time: 2025-11-18...
🚀 Server running on port 3000
```

## Why This Happens

### Pooler vs Direct Connections

**Pooler** (`-pooler.` in hostname):
- ✅ Good for: Serverless (Railway, Vercel, Lambda)
- ✅ Handles connection pooling automatically
- ❌ Bad for: Long-running local servers
- ❌ May have channel_binding issues locally

**Direct** (no `-pooler`):
- ✅ Good for: Local development, traditional servers
- ✅ More stable for persistent connections
- ❌ Bad for: Serverless (connection limits)

### Channel Binding

`channel_binding=require` adds extra security but:
- ✅ Works great on Railway, Vercel, Render
- ❌ May fail on local machines depending on Node.js/OpenSSL version
- ❌ Not supported by all PostgreSQL clients

## Verification Steps

1. **Update .env** with correct connection string
2. **Restart backend**: `pnpm run dev`
3. **Check for**:
   ```
   ✅ Database connected successfully!
   ```
4. **Test API**:
   ```bash
   curl http://localhost:3000/health
   ```

## Current Status

- ✅ **Railway deployment**: Working (uses pooler connection)
- ❌ **Local development**: Not working (needs direct connection)

## Recommended Setup

**Railway (.env in Railway dashboard)**:
```bash
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-rough-union-a4saenmr-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Local (.env file)**:
```bash
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-rough-union-a4saenmr.us-east-1.aws.neon.tech/neondb?sslmode=require
```

(Same credentials, just remove `-pooler` and `channel_binding`)

## Alternative: Just Use Railway

If local setup is causing issues, you can:

1. **Develop against Railway backend**:
   ```javascript
   // In frontend src/services/api.js
   const API_BASE_URL = 'https://happy-encouragement-production.up.railway.app/api';
   ```

2. **Use Expo with Railway backend** (no local backend needed)
3. **Check Railway logs** for debugging
4. **Only run backend locally** when you need to test backend changes

Your frontend can work perfectly with the Railway backend!

## Need New Credentials?

If your connection string is expired:

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Go to "Settings" → "Reset Password"
4. Get new connection string
5. Update both:
   - Local `.env` file
   - Railway environment variables

---

## Quick Commands Reference

```bash
# Test connection
cd backend
node -e "import('dotenv').then(d => d.config()); import('./config/database.js').then(db => db.testConnection());"

# Check if .env loads
cd backend
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'Found' : 'Missing');"

# Start backend
cd backend
pnpm run dev
```

Choose the fix that works best for your setup! 🚀
