<div align="center">
  <img src="public/logo.png" alt="Resume Optimizer Logo" width="120" />
  <h1>Resume Optimizer AI</h1>
  <p><strong>The Ultimate Open-Source Career Platform</strong></p>
  
  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" /></a>
    <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-3.x-black?style=for-the-badge&logo=flask" alt="Flask" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/AI-Gemini_Flash-orange?style=for-the-badge" alt="Gemini AI" /></a>
  </p>
</div>

---

## 🌟 Overview

**Resume Optimizer AI** is a highly advanced, full-stack resume building and career optimization platform. Designed to rival industry leaders like Zety and Novoresume, Resume Optimizer utilizes the power of **Google Gemini AI** to not just format your resume, but to actively rewrite, optimize, and analyze it against applicant tracking systems (ATS).

With a completely free, premium design aesthetic, it provides 155 professional templates, real-time custom theming, and an entire suite of Job-Hunt tools.

## 🚀 Features

- **🧠 AI Resume Tailoring**: Upload your old resume and a Job Description. Our AI instantly rewrites your bullet points using the STAR method to perfectly match the role.
- **🎨 Custom Design Studio**: Live-updating preview with granular controls for Typography (Inter, Roboto, Merriweather), Accent Colors, Page Margins, and Line Spacing.
- **📝 AI Cover Letter Generator**: Automatically drafts a highly tailored, 3-paragraph cover letter based on the gaps between your resume and the targeted job.
- **🎯 Smart Interview Prep**: Analyzes your resume against the Job Description to predict the **Top 5** Behavioral and Technical questions the recruiter will ask.
- **💬 Career AI ChatBot**: A floating chatbot ready to answer any questions about resume length, ATS rules, and formatting best practices.
- **📊 ATS Analytics Dashboard**: A built-in user dashboard that tracks your resume scores and profile views.
- **📄 Perfect PDF/DOCX Export**: flawless document generation powered by our Python Flask backend.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Vanilla CSS Modules
- **Icons**: Lucide React
- **Architecture**: Contextual State Management, LocalStorage Persistence

### Backend
- **Server**: Python 3.x with Flask
- **AI Engine**: `google-generativeai` (Gemini 1.5 Flash)
- **Document Processing**: `python-docx`, `pdfkit`, `PyMuPDF`
- **Architecture**: RESTful API Endpoints (`/api/chat`, `/api/cover-letter`, `/api/interview-prep`)

## ⚙️ Local Development Setup

To run this platform locally, you will need both the Node server (Frontend) and the Python server (Backend) running simultaneously.

### 1. Start the Backend (Flask)
The backend handles document parsing, PDF generation, and all AI logic.
```bash
# Navigate to the root directory
cd Resume_Modifier

# Run the provided batch script (Windows)
START_BACKEND.bat
```
*The backend will run on `http://127.0.0.1:5000`.*

### 2. Start the Frontend (Vite)
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```
*The frontend will run on `http://localhost:5173`. It is configured to automatically proxy API requests to the Flask backend.*

## 🔑 Environment Variables
To enable the AI capabilities (Chatbot, Cover Letter Generator, Interview Prep, and Resume Rewriting), you must set your Gemini API key in your environment variables before running the backend.
```bash
# Windows CMD
set GEMINI_API_KEY=your_api_key_here
```
*(If the key is not set, the platform will safely fall back to pre-programmed logic without crashing).*

## 🤝 Contributing
Resume Optimizer is built to be modular and extremely extensible. If you want to add new ATS Templates, implement the Phase 3 Authentication (Supabase/Firebase), or write new AI prompts, feel free to submit a Pull Request!

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
