# Deploying to Vercel

This project is configured to deploy the React (Vite) frontend and Python (Flask) backend as a single Vercel deployment.

## Prerequisites
1. A Vercel account linked to GitHub/GitLab/Bitbucket
2. Git repository with this codebase

## Deployment Steps

### 1. Import Project
1. Go to Vercel Dashboard → Add New → Project
2. Import your Git repository
3. Vercel will auto-detect Vite as the frontend framework (also explicitly set in `vercel.json`)

### 2. Environment Variables
Before clicking Deploy, add these environment variables in Vercel → Settings → Environment Variables:

| Key | Value | Required | Description |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | ✅ Yes | Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey)) |
| `JWT_SECRET_KEY` | *[Random string]* | ✅ Yes | Long random string for JWT signing |
| `ADMIN_API_KEY` | *[Your secret]* | ✅ Yes | Key for accessing the admin dashboard |
| `DATABASE_URL` | `postgresql://...` | ❌ No | PostgreSQL connection string (defaults to ephemeral SQLite) |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ❌ No | Your deployed URL for CORS (auto-detected on Vercel) |

> **Note:** If `DATABASE_URL` is left empty, a temporary SQLite database is used. Data persists only while the serverless container is warm. For production, use a PostgreSQL provider (Neon, Supabase, Render, or Railway).

### 3. Deploy
Click **Deploy**. The app will be live on `*.vercel.app`.

## Technical Details
- **Routing**: `vercel.json` routes `/api/:path*` to `api/index.py` (Python serverless function)
- **Backend**: `api/index.py` imports the Flask app directly — Vercel's Python runtime natively supports WSGI
- **Frontend**: Vite builds to `dist/` directory, served as static files
- **Database**: Uses PostgreSQL when `DATABASE_URL` is set, falls back to SQLite in `/tmp` otherwise

## Troubleshooting

| Symptom | Fix |
| :--- | :--- |
| API returns 500 errors | Check that `GEMINI_API_KEY` is set in Vercel env vars |
| Login/auth not working | Ensure `JWT_SECRET_KEY` is set |
| Database resets on redeploy | Set `DATABASE_URL` to a persistent PostgreSQL instance |
| CORS errors | Set `FRONTEND_URL` to your Vercel deployment URL |