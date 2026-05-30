import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
"""
Seed Database Script
====================
Creates an admin user, a demo user, and sample resume data for testing.

Run: python seed_db.py
"""

import json
from datetime import datetime, timedelta
from app import app, db
from database import User, Resume, Analysis, CoverLetter, ChatMessage, DownloadHistory

# ============================================================
# SAMPLE RESUME DATA
# ============================================================

DEMO_RESUME_CONTENT = {
    "personal": {
        "name": "Priya Sharma",
        "title": "Full Stack Developer",
        "email": "priya.sharma@email.com",
        "phone": "+91 98765 43210",
        "location": "Chennai, Tamil Nadu",
        "linkedin": "linkedin.com/in/priyasharma",
        "github": "github.com/priyasharma",
        "summary": "Passionate Full Stack Developer with 3+ years of experience building scalable web applications using React, Node.js, and Python. Skilled in designing RESTful APIs, implementing responsive UIs, and optimizing database performance. Strong problem-solving abilities with a focus on clean, maintainable code."
    },
    "experience": [
        {
            "company": "TechCorp Solutions",
            "position": "Full Stack Developer",
            "location": "Chennai, India",
            "startDate": "2022-06",
            "endDate": "Present",
            "highlights": [
                "Built and maintained 5+ production React applications serving 50,000+ users",
                "Designed RESTful APIs using Flask and Node.js, reducing response time by 40%",
                "Implemented CI/CD pipelines using GitHub Actions, reducing deployment time by 60%",
                "Mentored 3 junior developers on best practices and code review processes"
            ]
        },
        {
            "company": "StartupHub India",
            "position": "Junior Web Developer",
            "location": "Bangalore, India",
            "startDate": "2020-08",
            "endDate": "2022-05",
            "highlights": [
                "Developed responsive web interfaces using React and Tailwind CSS",
                "Integrated payment gateways (Razorpay, Stripe) handling ₹50L+ transactions",
                "Optimized SQL queries resulting in 35% faster page load times",
                "Collaborated with UX team to improve user retention by 25%"
            ]
        }
    ],
    "education": [
        {
            "institution": "Anna University",
            "degree": "B.Tech in Computer Science",
            "location": "Chennai, India",
            "startDate": "2016",
            "endDate": "2020",
            "gpa": "8.5/10",
            "highlights": [
                "First Class with Distinction",
                "Led college coding club — organized 10+ hackathons"
            ]
        }
    ],
    "skills": [
        "JavaScript", "TypeScript", "Python", "React", "Node.js",
        "Flask", "PostgreSQL", "MongoDB", "Docker", "AWS",
        "Git", "REST APIs", "GraphQL", "Tailwind CSS", "Redis"
    ],
    "certifications": [
        {
            "name": "AWS Certified Developer – Associate",
            "issuer": "Amazon Web Services",
            "date": "2023"
        },
        {
            "name": "Meta Front-End Developer Certificate",
            "issuer": "Coursera / Meta",
            "date": "2022"
        }
    ],
    "projects": [
        {
            "name": "E-Commerce Platform",
            "description": "Full-stack e-commerce app with React, Node.js, and MongoDB. Features include real-time inventory, payment integration, and admin dashboard.",
            "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
            "link": "github.com/priyasharma/ecommerce"
        },
        {
            "name": "Task Management API",
            "description": "RESTful API built with Flask and PostgreSQL. Includes JWT authentication, role-based access, and real-time notifications via WebSockets.",
            "technologies": ["Python", "Flask", "PostgreSQL", "WebSocket"],
            "link": "github.com/priyasharma/task-api"
        }
    ],
    "template_id": "cc-001"
}

ADMIN_RESUME_CONTENT = {
    "personal": {
        "name": "Admin User",
        "title": "System Administrator",
        "email": "admin@resumemodifier.com",
        "phone": "+91 90000 00001",
        "location": "India",
        "summary": "Admin account for Resume Modifier platform management."
    },
    "experience": [],
    "education": [],
    "skills": ["Administration", "Database Management", "Security"],
    "template_id": "cc-001"
}


