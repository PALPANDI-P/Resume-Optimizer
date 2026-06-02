import os
import sys
import tempfile
import json
import random
from datetime import datetime, timedelta

# Add the backend directory to sys.path to allow imports when run from root
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
from services.resume_parser import extract_text
from services.jd_analyzer import analyze_jd
from services.resume_modifier import modify_resume
from services.docx_exporter import create_docx
from services.pdf_exporter import create_pdf
from services.chatbot import get_chat_response
from database import db, bcrypt, jwt, init_db, User, Resume, Analysis, CoverLetter, ChatMessage, DownloadHistory, OTPVerification
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
init_db(app)

# CORS configuration - more permissive for development
frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
allowed_origins = [
    frontend_url,
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
]

# Add Vercel deployment URLs dynamically
vercel_url = os.environ.get('VERCEL_URL')
if vercel_url:
    # VERCEL_URL doesn't include protocol
    allowed_origins.append(f'https://{vercel_url}')

# Add any custom production URL
if frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

CORS(app, origins=allowed_origins, supports_credentials=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@app.route('/api/generate-resumes', methods=['POST'])
@jwt_required(optional=True)
def generate_resumes():
    temp_path = None
    if 'resume' not in request.files or 'jd_text' not in request.form:
        return jsonify({'error': 'Missing resume file or job description text'}), 400

    file = request.files['resume']
    jd_text = request.form['jd_text']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # File size validation
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 413

    filename = file.filename
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

    if ext not in ['pdf', 'docx', 'txt']:
        return jsonify({'error': 'Unsupported file format. Please upload PDF, DOCX, or TXT.'}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp:
            file.save(temp.name)
            temp_path = temp.name

        resume_text = extract_text(temp_path, ext)
        if not resume_text or len(resume_text.strip()) < 10:
            return jsonify({'error': 'Could not extract enough text from the resume. Please ensure the file is not empty or corrupted.'}), 400

        jd_keywords = analyze_jd(jd_text)
        if not jd_keywords:
             # Try a more relaxed analysis if no keywords found
             jd_keywords = [w for w in jd_text.split() if len(w) > 5][:10]

        result = modify_resume(resume_text, jd_keywords)

        # Save to database if user is logged in
        identity = get_jwt_identity()
        user_id = int(identity) if identity else None
        if user_id:
            resume_id = request.form.get('resume_id')
            if resume_id:
                try:
                    resume_id = int(resume_id)
                except ValueError:
                    resume_id = None
            analysis_record = Analysis(
                match_score=result['analysis']['match_score'],
                report_json=json.dumps(result['analysis']),
                jd_text=jd_text,
                resume_id=resume_id,
                user_id=user_id
            )
            db.session.add(analysis_record)
            db.session.commit()

        return jsonify(result)
    except UnicodeDecodeError:
        return jsonify({'error': 'Unable to read file. Please ensure the file is UTF-8 encoded text.'}), 400
    except Exception as e:
        # Check for PDF-related errors
        error_msg = str(e)
        app.logger.error(f'Processing failed: {error_msg}', exc_info=True)
        
        if 'fitz' in str(type(e).__module__) or 'pypdf' in str(type(e).__module__) or 'pdf' in error_msg.lower():
            return jsonify({'error': 'Invalid or corrupted PDF file. Please upload a valid PDF.'}), 400
        # Check for DOCX-related errors
        if 'docx' in str(type(e).__module__) or 'opc' in str(type(e).__module__):
            return jsonify({'error': 'Invalid DOCX file. Please upload a valid Word document.'}), 400

        return jsonify({'error': f'Processing failed: {error_msg}'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    temp_path = None
    if 'resume' not in request.files:
        return jsonify({'error': 'Missing resume file'}), 400

    file = request.files['resume']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # File size validation
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 413

    filename = file.filename
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

    if ext not in ['pdf', 'docx', 'txt']:
        return jsonify({'error': 'Unsupported file format. Please upload PDF, DOCX, or TXT.'}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp:
            file.save(temp.name)
            temp_path = temp.name

        resume_text = extract_text(temp_path, ext)
        if not resume_text or len(resume_text.strip()) < 10:
            return jsonify({'error': 'Could not extract enough text from the resume. Please ensure the file is not empty or corrupted.'}), 400

        return jsonify({'text': resume_text})
    except Exception as e:
        app.logger.error(f'Parsing failed: {str(e)}', exc_info=True)
        return jsonify({'error': f'Parsing failed: {str(e)}'}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.route('/api/download', methods=['POST'])
@jwt_required(optional=True)
def download_resume():
    data = request.json
    content = data.get('content')
    fmt = data.get('format')
    filename = data.get('filename', 'Resume')
    template_id = data.get('template_id', 'cc-001')

    if not content or not fmt:
        return jsonify({'error': 'Missing content or format'}), 400

    # Helper to map frontend template ID (e.g. min-121) to backend style configurations (e.g. sim-21)
    import re
    def normalize_template_id(t_id):
        if not t_id:
            return 'ats-001'
        t_id = str(t_id).lower().strip()
        valid_ids = {
            'ats-001', 'tech-001', 'prof-001', 'ats-002', 'beg-001',
            'exec-001', 'prof-002', 'tech-002', 'exec-002', 'beg-002',
            'tech-003', 'ats-003', 'beg-003', 'exec-003', 'tech-004'
        }
        if t_id in valid_ids:
            return t_id
        match = re.match(r'([a-zA-Z]+)-?(\d+)', t_id)
        if not match:
            return 'ats-001'
        prefix, num_str = match.groups()
        try:
            num = int(num_str)
        except ValueError:
            return 'ats-001'
        if prefix in ['ats', 'ao', 'ats-optimized']:
            return f"ats-0{num:02d}" if f"ats-0{num:02d}" in valid_ids else f"ats-00{1 + (num - 1) % 3}"
        elif prefix in ['tech', 'technical']:
            return f"tech-0{num:02d}" if f"tech-0{num:02d}" in valid_ids else f"tech-00{1 + (num - 1) % 4}"
        elif prefix in ['prof', 'pro', 'professional']:
            return f"prof-0{num:02d}" if f"prof-0{num:02d}" in valid_ids else f"prof-00{1 + (num - 1) % 2}"
        elif prefix in ['beg', 'beginner', 'sim', 'simple', 'minimal', 'min']:
            return f"beg-0{num:02d}" if f"beg-0{num:02d}" in valid_ids else f"beg-00{1 + (num - 1) % 3}"
        elif prefix in ['exec', 'executive']:
            return f"exec-0{num:02d}" if f"exec-0{num:02d}" in valid_ids else f"exec-00{1 + (num - 1) % 3}"
        return 'ats-001'

    normalized_template_id = normalize_template_id(template_id)

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{fmt}") as temp:
            temp_path = temp.name

        if fmt == 'docx':
            create_docx(content, temp_path, template_id=normalized_template_id)
            mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif fmt == 'pdf':
            create_pdf(content, temp_path, template_id=normalized_template_id)
            mimetype = 'application/pdf'
        else:
            return jsonify({'error': 'Invalid format'}), 400

        # Log download history if user is logged in
        identity = get_jwt_identity()
        user_id = int(identity) if identity else None
        if user_id:
            download_record = DownloadHistory(
                resume_title=filename,
                format=fmt,
                template_id=template_id,
                user_id=user_id
            )
            db.session.add(download_record)
            db.session.commit()

        @after_this_request
        def cleanup_temp_file(response):
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception:
                pass
            return response

        return send_file(temp_path, as_attachment=True, download_name=f"{filename}.{fmt}", mimetype=mimetype)
    except UnicodeDecodeError:
        return jsonify({'error': 'Unable to generate file. Please check content encoding.'}), 500
    except Exception as e:
        app.logger.error(f'Download failed: {str(e)}', exc_info=True)
        return jsonify({'error': 'Download failed. Please try again.'}), 500


from services.chatbot import get_chat_response, generate_cover_letter, generate_interview_questions

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')
    mobile = data.get('mobile')
    
    if not email and not mobile:
        return jsonify({'error': 'Email or mobile is required'}), 400
        
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(seconds=60)
    
    # Save OTP
    otp_record = OTPVerification(email=email, mobile=mobile, code=code, expires_at=expires_at, verified=False)
    db.session.add(otp_record)
    db.session.commit()
    
    return jsonify({
        'message': 'Simulated OTP sent successfully',
        'code': code
    }), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    password = data.get('password')

    if not name or not email or not password or not mobile:
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    if User.query.filter_by(mobile=mobile).first():
        return jsonify({'error': 'Mobile number already registered'}), 400

    # Generate registration OTP
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(seconds=60)
    
    # Delete any existing unverified OTPs for this email/mobile to clean up
    OTPVerification.query.filter((OTPVerification.email == email) | (OTPVerification.mobile == mobile)).delete()
    
    otp_record = OTPVerification(email=email, mobile=mobile, code=code, expires_at=expires_at, verified=False)
    db.session.add(otp_record)
    db.session.commit()

    return jsonify({
        'otp_required': True,
        'code': code,
        'message': 'OTP sent to mobile/email'
    }), 200

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    password = data.get('password')
    code = data.get('code')

    if not name or not email or not mobile or not password or not code:
        return jsonify({'error': 'Missing required fields'}), 400

    # Find the latest unverified code
    otp = OTPVerification.query.filter_by(
        email=email, 
        mobile=mobile, 
        code=code, 
        verified=False
    ).filter(OTPVerification.expires_at > datetime.utcnow()).order_by(OTPVerification.id.desc()).first()

    if not otp:
        return jsonify({'error': 'Invalid or expired OTP code'}), 400

    # Mark OTP as verified
    otp.verified = True
    
    # Double check if user was created in the meantime
    if User.query.filter_by(email=email).first() or User.query.filter_by(mobile=mobile).first():
        db.session.commit()
        return jsonify({'error': 'User already registered'}), 400

    user = User(name=name, email=email, mobile=mobile)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'User registered successfully',
        'user': {'name': user.name, 'email': user.email, 'mobile': user.mobile},
        'access_token': access_token
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username') # can be email or mobile
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    # Find user by email or mobile
    user = User.query.filter((User.email == username) | (User.mobile == username)).first()
    
    if user and user.check_password(password):
        # Generate login OTP
        code = f"{random.randint(100000, 999999)}"
        expires_at = datetime.utcnow() + timedelta(seconds=60)
        
        # Clean up old OTPs
        OTPVerification.query.filter((OTPVerification.email == user.email) | (OTPVerification.mobile == user.mobile)).delete()
        
        otp_record = OTPVerification(email=user.email, mobile=user.mobile, code=code, expires_at=expires_at, verified=False)
        db.session.add(otp_record)
        db.session.commit()
        
        return jsonify({
            'otp_required': True,
            'email': user.email,
            'mobile': user.mobile,
            'code': code,
            'message': 'OTP sent for 2FA verification'
        }), 200
        
    return jsonify({'error': 'Invalid email/mobile or password'}), 401

@app.route('/api/verify-login-otp', methods=['POST'])
def verify_login_otp():
    data = request.json
    username = data.get('username') # email or mobile
    code = data.get('code')

    if not username or not code:
        return jsonify({'error': 'Username and code are required'}), 400

    user = User.query.filter((User.email == username) | (User.mobile == username)).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Find the latest unverified code
    otp = OTPVerification.query.filter(
        ((OTPVerification.email == user.email) | (OTPVerification.mobile == user.mobile)),
        OTPVerification.code == code,
        OTPVerification.verified == False
    ).filter(OTPVerification.expires_at > datetime.utcnow()).order_by(OTPVerification.id.desc()).first()

    if not otp:
        return jsonify({'error': 'Invalid or expired OTP code'}), 400

    otp.verified = True
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Login successful',
        'user': {'name': user.name, 'email': user.email, 'mobile': user.mobile},
        'access_token': access_token
    })


@app.route('/api/chat', methods=['POST'])
@jwt_required(optional=True)
def chat():
    data = request.json
    message = data.get('message')
    resume_text = data.get('resume_text')
    history = data.get('history', [])
    identity = get_jwt_identity()
    user_id = int(identity) if identity else None

    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    response_text = get_chat_response(message, resume_text=resume_text, history=history)

    # Save to history if logged in
    if user_id:
        chat_msg_user = ChatMessage(role='user', message=message, user_id=user_id)
        chat_msg_bot = ChatMessage(role='bot', message=response_text, user_id=user_id)
        db.session.add(chat_msg_user)
        db.session.add(chat_msg_bot)
        db.session.commit()

    return jsonify({'response': response_text})

@app.route('/api/cover-letter', methods=['POST'])
def cover_letter():
    data = request.json
    resume_text = data.get('resume_text', '')
    jd_text = data.get('jd_text', '')
    doc_type = data.get('doc_type', 'cover_letter')
    writing_style = data.get('writing_style', 'professional')
    if not resume_text:
        return jsonify({'error': 'Resume text is required'}), 400
        
    letter = generate_cover_letter(resume_text, jd_text, doc_type=doc_type, writing_style=writing_style)
    return jsonify({'cover_letter': letter})

@app.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found or unauthorized"}), 404
    
    db.session.delete(resume)
    db.session.commit()
    return jsonify({"message": "Resume deleted successfully"})

@app.route('/api/interview-prep', methods=['POST'])
def interview_prep():
    data = request.json
    resume_text = data.get('resume_text', '')
    jd_text = data.get('jd_text', '')
    if not resume_text:
        return jsonify({'error': 'Resume text is required'}), 400
        
    questions = generate_interview_questions(resume_text, jd_text)
    return jsonify({'questions': questions})

@app.route('/api/resumes', methods=['GET'])
@jwt_required()
def get_resumes():
    user_id = int(get_jwt_identity())
    resumes = Resume.query.filter_by(user_id=user_id).order_by(Resume.updated_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'title': r.title,
        'content': r.content,
        'template_id': r.template_id,
        'created_at': r.created_at.isoformat(),
        'updated_at': r.updated_at.isoformat(),
        'is_favorite': r.is_favorite
    } for r in resumes])

@app.route('/api/resumes', methods=['POST'])
@jwt_required()
def save_resume():
    user_id = int(get_jwt_identity())
    data = request.json
    
    resume_id = data.get('id')
    title = data.get('title', 'Untitled Resume')
    content = data.get('content')
    template_id = data.get('template_id', 'cc-001')
    
    if not content:
        return jsonify({"error": "Content is required"}), 400
        
    if resume_id:
        resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
        if not resume:
            return jsonify({"error": "Resume not found or unauthorized"}), 404
        resume.title = title
        resume.content = content
        resume.template_id = template_id
        resume.updated_at = datetime.utcnow()
    else:
        resume = Resume(
            title=title,
            content=content,
            template_id=template_id,
            user_id=user_id
        )
        db.session.add(resume)
        
    db.session.commit()
    
    return jsonify({
        "message": "Resume saved successfully",
        "id": resume.id
    })

@app.route('/api/resumes/<int:resume_id>/duplicate', methods=['POST'])
@jwt_required()
def duplicate_resume(resume_id):
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        return jsonify({"error": "Resume not found"}), 404
    
    duplicated_resume = Resume(
        title=f"{resume.title} (Copy)",
        content=resume.content,
        template_id=resume.template_id,
        user_id=user_id,
        version_tag=resume.version_tag,
        is_favorite=resume.is_favorite
    )
    db.session.add(duplicated_resume)
    db.session.commit()
    
    return jsonify({
        "message": "Resume duplicated successfully",
        "id": duplicated_resume.id,
        "title": duplicated_resume.title
    }), 201

@app.route('/api/analyses', methods=['GET'])
@jwt_required()
def get_analyses():
    user_id = int(get_jwt_identity())
    analyses = Analysis.query.filter_by(user_id=user_id).order_by(Analysis.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'match_score': a.match_score,
        'report_json': a.report_json,
        'jd_text': a.jd_text,
        'resume_id': a.resume_id,
        'created_at': a.created_at.isoformat()
    } for a in analyses])

