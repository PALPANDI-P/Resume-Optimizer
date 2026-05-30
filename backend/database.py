import os
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from datetime import datetime
from dotenv import load_dotenv

# Load .env file from backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    mobile = db.Column(db.String(20), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    resumes = db.relationship('Resume', backref='owner', lazy=True, cascade="all, delete-orphan")
    analyses = db.relationship('Analysis', backref='user', lazy=True)
    cover_letters = db.relationship('CoverLetter', backref='user', lazy=True)
    chat_history = db.relationship('ChatMessage', backref='user', lazy=True)
    downloads = db.relationship('DownloadHistory', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class OTPVerification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mobile = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, default="Untitled Resume")
    content = db.Column(db.Text, nullable=False)  # JSON or plain text content
    template_id = db.Column(db.String(50), default="cc-001")
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Versioning
    version_tag = db.Column(db.String(50), default="v1")  # e.g., "ATS", "Recruiter"
    is_favorite = db.Column(db.Boolean, default=False)

class Analysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_score = db.Column(db.Integer)
    report_json = db.Column(db.Text)  # Store findings, matched skills, missing skills
    jd_text = db.Column(db.Text)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CoverLetter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    jd_text = db.Column(db.Text)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'bot'
    message = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DownloadHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resume_title = db.Column(db.String(200), nullable=False)
    format = db.Column(db.String(10), nullable=False)  # 'pdf' or 'docx'
    template_id = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def init_db(app):
    # ============================================================
    # DATABASE CONFIGURATION
    # ============================================================
    # Production (PostgreSQL): Set DATABASE_URL in .env or hosting platform
    #   Example: DATABASE_URL=postgresql://user:password@host:5432/dbname
    #
    # Development (SQLite): Leave DATABASE_URL empty, auto-uses SQLite
    # ============================================================
    
    database_url = os.environ.get('DATABASE_URL', '')
    
    # Render.com uses 'postgres://' which SQLAlchemy needs as 'postgresql://'
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    if database_url:
        # Production: Use PostgreSQL
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        print(f"[DB] Connected to PostgreSQL")
    elif os.environ.get('VERCEL'):
        # On Vercel but no DATABASE_URL: use /tmp/resume_optimizer.db (ephemeral)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/resume_optimizer.db'
        print(f"[DB] Using SQLite in /tmp (ephemeral, Vercel environment)")
    else:
        # Development: Use SQLite (local file)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resume_optimizer.db'
        print(f"[DB] Using SQLite (local development)")
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,  # Auto-reconnect if connection drops
    }
    
    # JWT Secret Key - MUST be changed in production
    app.config['JWT_SECRET_KEY'] = os.environ.get(
        'JWT_SECRET_KEY', 
        'super-secret-key-change-this-in-production'
    )
    
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    with app.app_context():
        db.create_all()
        print(f"[DB] All tables created successfully")

