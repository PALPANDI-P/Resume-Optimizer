# 🚀 Deploying to Vercel

This project is configured to deploy both the **React (Vite) frontend** and the **Python (Flask) backend** as a single Vercel deployment. 

The frontend assets are served statically, and the backend is run via **Vercel Serverless Functions** (using the `@vercel/python` builder) located in the `/api` directory.

---

## 📋 Prerequisites

1. A **Vercel** account (linked to your GitHub, GitLab, or Bitbucket account).
2. A **GitHub** repository containing your version of this codebase.
3. (Recommended) A hosted **PostgreSQL** instance for database persistence.

---

## ⚡ Deployment Steps

### 1. Import Project to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import the Git repository containing this project.
3. Vercel will automatically detect **Vite** as your frontend framework.

### 2. Configure Environment Variables
Before clicking "Deploy", expand the **Environment Variables** section and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key. |
| `JWT_SECRET_KEY` | *[Your Secret]* | A long random string to sign JWT auth tokens. |
| `DATABASE_URL` | `postgresql://...` | *(Recommended)* Your PostgreSQL connection string. |

> [!NOTE]
> If you leave `DATABASE_URL` empty, the system will use an **ephemeral SQLite database** in the Vercel container's `/tmp` directory. While this allows the app to work and be demoed without database setup, your database entries (users, resumes, history) will be **regularly wiped** as Vercel serverless containers spin down.

### 3. Deploy
1. Click **Deploy**.
2. Once the build finishes, your app will be live on a `*.vercel.app` domain!

---

## 🗄️ Database Options (PostgreSQL)

For production data persistence, you should connect to a hosted PostgreSQL database. Good options include:
- **Vercel Postgres** (built-in, easy setup on the Vercel dashboard)
- **Neon** (serverless Postgres, highly recommended)
- **Supabase** (managed PostgreSQL database)
- **Render PostgreSQL**

Copy your database connection string and paste it into the `DATABASE_URL` environment variable.

---

## ⚙️ How It Works (Technical Overview)

- **Routing:** [`vercel.json`](file:///e:/Resume%20Modifier/vercel.json) routes all incoming requests under `/api/...` to the Serverless Function at [`api/index.py`](file:///e:/Resume%20Modifier/api/index.py). All other requests fall back to serve the React SPA (`/index.html`).
- **Backend Function:** [`api/index.py`](file:///e:/Resume%20Modifier/api/index.py) dynamically adjusts Python's system path to import and serve the Flask instance defined in [`backend/app.py`](file:///e:/Resume%20Modifier/backend/app.py).
- **Dependencies:** Vercel automatically detects [`requirements.txt`](file:///e:/Resume%20Modifier/requirements.txt) at the root of the project and installs all Python libraries during build time.