@app.route('/api/downloads', methods=['GET'])
@jwt_required()
def get_downloads():
    user_id = int(get_jwt_identity())
    downloads = DownloadHistory.query.filter_by(user_id=user_id).order_by(DownloadHistory.created_at.desc()).all()
    return jsonify([{
        'id': d.id,
        'resume_title': d.resume_title,
        'format': d.format,
        'template_id': d.template_id,
        'created_at': d.created_at.isoformat()
    } for d in downloads])


# ============================================================
# ADMIN API ROUTES
# ============================================================
# Protected with admin key. Set ADMIN_API_KEY in .env
# Access: Add header "X-Admin-Key: your-admin-key"
# ============================================================

ADMIN_API_KEY = os.environ.get('ADMIN_API_KEY', 'admin-secret-key-123')

def require_admin(f):
    """Decorator to protect admin routes with API key"""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-Admin-Key', '')
        if api_key != ADMIN_API_KEY:
            return jsonify({'error': 'Unauthorized. Provide valid X-Admin-Key header.'}), 401
        return f(*args, **kwargs)
    return decorated


@app.route('/api/admin/stats', methods=['GET'])
@require_admin
def admin_stats():
    """Overview statistics of the entire platform"""
    total_users = User.query.count()
    total_resumes = Resume.query.count()
    total_analyses = Analysis.query.count()
    total_downloads = DownloadHistory.query.count()
    total_chats = ChatMessage.query.count()
    total_cover_letters = CoverLetter.query.count()
    
    # Recent activity counts (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_week = User.query.filter(User.created_at >= week_ago).count()
    new_resumes_week = Resume.query.filter(Resume.created_at >= week_ago).count()
    new_downloads_week = DownloadHistory.query.filter(DownloadHistory.created_at >= week_ago).count()
    
    return jsonify({
        'total': {
            'users': total_users,
            'resumes': total_resumes,
            'analyses': total_analyses,
            'downloads': total_downloads,
            'chat_messages': total_chats,
            'cover_letters': total_cover_letters
        },
        'last_7_days': {
            'new_users': new_users_week,
            'new_resumes': new_resumes_week,
            'new_downloads': new_downloads_week
        }
    })