def seed():
    with app.app_context():
        print("=" * 60)
        print("  SEEDING DATABASE")
        print("=" * 60)

        # ---- Check if users already exist ----
        existing_admin = User.query.filter_by(email="admin@resumemodifier.com").first()
        existing_demo = User.query.filter_by(email="priya.sharma@email.com").first()

        # ============================================================
        # 1. CREATE ADMIN USER
        # ============================================================
        if existing_admin:
            print(f"\n[EXISTS] Admin user already exists (ID: {existing_admin.id})")
            admin = existing_admin
        else:
            admin = User(
                name="Admin",
                email="admin@resumemodifier.com",
                mobile="+919000000001"
            )
            admin.set_password("Admin@123")
            db.session.add(admin)
            db.session.flush()  # Get the ID
            print(f"\n[OK] Admin user created (ID: {admin.id})")
            print(f"   Email:    admin@resumemodifier.com")
            print(f"   Password: Admin@123")
            print(f"   Mobile:   +919000000001")

            # Admin's resume
            admin_resume = Resume(
                title="Admin's Resume",
                content=json.dumps(ADMIN_RESUME_CONTENT),
                template_id="cc-001",
                user_id=admin.id,
                version_tag="v1"
            )
            db.session.add(admin_resume)

        # ============================================================
        # 2. CREATE DEMO USER
        # ============================================================
        if existing_demo:
            print(f"\n[EXISTS] Demo user already exists (ID: {existing_demo.id})")
            demo = existing_demo
        else:
            demo = User(
                name="Priya Sharma",
                email="priya.sharma@email.com",
                mobile="+919876543210"
            )
            demo.set_password("Demo@123")
            db.session.add(demo)
            db.session.flush()
            print(f"\n[OK] Demo user created (ID: {demo.id})")
            print(f"   Name:     Priya Sharma")
            print(f"   Email:    priya.sharma@email.com")
            print(f"   Password: Demo@123")
            print(f"   Mobile:   +919876543210")

            # ---- Demo user's resume ----
            demo_resume = Resume(
                title="Priya Sharma's Resume",
                content=json.dumps(DEMO_RESUME_CONTENT),
                template_id="cc-001",
                user_id=demo.id,
                version_tag="ATS",
                is_favorite=True
            )
            db.session.add(demo_resume)
            db.session.flush()

            # ---- Second resume variant ----
            variant = DEMO_RESUME_CONTENT.copy()
            variant["template_id"] = "mod-01"
            demo_resume_2 = Resume(
                title="Priya Sharma - Modern Style",
                content=json.dumps(variant),
                template_id="mod-01",
                user_id=demo.id,
                version_tag="Modern"
            )
            db.session.add(demo_resume_2)
            db.session.flush()

            # ---- Analysis records ----
            analysis_1 = Analysis(
                match_score=85,
                report_json=json.dumps({
                    "match_score": 85,
                    "matched_skills": ["React", "Node.js", "Python", "REST APIs", "PostgreSQL"],
                    "missing_skills": ["Kubernetes", "Terraform"],
                    "suggestions": [
                        "Add Kubernetes experience to stand out",
                        "Mention CI/CD pipeline details",
                        "Quantify impact with more metrics"
                    ]
                }),
                jd_text="Looking for a Full Stack Developer with 3+ years experience in React, Node.js, Python. Must have experience with REST APIs, databases, and cloud services.",
                resume_id=demo_resume.id,
                user_id=demo.id
            )
            analysis_2 = Analysis(
                match_score=72,
                report_json=json.dumps({
                    "match_score": 72,
                    "matched_skills": ["Python", "Flask", "SQL", "Git"],
                    "missing_skills": ["Django", "Machine Learning", "Data Science"],
                    "suggestions": [
                        "Add Django or FastAPI experience",
                        "Highlight data analysis projects",
                        "Include ML/AI coursework if applicable"
                    ]
                }),
                jd_text="Python Backend Developer needed. Experience with Django/Flask, SQL databases, REST APIs. Machine Learning knowledge is a plus.",
                resume_id=demo_resume.id,
                user_id=demo.id
            )
            db.session.add(analysis_1)
            db.session.add(analysis_2)

            # ---- Download history ----
            downloads = [
                DownloadHistory(resume_title="Priya Sharma's Resume", format="pdf", template_id="cc-001", user_id=demo.id),
                DownloadHistory(resume_title="Priya Sharma's Resume", format="docx", template_id="cc-001", user_id=demo.id),
                DownloadHistory(resume_title="Priya Sharma - Modern Style", format="pdf", template_id="mod-01", user_id=demo.id),
            ]
            for d in downloads:
                db.session.add(d)

            # ---- Chat messages ----
            chats = [
                ChatMessage(role="user", message="How can I improve my resume for a Full Stack Developer role?", user_id=demo.id),
                ChatMessage(role="bot", message="Great question! Here are some tips for your resume:\n\n1. **Quantify achievements** — Instead of 'built web apps', say 'built 5+ production React apps serving 50,000+ users'\n2. **Add relevant keywords** — Include terms from the job description like 'scalable', 'microservices', 'agile'\n3. **Highlight impact** — Show how your work improved metrics (speed, revenue, user engagement)\n4. **Keep it concise** — 1-2 pages max, focused on relevant experience", user_id=demo.id),
                ChatMessage(role="user", message="Should I include my GPA?", user_id=demo.id),
                ChatMessage(role="bot", message="Since your GPA is 8.5/10, yes — that's strong! Include it especially since you have 3 years of experience. Once you have 5+ years, GPA becomes less important and you can remove it to save space.", user_id=demo.id),
            ]
            for c in chats:
                db.session.add(c)

        # ---- Commit everything ----
        db.session.commit()

        # ============================================================
        # PRINT SUMMARY
        # ============================================================
        print("\n" + "=" * 60)
        print("  DATABASE SUMMARY")
        print("=" * 60)
        
        users = User.query.all()
        resumes = Resume.query.all()
        analyses = Analysis.query.all()
        downloads = DownloadHistory.query.all()
        chats = ChatMessage.query.all()

        print(f"\n  Users:          {len(users)}")
        print(f"  Resumes:        {len(resumes)}")
        print(f"  Analyses:       {len(analyses)}")
        print(f"  Downloads:      {len(downloads)}")
        print(f"  Chat Messages:  {len(chats)}")

        print("\n" + "-" * 60)
        print("  LOGIN CREDENTIALS FOR TESTING")
        print("-" * 60)
        print(f"\n  [ADMIN]")
        print(f"     Email:    admin@resumemodifier.com")
        print(f"     Password: Admin@123")
        print(f"\n  [DEMO USER]")
        print(f"     Email:    priya.sharma@email.com")
        print(f"     Password: Demo@123")
        print(f"\n" + "=" * 60)


if __name__ == "__main__":
    seed()
