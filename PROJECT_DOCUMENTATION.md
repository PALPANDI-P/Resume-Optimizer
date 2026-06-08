# Project Documentation: Resume Optimizer AI

Resume Optimizer AI is an enterprise-grade, full-stack resume builder, optimizer, and career management platform. Powered by **Google Gemini AI (1.5 Flash)** and a Python-Flask backend, it parses existing resumes, matches them against target job descriptions, calculates ATS alignment scores, suggests keyword injections, and outputs pixel-perfect PDF/DOCX templates.

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Schema & Models](#2-database-schema--models)
3. [REST API Documentation](#3-rest-api-documentation)
4. [Backend Services & Core Logic](#4-backend-services--core-logic)
   - [Resume Parsing](#resume-parsing)
   - [Job Description (JD) Analysis](#job-description-jd-analysis)
   - [Resume Modification (STAR Injection)](#resume-modification-star-injection)
   - [PDF & DOCX Export Engine](#pdf--docx-export-engine)
   - [AI Chat & Cover Letter Generation](#ai-chat--cover-letter-generation)
5. [Frontend Client Application](#5-frontend-client-application)
   - [React Workspaces & Views](#react-workspaces--views)
   - [Data Serialization & Sync](#data-serialization--sync)
   - [Custom Theming & Templates](#custom-theming--templates)
   - [Client-side Fallbacks (Offline Mode)](#client-side-fallbacks-offline-mode)
6. [Configuration & Environment Variables](#6-configuration--environment-variables)
7. [Local Setup & Administration](#7-local-setup--administration)
8. [Production Deployment & Rewrites](#8-production-deployment--rewrites)

---

## 1. System Architecture Overview

The application is built on a modern decoupled architecture:
*   **Frontend**: A client-side React 18 Single Page Application (SPA) bundled via Vite. It uses Tailwind CSS for layout, custom HSL variables for theme engines, and LocalStorage for auto-saving drafts.
*   **Backend**: A Python Flask REST API servicing AI logic, resume optimization heuristics, file parsing, and document generation (DOCX/PDF).
*   **Database**: SQLite for local development and PostgreSQL (configured dynamically via SQLAlchemy) for production environments.
*   **Authentication & Security**: JWT-based stateless authentication (`flask_jwt_extended`), password hashing using Bcrypt, and simulated SMS/Email OTP verification for 2FA login.
*   **Production Host**: Designed for serverless architectures like Vercel (using Python WSGI wrapper and custom rewrite rules).

```mermaid
graph TD
    Client[React Frontend / Vite] -->|API Request / JSON| Gateway[Vercel Rewrites / CORS]
    Gateway -->|WSGI Middleware| Flask[Flask Backend API]
    Flask -->|SQLAlchemy| DB[(PostgreSQL / SQLite)]
    Flask -->|python-docx / fpdf2| Exporters[Exporters]
    Flask -->|pypdf / docx| Parsers[Parsers]
    Flask -->|google-generativeai SDK| Gemini[Gemini 1.5 Flash API]
```

---

## 2. Database Schema & Models

The database layer is managed using SQLAlchemy inside [database.py](file:///e:/Resume%20Modifier/backend/database.py). It automatically checks the host environment to choose between a local SQLite database file, ephemeral SQLite in `/tmp` (for Vercel), or a production PostgreSQL instance.

```mermaid
erDiagram
    USER ||--o{ RESUME : owns
    USER ||--o{ DOWNLOAD_HISTORY : downloads
    USER ||--o{ ANALYSIS : initiates
    USER ||--o{ CHAT_MESSAGE : sends
    USER ||--o{ COVER_LETTER : drafts
    
    USER {
        int id PK
        string name
        string email UK
        string password_hash
        string mobile UK
        datetime created_at
    }
    
    OTP_VERIFICATION {
        int id PK
        string email
        string mobile
        string code
        datetime expires_at
        boolean verified
        datetime created_at
    }

    RESUME {
        int id PK
        int user_id FK
        string title
        text content
        string template_id
        datetime created_at
        datetime updated_at
        string version_tag
        boolean is_favorite
    }

    ANALYSIS {
        int id PK
        int user_id FK
        int resume_id FK
        int match_score
        text report_json
        text jd_text
        datetime created_at
    }

    COVER_LETTER {
        int id PK
        int user_id FK
        int resume_id FK
        text content
        text jd_text
        datetime created_at
    }

    CHAT_MESSAGE {
        int id PK
        int user_id FK
        string role
        text message
        datetime created_at
    }

    DOWNLOAD_HISTORY {
        int id PK
        int user_id FK
        string resume_title
        string format
        string template_id
        datetime created_at
    }
```

### Table Specifications:
1.  **User**: Stores the standard profile info. Relationships are cascaded to clean up orphan records (e.g., when a user is deleted, their resumes and download histories are removed).
2.  **OTPVerification**: Stores temporary 6-digit codes sent to users during registration or login. Codes expire after 60 seconds.
3.  **Resume**: Stores the structured resume in JSON format.
4.  **Analysis**: Tracks the history of ATS matches, scoring, and missing/matched keyword feedback.
5.  **ChatMessage**: Stores user/bot chat threads for logged-in users to persist conversation context.
6.  **DownloadHistory**: Logs every export action (format and template choice).

---

## 3. REST API Documentation

The server exposes endpoints designed for resume processing, career counseling, account management, and administrators. 

### Authenticaton
For endpoints requiring authorization, pass the JWT access token in the headers:
`Authorization: Bearer <access_token>`

### Core Endpoints

#### `POST /api/generate-resumes`
Processes an uploaded resume document and returns optimized versions based on a job description.
*   **Authentication**: Optional. If authorized, saves the analysis in the database.
*   **Request Type**: `multipart/form-data`
*   **Parameters**:
    *   `resume` (File): PDF, DOCX, or TXT file (Max 4MB limit enforced for Vercel).
    *   `jd_text` (String): The job description.
    *   `resume_id` (Integer, Optional): ID of the existing database resume.
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "analysis": {
        "matched_skills": ["Python", "React"],
        "skills_to_emphasize": ["Kubernetes", "AWS"],
        "match_score": 65,
        "updated_score": 90,
        "feedback": ["Strategic Gap: Emphasize these missing core skills..."],
        "changes_made": ["Reorganized technical skills...", "Integrated missing keywords..."],
        "detected_industry": "Tech",
        "strengths": ["Technical alignment: Good listing of frameworks..."],
        "weaknesses": [
          {
            "title": "Missing Job-Relevant Keywords",
            "why_weak": "The target description emphasizes...",
            "how_to_improve": "Incorporate exact skill terms...",
            "example_improvement": "Built high-throughput systems utilizing Kubernetes..."
          }
        ],
        "ats_grade": "B",
        "recruiter_grade": "B"
      },
      "versions": [
        {
          "id": "v1",
          "title": "ATS Keyword Optimized Resume",
          "description": "Maximum keyword alignment. Best for ATS screening systems.",
          "content": "Full serialized text...",
          "intensity": "high"
        },
        {
          "id": "v2",
          "title": "Recruiter Friendly Resume",
          "description": "Clean, polished, professional wording.",
          "content": "Full serialized text...",
          "intensity": "low"
        },
        {
          "id": "v3",
          "title": "Balanced Resume",
          "description": "Optimal mix of ATS and human readability.",
          "content": "Full serialized text...",
          "intensity": "medium"
        }
      ]
    }
    ```

#### `POST /api/parse-resume`
Extracts raw text from an uploaded document without modifying it.
*   **Request Type**: `multipart/form-data`
*   **Parameters**:
    *   `resume` (File): PDF, DOCX, or TXT document.
*   **Response (`200 OK`)**: `{"text": "Extracted text..."}`

#### `POST /api/download`
Generates a DOCX or PDF document using template configurations.
*   **Authentication**: Optional. If authorized, logs a `DownloadHistory` entry.
*   **Request Type**: `application/json`
*   **Parameters**:
    ```json
    {
      "content": "Full serialized resume text...",
      "format": "pdf", 
      "filename": "John_Doe_Resume",
      "template_id": "tech-001"
    }
    ```
*   **Response**: Binary file attachment download (`application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).

#### `POST /api/chat`
Answers career questions, critiques bullets, or discusses resumes.
*   **Request Type**: `application/json`
*   **Parameters**:
    ```json
    {
      "message": "How do I show Kubernetes experience?",
      "resume_text": "Optional resume context...",
      "history": [{"role": "user", "text": "Hi"}, {"role": "bot", "text": "Hello"}]
    }
    ```
*   **Response**: `{"response": "Advisor message text..."}`

#### `POST /api/cover-letter`
Generates outreach documents, emails, or LinkedIn messages based on matching gaps.
*   **Parameters**:
    *   `resume_text`, `jd_text`, `doc_type` (`cover_letter`, `hr_email`, `recruiter_message`, `linkedin_note`), `writing_style` (`beginner`, `professional`, `corporate`, `executive`, `recruiter`, `formal`, `modern`).
*   **Response**: `{"cover_letter": "Generated document text..."}`

#### `POST /api/interview-prep`
Predicts 5 interview questions based on the candidate's profile and job description.
*   **Response**: `{"questions": ["1. Question...", "2. Question..."]}`

---

### Authentication & Registration Endpoints

1.  **`POST /api/send-otp`**: Generates a 6-digit verification code.
2.  **`POST /api/register`**: Starts register flow and sends SMS/email OTP code.
3.  **`POST /api/verify-otp`**: Validates registration code, saves the hashed password, and logs the user in.
4.  **`POST /api/login`**: Authenticates user credentials. If matched, triggers a login OTP verification code.
5.  **`POST /api/verify-login-otp`**: Verifies login OTP, registers connection, and returns a JWT access token.
6.  **`GET/POST /api/resumes`**: Retrives user's saved resume history, or saves drafts.
7.  **`POST /api/resumes/<id>/duplicate`**: Duplicates a resume.
8.  **`DELETE /api/resumes/<id>`**: Deletes a resume.
9.  **`GET /api/analyses`**: Gets the current user's ATS audit history.
10. **`GET /api/downloads`**: Gets the user's download logging.

---

### Admin Administration API

Requires header `X-Admin-Key` matching `ADMIN_API_KEY` (configured in `.env`).

1.  **`GET /api/admin/stats`**: Aggregated dashboard statistics (Total users, resumes, analyses, downloads, letters, and 7-day signups).
2.  **`GET /api/admin/users`**: Lists all users, their signups, and count of resumes/downloads.
3.  **`GET /api/admin/users/<id>`**: Detailed inspect of a single user profile including saved resumes, ATS analyses, downloads, and chat logs.
4.  **`GET /api/admin/recent-activity`**: Timeline logs of latest signups, downloads, and analyses.
5.  **`GET /admin`**: Serves a secure, administrative portal built with a responsive dashboard layout to track operations.

---

## 4. Backend Services & Core Logic

Business functions are decoupled into dedicated helper scripts in the [backend/services/](file:///e:/Resume%20Modifier/backend/services) directory:

### Resume Parsing
Handled by `resume_parser.py`. It reads file formats and extracts clean UTF-8 text strings:
*   **PDF**: Uses `pypdf.PdfReader` to extract character sequences per page, combining them with line-breaks.
*   **DOCX**: Uses `docx.Document` to iterate over paragraph structures and joins their inner text parameters.
*   **TXT**: Safely decodes text files with fallback checks.

### Job Description (JD) Analysis
Programmed in `jd_analyzer.py`. Rather than relying on simple regex or heavy models, it applies weighted semantic scoring rules:
1.  **Noise Removal**: Removes standard English grammar prepositions, pronouns, conjunctions, and high-frequency noise words (e.g., *experience*, *team*, *role*, *position*, *business*, *candidates*).
2.  **Multi-Word Extraction**: Extracts common industry terms (e.g., *machine learning*, *CI/CD*, *full stack*, *stakeholder management*, *infrastructure as code*).
3.  **Categorization & Weighting**: Matches single terms and phrases against category lists (e.g., programming languages, databases, web development, testing, cloud, agile PM, soft skills).
4.  **Keyword Scoring**: Computes a relevance score:
    $$\text{Score} = (\text{Category Weight} \times \text{Phrase Bonus}) + \text{Frequency Factor} + \text{Length Bonus} + \text{Rare Boost}$$
5.  **Selection Limit**: Sorts keywords and caps results at the top 20–25 terms, distributing selections so no single category dominates.

### Resume Modification (STAR Injection)
Located in `resume_modifier.py`. It matches the parsed resume against JD keywords and applies three levels of adjustment intensity:

*   **Section Splitter**: Uses regex to break the resume into logical sections (Header, Professional Summary, Skills, Work Experience, Projects, Education, etc.).
*   **Entity Protection**: Scans the text using regex rules to protect name fields, emails, phone numbers, URLs, dates, numeric achievements, company names, and job titles from modifications.
*   **Proactive Verb Integration**: Evaluates experience bullet points to ensure they lead with strong action verbs (e.g., *Spearheaded*, *Optimized*, *Architected*). If a bullet leads with passive verbs (*helped with*, *responsible for*), it applies an active verb using contextual replacement rules.
*   **STAR Phrase Construction**: Re-evaluates bullet points to inject missing job description terms. If a keyword fits the bullet's context, the service appends a relevant phrase (e.g., *“...effectively utilizing Kubernetes”* or *“...driven by insights from Tableau”*), creating a strong STAR statement.
*   **Skills Optimization**: Reorders skills within categories to place matching keywords first, and appends missing keywords under sections like `ADDITIONAL SKILLS`.

### PDF & DOCX Export Engine
Renders serialized resume formats into exportable files:
*   **`docx_exporter.py`**: Uses `python-docx` to apply typography (Arial, Times New Roman, etc.), custom sizing, left margins, and table border structures. It draws solid accent-colored underlines beneath section headers.
*   **`pdf_exporter.py`**: Uses `fpdf2` (inheriting from `FPDF`). Handles:
    *   *Typography & Spacing*: Configures document page breaks and margins.
    *   *Dividers*: Draws customizable dividers (e.g., double-lines, thick bars, colored blocks, ornaments, or gradients).
    *   *Layouts*: Supports complex multi-column rendering (single-column, timeline layout, and sidebar layouts with colored backgrounds).

### AI Chat & Cover Letter Generation
Managed in `chatbot.py`. It calls the **Gemini 1.5 Flash API** using the `google-generativeai` SDK.
*   **Fallback Fallback**: If the `GEMINI_API_KEY` is not present, it gracefully falls back to rule-based template replies (using typo mappings, intent detection, and pre-programmed paragraphs).
*   **System Prompts**: Feeds context structures (extracted resume details, conversation history, user goals) to the model with strict formatting guidelines.
*   **Dynamic Document Generation**: Creates cover letters, recruiter templates, and LinkedIn messages matching selected professional tones (Modern, Corporate, Executive, Recruiter).

---

## 5. Frontend Client Application

The React SPA is configured in the `/src` folder, structuring workspaces, view-routers, and dynamic previews.

### React Workspaces & Views
The application manages its view routing in [App.jsx](file:///e:/Resume%20Modifier/src/App.jsx) using a `currentView` state variable:
*   **Home View (`home`)**: Combines the `HeroSection`, `ATSAnalysisSection` (interactive scoring previews), `TemplateShowcase`, and `SmartToolsSection` dashboard entry points.
*   **Builder View (`builder`)**: Serves the section-by-section inputs. Uses sub-components to collect user details, validate fields, and trigger auto-saving.
*   **Preview View (`preview`)**: Shows the live resume. Provides a side panel with customization controls (templates, fonts, sizes, margins).
*   **Optimization View (`optimization`)**: An interactive center where users upload their resume and a job description. It displays side-by-side versions (Original vs. v1/v2/v3) and keyword audits.
*   **Templates View (`templates`)**: Renders a gallery of preset themes categorized by industry (ATS Optimized, Tech, Professional, Creative).
*   **Cover Letter Workspace (`coverletter`)**: Allows generating custom outreach copy, live editing text, and downloading PDF/DOCX templates.
*   **Career Advisor Workspace (`aiassistant`)**: A chat client that references the active resume to answer user queries.
*   **Template Importer (`importer`)**: Accepts JSON templates to dynamically update the application's configuration.

### Data Serialization & Sync
Managed in [resumeSerializer.js](file:///e:/Resume%20Modifier/src/utils/resumeSerializer.js):
*   **`serializeResume(data)`**: Serializes the React builder object state into a standardized plain text format.
*   **`parseToBuilderData(text)`**: Uses heuristics to parse raw plain text back into the structured React builder state.
*   **`normalizeData(raw)`**: Validates and normalizes parsed objects against default fields to prevent runtime rendering crashes.

### Custom Theming & Templates
The application uses a custom theme engine:
*   Custom styling tokens are declared in [index.css](file:///e:/Resume%20Modifier/src/index.css) using HSL variables (e.g., `--primary`, `--accent`, `--border-radius`).
*   Font options (Inter, Roboto, Merriweather, Outfit) are imported from Google Fonts.
*   Templates are defined in [templates.js](file:///e:/Resume%20Modifier/src/constants/templates.js), which maps accent colors, layout styles, and font sizes to the document generator.

### Client-side Fallbacks (Offline Mode)
To ensure the application remains functional without internet connectivity or a backend server, it includes client-side fallbacks:
*   `localAnalyzer.js`: Runs text audits directly in the browser to calculate matching percentages and find missing words.
*   `localChatbot.js`: Provides fallback chat responses using pre-programmed answers.

---

## 6. Configuration & Environment Variables

Create a `.env` file in the `backend/` directory to configure the application:

```bash
# ==========================================
# SYSTEM ENGINE CONFIGURATION
# ==========================================
# Google Gemini API Access Key (Required for AI features)
GEMINI_API_KEY=AIzaSyD_your_gemini_api_key_here

# Flask App Configuration
FLASK_APP=app.py
FLASK_ENV=development

# ==========================================
# SECURITY & AUTHENTICATION
# ==========================================
# Secret key used for JWT signing and token generation
JWT_SECRET_KEY=super-secret-key-change-this-in-production

# Administrative Access Key for Admin API routes
ADMIN_API_KEY=admin-secret-key-123

# ==========================================
# SYSTEM PARAMETERS
# ==========================================
# Database Connection (Leave blank to default to SQLite database file)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# CORS Whitelist Configuration
FRONTEND_URL=http://localhost:5173
```

---

## 7. Local Setup & Administration

### Prerequisites
*   Node.js v20 or higher
*   Python 3.8 or higher

### Step 1: Install Dependencies
```bash
# Install frontend packages
npm install

# Install backend packages
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Running the Development Servers
You can start both servers simultaneously using the provided batch scripts (Windows):
*   `START_ALL.bat`: Launches the Flask backend on port 5000 and the Vite frontend on port 5173 with logging.
*   `START_SIMPLE.bat`: Runs both services in the foreground in a single terminal window.
*   `RUN_BACKEND.bat`: Launches the Flask backend.

### Troubleshooting Port Conflicts
If port `5000` (Flask) or `5173` (Vite) is already in use:
1.  Find the process ID: `netstat -ano | findstr LISTENING | findstr ":5000"`
2.  Kill the process: `taskkill /PID <PID> /F`

---

## 8. Production Deployment & Rewrites

The project is configured for deployment on serverless platforms like Vercel:

### 1. Routing & Rewrites (`vercel.json`)
The [vercel.json](file:///e:/Resume%20Modifier/vercel.json) file routes requests:
*   `/api/:path*` is proxied to the Flask server entrypoint `api/index.py`.
*   All other paths are routed to `/index.html` to allow the React SPA to handle routing.
*   It configures CORS headers for backend API routes:
    *   `Access-Control-Allow-Origin: *`
    *   `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
    *   `Access-Control-Allow-Headers: Content-Type,Authorization,X-Admin-Key`

### 2. Serverless Function Specs
*   **Max Duration**: 30 seconds (allows sufficient time for Gemini LLM calls and PDF rendering).
*   **Memory**: 1024 MB (ensures fast PDF generation and text extraction).
*   **Database Fallback**: When deployed on Vercel without a `DATABASE_URL`, the application uses an ephemeral SQLite database located at `sqlite:////tmp/resume_optimizer.db` to prevent runtime crashes.