@app.route('/api/admin/users', methods=['GET'])
@require_admin
def admin_users():
    """List all users with their resume counts"""
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'mobile': u.mobile,
        'created_at': u.created_at.isoformat() if u.created_at else None,
        'resume_count': len(u.resumes),
        'download_count': len(u.downloads)
    } for u in users])


@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
@require_admin
def admin_user_detail(user_id):
    """Full details of a single user — resumes, analyses, downloads, chats"""
    user = User.query.get_or_404(user_id)
    
    resumes = [{
        'id': r.id,
        'title': r.title,
        'template_id': r.template_id,
        'version_tag': r.version_tag,
        'is_favorite': r.is_favorite,
        'created_at': r.created_at.isoformat() if r.created_at else None,
        'updated_at': r.updated_at.isoformat() if r.updated_at else None
    } for r in Resume.query.filter_by(user_id=user.id).order_by(Resume.updated_at.desc()).all()]
    
    analyses = [{
        'id': a.id,
        'match_score': a.match_score,
        'jd_text': a.jd_text[:200] + '...' if a.jd_text and len(a.jd_text) > 200 else a.jd_text,
        'resume_id': a.resume_id,
        'created_at': a.created_at.isoformat() if a.created_at else None
    } for a in Analysis.query.filter_by(user_id=user.id).order_by(Analysis.created_at.desc()).all()]
    
    downloads = [{
        'id': d.id,
        'resume_title': d.resume_title,
        'format': d.format,
        'template_id': d.template_id,
        'created_at': d.created_at.isoformat() if d.created_at else None
    } for d in DownloadHistory.query.filter_by(user_id=user.id).order_by(DownloadHistory.created_at.desc()).all()]
    
    chat_messages = [{
        'id': c.id,
        'role': c.role,
        'message': c.message[:300] + '...' if len(c.message) > 300 else c.message,
        'created_at': c.created_at.isoformat() if c.created_at else None
    } for c in ChatMessage.query.filter_by(user_id=user.id).order_by(ChatMessage.created_at.desc()).limit(50).all()]
    
    return jsonify({
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'mobile': user.mobile,
            'created_at': user.created_at.isoformat() if user.created_at else None
        },
        'resumes': resumes,
        'analyses': analyses,
        'downloads': downloads,
        'chat_messages': chat_messages
    })


