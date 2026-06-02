# Deploying to Vercel

This project is configured to deploy the React (Vite) frontend and Python (Flask) backend as a single Vercel deployment.

## Prerequisites
1. A Vercel account linked to GitHub/GitLab/Bitbucket
2. Git repository with this codebase

## Deployment Steps

### 1. Import Project
1. Go to Vercel Dashboard → Add New → Project
2. Import your Git repository
3. Vercel auto-detects Vite as the frontend framework

### 2. Environment Variables
Before clicking Deploy, add these environment variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API Key |
| `JWT_SECRET_KEY` | *[Your Secret]* | Long random string for JWT signing |
| `DATABASE_URL` | `postgresql://...` | *(Optional)* PostgreSQL connection string |

> If `DATABASE_URL` is left empty, a temporary SQLite database is used. Data persists only while the serverless container is warm.

### 3. Deploy
Click Deploy. The app will be live on `*.vercel.app`.

## Technical Details
- **Routing**: `vercel.json` routes `/api/:path*` to `api/index.py` (Python serverless function)
- **Backend**: `api/index.py` wraps the Flask app using Mangum adapter for Vercel serverless
- **Frontend**: Vite builds to `dist/` directory, served as static files
- **Database**: Uses PostgreSQL when `DATABASE_URL` is set, falls back to SQLite `/tmp` otherwise