@app.route('/api/admin/recent-activity', methods=['GET'])
@require_admin
def admin_recent_activity():
    """Latest signups, downloads, and analyses across all users"""
    recent_users = [{
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'created_at': u.created_at.isoformat() if u.created_at else None
    } for u in User.query.order_by(User.created_at.desc()).limit(10).all()]
    
    recent_downloads = [{
        'user': User.query.get(d.user_id).name if User.query.get(d.user_id) else 'Unknown',
        'resume_title': d.resume_title,
        'format': d.format,
        'created_at': d.created_at.isoformat() if d.created_at else None
    } for d in DownloadHistory.query.order_by(DownloadHistory.created_at.desc()).limit(10).all()]
    
    recent_analyses = [{
        'user': User.query.get(a.user_id).name if User.query.get(a.user_id) else 'Unknown',
        'match_score': a.match_score,
        'created_at': a.created_at.isoformat() if a.created_at else None
    } for a in Analysis.query.order_by(Analysis.created_at.desc()).limit(10).all()]
    
    return jsonify({
        'recent_signups': recent_users,
        'recent_downloads': recent_downloads,
        'recent_analyses': recent_analyses
    })


@app.route('/admin')
def admin_dashboard_page():
    """Visual Admin Dashboard — White & Blue Theme"""
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard - Resume Modifier</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #f0f4ff; color: #1e293b; min-height: 100vh; }

  /* ===== LOGIN SCREEN ===== */
  .login-screen {
    display: flex; align-items: center; justify-content: center; min-height: 100vh;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  }
  .login-box {
    background: #ffffff; padding: 48px 40px; border-radius: 20px; width: 420px;
    text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.15);
  }
  .login-logo {
    width: 56px; height: 56px; background: linear-gradient(135deg, #1e40af, #3b82f6);
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; font-size: 24px; color: white; font-weight: 800;
  }
  .login-box h1 { font-size: 26px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
  .login-box p { color: #64748b; margin-bottom: 28px; font-size: 14px; }
  .login-box input {
    width: 100%; padding: 14px 18px; background: #f8fafc; border: 2px solid #e2e8f0;
    border-radius: 10px; color: #1e293b; font-size: 15px; margin-bottom: 16px;
    outline: none; font-family: inherit; transition: border 0.2s;
  }
  .login-box input:focus { border-color: #3b82f6; background: #fff; }
  .login-box button {
    width: 100%; padding: 14px; background: linear-gradient(135deg, #1e40af, #3b82f6);
    color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer;
    font-weight: 600; font-family: inherit; transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 15px rgba(59,130,246,0.4);
  }
  .login-box button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,0.5); }
  .login-box button:active { transform: translateY(0); }
  .login-error { color: #dc2626; font-size: 13px; margin-bottom: 12px; display: none; font-weight: 500; }
  .login-hint { margin-top: 20px; font-size: 12px; color: #94a3b8; }

  /* ===== DASHBOARD ===== */
  .dashboard { display: none; }

  /* Header */
  .header {
    background: #ffffff; padding: 0 32px; display: flex; justify-content: space-between;
    align-items: center; border-bottom: 1px solid #e2e8f0; height: 64px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 50;
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .header-icon {
    width: 36px; height: 36px; background: linear-gradient(135deg, #1e40af, #3b82f6);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: white; font-weight: 800;
  }
  .header h1 { font-size: 18px; font-weight: 700; color: #1e293b; }
  .header-right { display: flex; align-items: center; gap: 12px; }
  .db-badge {
    background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 20px;
    font-size: 12px; font-weight: 600; border: 1px solid #a7f3d0;
  }
  .refresh-btn {
    background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 6px 14px;
    border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 500;
    font-family: inherit; transition: all 0.2s;
  }
  .refresh-btn:hover { background: #dbeafe; }

  .content { max-width: 1240px; margin: 0 auto; padding: 28px 24px; }

  /* ===== DATABASE INFO BAR ===== */
  .db-info {
    background: #eff6ff; padding: 14px 20px; border-radius: 12px; font-size: 13px;
    color: #1e40af; margin-bottom: 24px; border: 1px solid #bfdbfe;
    display: flex; align-items: center; gap: 8px; font-weight: 500;
  }
  .db-info svg { flex-shrink: 0; }

  /* ===== STATS CARDS ===== */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: #ffffff; padding: 24px 20px; border-radius: 14px;
    border: 1px solid #e2e8f0; text-align: center;
    transition: transform 0.2s, box-shadow 0.2s; cursor: default;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }
  .stat-icon { font-size: 28px; margin-bottom: 8px; }
  .stat-card .number { font-size: 36px; font-weight: 800; color: #1e40af; line-height: 1; }
  .stat-card .label { font-size: 13px; color: #64748b; margin-top: 6px; font-weight: 500; }

  /* ===== SECTIONS ===== */
  .section {
    background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0;
    margin-bottom: 24px; overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .section-header {
    padding: 18px 22px; border-bottom: 1px solid #f1f5f9; font-size: 16px;
    font-weight: 600; display: flex; justify-content: space-between; align-items: center;
    color: #1e293b;
  }
  .section-header .count {
    background: #1e40af; color: white; padding: 3px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 600;
  }

  /* ===== TABLE ===== */
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; padding: 12px 18px; font-size: 11px; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.6px; background: #f8fafc;
    font-weight: 600; border-bottom: 1px solid #e2e8f0;
  }
  td { padding: 14px 18px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
  .user-row { cursor: pointer; transition: background 0.15s; }
  .user-row:hover td { background: #eff6ff; }

  /* ===== TAGS ===== */
  .tag { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
  .tag-pdf { background: #fef3c7; color: #b45309; }
  .tag-docx { background: #dbeafe; color: #1e40af; }
  .tag-score-high { background: #d1fae5; color: #065f46; }
  .tag-score-mid { background: #fef3c7; color: #92400e; }

  /* ===== MODAL ===== */
  .modal-overlay {
    display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.5);
    z-index: 100; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0;
    width: 90%; max-width: 820px; max-height: 85vh; overflow-y: auto; padding: 32px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.15);
  }
  .modal-close {
    float: right; background: #f1f5f9; border: none; color: #64748b;
    font-size: 20px; cursor: pointer; width: 36px; height: 36px;
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .modal-close:hover { background: #fee2e2; color: #dc2626; }
  .modal h2 { font-size: 22px; color: #1e40af; margin-bottom: 4px; font-weight: 700; }
  .modal .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
  .detail-section { margin-top: 24px; }
  .detail-section h3 {
    font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px;
    margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #eff6ff; font-weight: 600;
  }
  .detail-item {
    background: #f8fafc; padding: 14px 18px; border-radius: 10px; margin-bottom: 8px;
    font-size: 13px; border: 1px solid #f1f5f9;
  }
  .detail-item .title { color: #1e293b; font-weight: 600; }
  .detail-item .sub { color: #64748b; margin-top: 4px; line-height: 1.5; }

  /* ===== LOADING ===== */
  .loading { text-align: center; padding: 40px; color: #94a3b8; }
  .spinner {
    display: inline-block; width: 32px; height: 32px;
    border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6;
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .header { padding: 0 16px; }
    .content { padding: 20px 16px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .login-box { width: 92%; padding: 32px 24px; }
    table { font-size: 13px; }
    th, td { padding: 10px 12px; }
  }
</style>
</head>
<body>

<!-- LOGIN SCREEN -->
<div class="login-screen" id="loginScreen">
  <div class="login-box">
    <div class="login-logo">RM</div>
    <h1>Admin Dashboard</h1>
    <p>Resume Modifier Platform</p>
    <div class="login-error" id="loginError">Invalid admin key. Please try again.</div>
    <input type="password" id="adminKeyInput" placeholder="Enter Admin Access Key" autofocus>
    <button onclick="doLogin()">Access Dashboard</button>
    <div class="login-hint">Contact the administrator for access credentials</div>
  </div>
</div>

<!-- DASHBOARD -->
<div class="dashboard" id="dashboard">
  <div class="header">
    <div class="header-left">
      <div class="header-icon">RM</div>
      <h1>Admin Dashboard</h1>
    </div>
    <div class="header-right">
      <button class="refresh-btn" onclick="loadDashboard()">Refresh</button>
      <span class="db-badge" id="dbBadge">Loading...</span>
    </div>
  </div>

  <div class="content">
    <!-- DB Info -->
    <div class="db-info" id="dbPath">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      Database: Loading...
    </div>

    <!-- Stats -->
    <div class="stats-grid" id="statsGrid">
      <div class="stat-card"><div class="stat-icon">&#128101;</div><div class="number" id="statUsers">-</div><div class="label">Total Users</div></div>
      <div class="stat-card"><div class="stat-icon">&#128196;</div><div class="number" id="statResumes">-</div><div class="label">Resumes</div></div>
      <div class="stat-card"><div class="stat-icon">&#128200;</div><div class="number" id="statAnalyses">-</div><div class="label">Analyses</div></div>
      <div class="stat-card"><div class="stat-icon">&#128229;</div><div class="number" id="statDownloads">-</div><div class="label">Downloads</div></div>
      <div class="stat-card"><div class="stat-icon">&#128172;</div><div class="number" id="statChats">-</div><div class="label">Chat Messages</div></div>
      <div class="stat-card"><div class="stat-icon">&#9993;</div><div class="number" id="statLetters">-</div><div class="label">Cover Letters</div></div>
    </div>

    <!-- Users Table -->
    <div class="section">
      <div class="section-header">All Users <span class="count" id="userCount">0</span></div>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Resumes</th><th>Downloads</th><th>Joined</th></tr></thead>
        <tbody id="usersTable"><tr><td colspan="7" class="loading"><div class="spinner"></div></td></tr></tbody>
      </table>
    </div>

    <!-- Recent Downloads -->
    <div class="section">
      <div class="section-header">Recent Downloads</div>
      <table>
        <thead><tr><th>User</th><th>Resume</th><th>Format</th><th>Date</th></tr></thead>
        <tbody id="downloadsTable"><tr><td colspan="4" class="loading"><div class="spinner"></div></td></tr></tbody>
      </table>
    </div>

    <!-- Recent Analyses -->
    <div class="section">
      <div class="section-header">Recent Analyses</div>
      <table>
        <thead><tr><th>User</th><th>Match Score</th><th>Date</th></tr></thead>
        <tbody id="analysesTable"><tr><td colspan="3" class="loading"><div class="spinner"></div></td></tr></tbody>
      </table>
    </div>
  </div>
</div>

<!-- USER DETAIL MODAL -->
<div class="modal-overlay" id="userModal" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <div id="userDetail"><div class="loading"><div class="spinner"></div></div></div>
  </div>
</div>

<script>
let API_KEY = '';

function doLogin() {
  API_KEY = document.getElementById('adminKeyInput').value;
  fetch('/api/admin/stats', { headers: { 'X-Admin-Key': API_KEY } })
    .then(r => { if (!r.ok) throw new Error('Unauthorized'); return r.json(); })
    .then(() => {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      loadDashboard();
    })
    .catch(() => {
      const err = document.getElementById('loginError');
      err.style.display = 'block';
      document.getElementById('adminKeyInput').style.borderColor = '#dc2626';
      setTimeout(() => { err.style.display = 'none'; document.getElementById('adminKeyInput').style.borderColor = '#e2e8f0'; }, 3000);
    });
}

document.getElementById('adminKeyInput').addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });

function api(endpoint) {
  return fetch(endpoint, { headers: { 'X-Admin-Key': API_KEY } }).then(r => r.json());
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadDashboard() {
  const stats = await api('/api/admin/stats');
  document.getElementById('statUsers').textContent = stats.total.users;
  document.getElementById('statResumes').textContent = stats.total.resumes;
  document.getElementById('statAnalyses').textContent = stats.total.analyses;
  document.getElementById('statDownloads').textContent = stats.total.downloads;
  document.getElementById('statChats').textContent = stats.total.chat_messages;
  document.getElementById('statLetters').textContent = stats.total.cover_letters;
  document.getElementById('dbBadge').textContent = 'Connected';
  document.getElementById('dbPath').innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> Database: SQLite (resume_optimizer.db) &nbsp;|&nbsp; This week: ' + stats.last_7_days.new_users + ' new users, ' + stats.last_7_days.new_resumes + ' resumes, ' + stats.last_7_days.new_downloads + ' downloads';

  const users = await api('/api/admin/users');
  document.getElementById('userCount').textContent = users.length;
  document.getElementById('usersTable').innerHTML = users.map(u =>
    '<tr class="user-row" onclick="showUser(' + u.id + ')">' +
    '<td><strong style="color:#1e40af">#' + u.id + '</strong></td>' +
    '<td><strong>' + u.name + '</strong></td>' +
    '<td>' + u.email + '</td>' +
    '<td>' + (u.mobile || '-') + '</td>' +
    '<td style="text-align:center">' + u.resume_count + '</td>' +
    '<td style="text-align:center">' + u.download_count + '</td>' +
    '<td style="color:#64748b">' + formatDate(u.created_at) + '</td></tr>'
  ).join('');

  const activity = await api('/api/admin/recent-activity');
  document.getElementById('downloadsTable').innerHTML = activity.recent_downloads.length ? activity.recent_downloads.map(d =>
    '<tr><td>' + d.user + '</td><td>' + d.resume_title + '</td><td><span class="tag tag-' + d.format + '">' + d.format.toUpperCase() + '</span></td><td style="color:#64748b">' + formatDate(d.created_at) + '</td></tr>'
  ).join('') : '<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:28px">No downloads yet</td></tr>';

  document.getElementById('analysesTable').innerHTML = activity.recent_analyses.length ? activity.recent_analyses.map(a =>
    '<tr><td>' + a.user + '</td><td><span class="tag ' + (a.match_score >= 75 ? 'tag-score-high' : 'tag-score-mid') + '">' + a.match_score + '%</span></td><td style="color:#64748b">' + formatDate(a.created_at) + '</td></tr>'
  ).join('') : '<tr><td colspan="3" style="text-align:center;color:#94a3b8;padding:28px">No analyses yet</td></tr>';
}

async function showUser(userId) {
  document.getElementById('userModal').style.display = 'flex';
  document.getElementById('userDetail').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  const data = await api('/api/admin/users/' + userId);
  const u = data.user;

  let html = '<h2>' + u.name + '</h2>';
  html += '<div class="meta">' + u.email + ' &nbsp;|&nbsp; ' + (u.mobile || 'No mobile') + ' &nbsp;|&nbsp; Joined: ' + formatDate(u.created_at) + '</div>';

  html += '<div class="detail-section"><h3>Resumes (' + data.resumes.length + ')</h3>';
  data.resumes.forEach(r => {
    html += '<div class="detail-item"><div class="title">' + r.title + '</div><div class="sub">Template: ' + r.template_id + ' &nbsp;|&nbsp; Version: ' + (r.version_tag || '-') + (r.is_favorite ? ' &nbsp;|&nbsp; Favorite' : '') + ' &nbsp;|&nbsp; Updated: ' + formatDate(r.updated_at) + '</div></div>';
  });
  if (!data.resumes.length) html += '<div class="detail-item"><div class="sub">No resumes saved</div></div>';
  html += '</div>';

  html += '<div class="detail-section"><h3>ATS Analyses (' + data.analyses.length + ')</h3>';
  data.analyses.forEach(a => {
    html += '<div class="detail-item"><div class="title">Match Score: <span class="tag ' + (a.match_score >= 75 ? 'tag-score-high' : 'tag-score-mid') + '">' + a.match_score + '%</span></div><div class="sub">' + (a.jd_text || 'No job description') + '</div></div>';
  });
  if (!data.analyses.length) html += '<div class="detail-item"><div class="sub">No analyses yet</div></div>';
  html += '</div>';

  html += '<div class="detail-section"><h3>Downloads (' + data.downloads.length + ')</h3>';
  data.downloads.forEach(d => {
    html += '<div class="detail-item"><div class="title">' + d.resume_title + ' &nbsp;<span class="tag tag-' + d.format + '">' + d.format.toUpperCase() + '</span></div><div class="sub">' + formatDate(d.created_at) + '</div></div>';
  });
  if (!data.downloads.length) html += '<div class="detail-item"><div class="sub">No downloads yet</div></div>';
  html += '</div>';

  html += '<div class="detail-section"><h3>Chat History (' + data.chat_messages.length + ')</h3>';
  data.chat_messages.forEach(c => {
    html += '<div class="detail-item" style="border-left:3px solid ' + (c.role === 'user' ? '#3b82f6' : '#10b981') + '"><div class="title" style="color:' + (c.role === 'user' ? '#1e40af' : '#059669') + '">' + (c.role === 'user' ? 'User' : 'AI Bot') + '</div><div class="sub">' + c.message + '</div></div>';
  });
  if (!data.chat_messages.length) html += '<div class="detail-item"><div class="sub">No chat messages</div></div>';
  html += '</div>';

  document.getElementById('userDetail').innerHTML = html;
}

function closeModal() { document.getElementById('userModal').style.display = 'none'; }
</script>
</body>
</html>'''


if __name__ == '__main__':
    app.run(debug=True, port=5000)

