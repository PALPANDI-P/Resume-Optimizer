import random
import re
import logging

try:
    import google.generativeai as genai
    import os
    API_KEY = os.environ.get("GEMINI_API_KEY")
    if API_KEY:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
    else:
        model = None
except ImportError:
    model = None

logger = logging.getLogger(__name__)

# Fallback intelligent responses
FALLBACK_RESPONSES = {
    'greeting': [
        "👋 Hello! I'm your Resume Optimizer Career Assistant. I can help you with:\n• ATS Optimization strategies\n• Resume builder & styling guidance\n• Cover letter generation support\n• Website usage & troubleshooting\n• Recruiter evaluation insights\nWhat would you like to focus on today?",
        "Hi there! Ready to build or optimize a recruiter-approved resume? 🚀 Ask me about ATS keywords, cover letter workflows, or how to use the different sections of our website.",
        "Welcome! As your AI career advisor, I am here to help you stand out. Ask me anything about resumes, portfolios, cover letters, or how to get the most out of our Resume Optimizer tools!"
    ],
    'ats': [
        "🤖 **ATS Optimization Strategy:**\n\n1. **Use Exact Keywords:** Match skills from the job description exactly (e.g. use 'Project Management' if they write that, rather than 'Managing Projects').\n2. **Clean Structure:** Stick to standard headings like 'Work Experience', 'Education', and 'Skills'. ATS parsers fail when headers are creative or non-standard.\n3. **Formatting Rules:** Avoid multi-column layouts, tables, images, or skill level bars. ATS cannot parse visual graphics.\n\nWould you like me to scan your active resume draft for ATS compatibility?",
        "ATS systems look for exact matches. The best strategy is to create a 'Skills' or 'Core Competencies' section populated with 8-12 keywords directly from the job description. Our 'Advanced Resume Optimization' section does this automatically by comparing your resume text with the job description!",
        "Did you know? Over 75% of resumes are filtered out before a human recruiter even sees them. Using standard fonts (like Inter, Roboto, or Helvetica) and structured bullet points prevents parsing errors. What job title or industry are you targeting?"
    ],
    'cover_letter': [
        "📝 **Cover Letter Best Practices:**\n• **The Hook:** Explain exactly why you are excited about *this specific* company and role in the first 2 sentences.\n• **The Value:** Share 1-2 quantified accomplishments that match their needs instead of just listing duties.\n• **The CTA:** End with a confident request to schedule a brief discussion.\n\nUse our 'Cover Letter Workspace' tab to generate a custom letter using Option A (Resume only) or Option B (Resume + Job Description)!",
        "Keep cover letters brief (under 300 words). Recruiters scan cover letters in less than 15 seconds. Use standard letter formats (Corporate, Modern, Minimal) available in our workspace to match your resume style!"
    ],
    'interview': [
        "🎯 **Behavioral Interview Preparation (The STAR Method):**\nWhen asked behavioral questions, format your answers with:\n• **S**ituation: Describe the context (1-2 sentences).\n• **T**ask: Explain the goal or problem you needed to solve.\n• **A**ction: Detail the specific steps *you* took (use strong action verbs).\n• **R**esult: Quantify the outcome (e.g., 'saved $5k', 'improved efficiency by 20%').",
        "The best questions to ask at the end of an interview are strategic: \n1. 'What does success look like in the first 90 days of this role?'\n2. 'What is the biggest challenge the team is currently working to resolve?'\nThese show you are already thinking like an owner."
    ],
    'length': [
        "📏 **Ideal Resume Length:**\n• **0-7 years experience:** Keep it strictly to 1 page.\n• **8+ years or specialized research roles:** 2 pages is acceptable if all content is highly relevant.\n\nRecruiters spend an average of 6-7 seconds on their initial scan. Make sure your highest-impact points are in the top half of page one!"
    ],
    'experience': [
        "💼 **Writing Strong Achievement Bullets:**\nAlways lead with a strong action verb and follow with a quantifiable metric:\n*Weak:* Managed client accounts and updated databases.\n*Strong:* **Cultivated** 15+ premium accounts, increasing retention rate by 18% and automating database tracking to save 4 hours weekly.\n\nWhat bullet point or job description from your experience would you like to rewrite?",
        "Avoid listing job duties. Focus on impact: did you save money, save time, build a process, or lead a team? Always use active language (e.g., 'Engineered', 'Optimized', 'Negotiated', 'Spearheaded')."
    ],
    'website_usage': [
        "💻 **Resume Optimizer Guide & Troubleshooting:**\n\n• **Free Resume Builder:** Head to the 'Free Resume Builder' tab. You can add, edit, or delete sections dynamically. Changes are saved automatically as a draft in your browser.\n• **Applying Templates:** Open the 'ATS Template Gallery' tab to view layout options. Click 'Apply Template' to populate the builder with that style.\n• **PDF/DOCX Downloads:** Once your resume is ready, click 'Download PDF' or 'Download DOCX' in the builder or preview pane to save a clean, recruiter-approved document.\n• **Resume Analysis:** Go to the 'Advanced Resume Optimization' tab, upload your resume or import your active builder draft, paste the job description, and hit 'Analyze'. It gives you an ATS match score, keyword comparison, and recommendations.",
        "If you encounter a download or save error: \n1. Make sure you have entered your Full Name in the 'Personal Info' tab of the builder.\n2. Verify that there are no empty sections (e.g., an experience block without a job title).\n3. Try refreshing the page; your draft is saved in local storage so you won't lose your progress!"
    ],
    'default': [
        "That's a great question. In career strategy, detail is everything. Let me know which industry you are targeting, or paste a draft bullet point here so I can give you specific optimization tips!",
        "Interesting! Recruiters look for a combination of core hard skills and quantifiable results. Would you like to know which keywords are most important for your target job title?",
        "I understand. Let's work on polishing your profile. If you have a specific question about formatting, ATS parsers, cover letter, or website navigation, just let me know!"
    ]
}

def get_chat_response(message: str, resume_text: str = None, history: list = None) -> str:
    """Generate a response for the chatbot, varying the answers for similar questions and incorporating history."""
    
    # 1. Incomplete/Short queries check
    words = message.strip().split()
    if len(words) < 2:
        return f"It looks like you entered a very short query: '{message}'. Could you please tell me more about what you're trying to achieve? E.g., 'How can I optimize my software engineer resume?' or 'What projects should I list?'"

    # 2. Check for spelling typos
    typos_map = {
        'resum': 'resume', 'resme': 'resume',
        'covr': 'cover', 'letr': 'letter', 'lettr': 'letter',
        'intervw': 'interview', 'intrvw': 'interview',
        'exprience': 'experience', 'exprnce': 'experience',
        'skils': 'skills', 'skillz': 'skills',
        'manger': 'manager', 'certficate': 'certificate',
        'achievment': 'achievement'
    }
    
    typo_notes = []
    lower_msg = message.lower()
    for typo, correction in typos_map.items():
        if re.search(r'\b' + re.escape(typo) + r'\b', lower_msg):
            typo_notes.append(f"'{typo}' (should be '{correction}')")
            
    typo_prefix = ""
    if typo_notes:
        typo_prefix = f"*(Note: I noticed a minor spelling typo in your message: {', '.join(typo_notes)}. Be sure to scan your resume for similar typos, as spelling errors are a top reason for recruiter rejection!)*\n\n"

    # Pre-process message: clean up basic spelling mistakes for local matching
    msg_clean = lower_msg.strip()
    for typo, correction in typos_map.items():
        if typo in msg_clean:
            msg_clean = msg_clean.replace(typo, correction)

    # 3. Detect experience level
    experience_level = 'mid'
    if any(w in msg_clean or (resume_text and w in resume_text.lower()) for w in ['fresher', 'junior', 'student', 'graduate', 'entry', 'college', 'intern', 'beginner', 'no experience']):
        experience_level = 'fresher'
    elif any(w in msg_clean or (resume_text and w in resume_text.lower()) for w in ['senior', 'lead', 'manager', 'executive', 'director', 'vp', 'principal', 'years of experience']):
        experience_level = 'executive'

    # Try using Gemini AI if available
    if model:
        try:
            profile_context = f"\nCandidate Profile/Resume Context:\n{resume_text[:2000]}\n" if resume_text else ""
            history_context = ""
            if history:
                history_context = "\nConversation History:\n"
                for msg in history[-10:]: # Look at last 10 messages for context
                    role_label = "User" if msg.get('role') == 'user' else "Advisor"
                    history_context += f"{role_label}: {msg.get('text', '')}\n"
            
            prompt = (
                "You are an expert career and resume advisor for Resume Optimizer. "
                "Provide a concise, professional, and encouraging response to this user query.\n"
                "GUIDELINES:\n"
                "1. If the user's message contains grammatical errors, spelling mistakes, or is incomplete, "
                "comment constructively on them (e.g. point out spelling typos so the user can fix them in their resume too).\n"
                f"2. Adapt your tone and advice to the candidate's detected experience level ({experience_level}). Freshers need guidance on academic projects and potential, while executives need leadership and impact metrics.\n"
                "3. If candidate resume context is provided, personalize your answer by referring to specific skills, companies, or roles listed in their profile.\n"
                "4. Keep your answer brief (under 150 words) and directly relevant. Do not repeat what you said in history.\n"
                f"{profile_context}{history_context}User: {message}\nAdvisor:"
            )
            response = model.generate_content(prompt)
            if response and response.text:
                return typo_prefix + response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            pass # Fall back to local logic
            
    # Local fallback logic (always returns different responses for the same topic)
    prefix = typo_prefix
    if resume_text:
        # Extract name and some skills from resume_text to personalize fallback
        candidate_name = "Candidate"
        lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
        if lines:
            candidate_name = lines[0]
            
        skills_detected = []
        for skill in ['Python', 'React', 'Java', 'SQL', 'Excel', 'Project Management', 'Finance', 'Design']:
            if skill.lower() in resume_text.lower():
                skills_detected.append(skill)
                
        skill_context = f" with your background in {', '.join(skills_detected[:2])}" if skills_detected else ""
        prefix += f"Thanks {candidate_name}. Based on your profile{skill_context}, here is some tailored career advice:\n\n"
        
    # Choose base advice
    base_advice = ""
    if any(word in msg_clean for word in ['hi', 'hello', 'hey', 'start', 'greetings']):
        base_advice = random.choice(FALLBACK_RESPONSES['greeting'])
    elif any(word in msg_clean for word in ['ats', 'tracking', 'system', 'format', 'parse', 'optimiz']):
        base_advice = random.choice(FALLBACK_RESPONSES['ats'])
    elif any(word in msg_clean for word in ['long', 'length', 'pages', 'one page', 'two pages']):
        base_advice = random.choice(FALLBACK_RESPONSES['length'])
    elif any(word in msg_clean for word in ['experience', 'bullet', 'write', 'describe', 'job', 'verb', 'achievement']):
        base_advice = random.choice(FALLBACK_RESPONSES['experience'])
    elif any(word in msg_clean for word in ['cover', 'letter', 'outreach', 'email', 'message']):
        base_advice = random.choice(FALLBACK_RESPONSES['cover_letter'])
    elif any(word in msg_clean for word in ['interview', 'question', 'prep', 'star', 'behavioral', 'tips']):
        base_advice = random.choice(FALLBACK_RESPONSES['interview'])
    elif any(word in msg_clean for word in ['how to', 'help', 'website', 'trouble', 'error', 'bug', 'button', 'download', 'save', 'builder', 'template', 'use', 'page']):
        base_advice = random.choice(FALLBACK_RESPONSES['website_usage'])
    else:
        base_advice = random.choice(FALLBACK_RESPONSES['default'])

    # Append experience level tailored advice
    level_suffix = ""
    if experience_level == 'fresher':
        level_suffix = "\n\n**Fresher Tip:** Since you are starting out or transitioning, make sure to emphasize academic coursework, capstone projects, and technical certifications. Under work experience, focus on learning speed and collaboration in team assignments."
    elif experience_level == 'executive':
        level_suffix = "\n\n**Executive Tip:** As a senior/executive profile, recruiters expect you to outline structural ownership: team size managed, direct budget oversight, cross-departmental alignment, and key business metric growth (revenue, cost savings)."

    return prefix + base_advice + level_suffix

def generate_cover_letter(resume_text: str, jd_text: str, doc_type: str = 'cover_letter', writing_style: str = 'professional') -> str:
    """Generate a cover letter or outreach message based on resume, job description, and writing style."""
    
    style_guidelines = {
        'beginner': "Use beginner-friendly, simple, direct, and entry-level language. Emphasize potential, learning agility, and passion.",
        'professional': "Use standard, highly polished business English. Professional, articulate, and balanced.",
        'corporate': "Use a formal corporate tone. Emphasize processes, collaboration, organizational alignment, and business-focused metrics.",
        'executive': "Use a highly strategic, impact-driven, and leadership-focused tone. Highlight vision, business outcomes, ROI, and driving strategy.",
        'recruiter': "Use a punchy, direct, recruiter-friendly tone. Make it highly scan-readable, call out keywords directly, and quickly highlight matching points.",
        'formal': "Use a traditional, highly structured, respectful, and formal business writing style.",
        'modern': "Use engaging, bold, and forward-thinking industry vocabulary. Show personality, creativity, and enthusiasm."
    }
    style_inst = style_guidelines.get(writing_style, style_guidelines['professional'])

    if model:
        try:
            if doc_type == 'hr_email':
                type_instructions = f"Write a short, engaging cold outreach email to an HR manager. Include a Subject Line at the top. Keep it brief and focused on how the resume matches the JD. {style_inst}"
            elif doc_type == 'recruiter_message':
                type_instructions = f"Write a concise, professional message targeting a recruiter. Explain briefly why the candidate matches the JD and ask for a quick chat. {style_inst}"
            elif doc_type == 'linkedin_note':
                type_instructions = f"Write a highly personalized LinkedIn connection request note. It MUST be under 300 characters total (strictly enforced). No placeholders. {style_inst}"
            else: # cover_letter
                type_instructions = f"Write a professional, concise 3-paragraph cover letter. {style_inst}"
                
            prompt = f"""You are an expert executive career coach. {type_instructions}
Based on this Resume and Job Description.
Do NOT use placeholders like [Your Name] unless absolutely necessary. Leave formatting simple.

Resume: {resume_text[:2000]}
Job Description: {jd_text[:1000]}"""
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            logger.error(f"Gemini API error generating document ({doc_type}): {e}")
            
    # Fallback parsing of candidate details from resume
    candidate_name = "Jane Doe"
    resume_lines = [l.strip() for l in resume_text.split('\n') if l.strip()]
    if resume_lines:
        first_line = resume_lines[0]
        if len(first_line) < 50 and '@' not in first_line and '|' not in first_line:
            candidate_name = first_line

    recent_role = "Professional"
    recent_company = "current organization"
    for line in resume_lines:
        if ' at ' in line:
            parts = line.split(' at ', 1)
            recent_role = parts[0].strip()
            recent_company = parts[1].strip()
            break
        elif '|' in line:
            parts = line.split('|')
            if len(parts) >= 2:
                recent_role = parts[0].strip()
                recent_company = parts[1].strip()
                break

    candidate_skills = []
    common_keywords = ['python', 'java', 'javascript', 'c++', 'react', 'node', 'aws', 'sql', 'project management', 'agile', 'scrum', 'marketing', 'design', 'figma']
    for kw in common_keywords:
        if kw in resume_text.lower():
            candidate_skills.append(kw.title() if kw not in ['aws', 'sql'] else kw.upper())
    
    if not candidate_skills:
        candidate_skills = ["Project Delivery", "Team Collaboration", "Problem Solving"]
    else:
        candidate_skills = candidate_skills[:4]

    # Fallback templates based on doc_type and writing_style
    if doc_type == 'hr_email':
        return f"""Subject: Job Application: Inquiry for Open Roles
 
Dear Hiring Team,
 
I recently came across the open position at your organization and was highly excited by the opportunity. Given my background and experience, I believe I would be an excellent fit for your team.
 
I have attached my resume for your review. I would appreciate the opportunity to speak with you briefly about how my skill set aligns with your team's goals.
 
Best regards,
{candidate_name}"""

    elif doc_type == 'recruiter_message':
        return f"""Hi [Recruiter Name],
 
I hope you are doing well. I noticed your team is looking for talent that matches my background, particularly in relation to the requirements outlined in the job description.
 
With my experience, I have successfully solved similar challenges and would love to schedule a brief 10-minute call to discuss how I can add value.
 
Best,
{candidate_name}"""

    elif doc_type == 'linkedin_note':
        if writing_style == 'beginner':
            return f"Hi! Eager to start my career and saw your team is hiring. I'd love to connect and learn more about the role. - {candidate_name}"
        elif writing_style == 'executive':
            return f"Hello, I noticed your team is expanding. With a track record of driving strategic growth, I would love to connect. - {candidate_name}"
        elif writing_style == 'recruiter':
            return f"Hi! I match your team's open role requirements perfectly. Let's connect for a quick conversation. - {candidate_name}"
        else:
            return f"Hi, I saw your team is hiring. With my experience, I believe I could be a great fit. I'd love to connect. - {candidate_name}"

    else: # cover_letter
        if writing_style == 'beginner':
            return f"""Dear Hiring Manager,
 
I am writing to express my enthusiastic interest in the open position at your company. As an aspiring professional with hands-on experience in {", ".join(candidate_skills[:-1])} and {candidate_skills[-1]}, I am eager to apply my skills, learn from your talented team, and contribute to your projects.
 
Throughout my education and hands-on projects, I have developed a strong foundation in my field, particularly with tools like {candidate_skills[0]}. I am highly motivated to bring my energy and dedication to this position.
 
Thank you for your time and consideration. I would welcome the opportunity to discuss my potential contribution to your team in more detail.
 
Sincerely,
{candidate_name}"""
        elif writing_style == 'executive':
            return f"""Dear Hiring Manager,
 
I am writing to discuss how my strategic leadership experience can drive growth as the new addition to your leadership team. Leveraging my background as {recent_role} at {recent_company}, and my expertise in {", ".join(candidate_skills)}, I am positioned to deliver immediate value.
 
My career is built on delivering high-impact business outcomes and leading organizational transformation. I am particularly drawn to your organization's forward momentum and would welcome the opportunity to align my experience with your strategic goals.
 
Thank you for your consideration. I look forward to exploring how my background aligns with your vision for the future.
 
Sincerely,
{candidate_name}"""
        elif writing_style == 'corporate':
            return f"""Dear Hiring Manager,
 
I am writing to formally submit my application for the open position. Bringing a structured, process-driven approach and extensive experience in corporate environments, including my tenure as {recent_role} at {recent_company}, I am confident in my ability to align with your organization's objectives.
 
In my previous roles, I have successfully managed projects, leveraged skills in {", ".join(candidate_skills[:3])}, and collaborated with diverse business units to optimize efficiency. I look forward to bringing this corporate rigor to your team.
 
Thank you for your time and consideration. I look forward to discussing how my professional credentials can support your corporate strategy.
 
Sincerely,
{candidate_name}"""
        elif writing_style == 'recruiter':
            return f"""Dear Hiring Manager,
 
I am reaching out regarding the open position. A quick scan of my resume reveals direct alignment with your core requirements, specifically in key areas of project delivery, technical execution, and client management. My recent role as {recent_role} at {recent_company} highlights my hands-on application of {", ".join(candidate_skills)}.
 
I pride myself on being direct, results-oriented, and immediately productive. I have consistently met and exceeded key performance indicators (KPIs) in my previous engagements and am ready to do the same for you.
 
Thank you for reviewing my application. I look forward to a prompt discussion regarding how my qualifications meet your team's immediate needs.
 
Sincerely,
{candidate_name}"""
        elif writing_style == 'modern':
            return f"""Dear Hiring Manager,
 
I was thrilled to see the open position at your company. I love your company's innovative culture, and I am excited to offer my dynamic, forward-thinking skill set in {", ".join(candidate_skills[:3])} to help scale your operations, drawing from my experience as {recent_role} at {recent_company}.
 
I believe in building creative, efficient solutions and constantly push the boundaries of what is possible. This role is a perfect match for my passion for innovation and collaboration.
 
Thank you for your time. Let's connect to discuss how we can build something great together.
 
Sincerely,
{candidate_name}"""
        else: # professional, formal
            return f"""Dear Hiring Manager,
 
I am writing to express my enthusiastic interest in the open position at your company. With a strong background as {recent_role} at {recent_company} and a proven track record of delivering results, I am confident in my ability to contribute effectively to your team.
 
Throughout my career, I have consistently demonstrated my ability to solve complex problems using {", ".join(candidate_skills)} and collaborate across departments. I am particularly drawn to this role because it aligns perfectly with my professional goals and allows me to leverage my core competencies to drive success.
 
Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experiences align with your needs in more detail.
 
Sincerely,
{candidate_name}"""

def generate_interview_questions(resume_text: str, jd_text: str) -> list:
    """Generate 5 interview questions based on resume and JD."""
    if model:
        try:
            prompt = f"""You are a technical recruiter. Based on this Resume and Job Description, generate exactly 5 behavioral or technical interview questions.
Format output as a numbered list from 1 to 5, one question per line, no extra text.
Resume: {resume_text[:2000]}
Job Description: {jd_text[:1000]}"""
            response = model.generate_content(prompt)
            if response and response.text:
                questions = [line.strip() for line in response.text.split('\n') if line.strip() and line[0].isdigit()]
                if len(questions) >= 5:
                    return questions[:5]
        except Exception as e:
            logger.error(f"Gemini API error generating questions: {e}")
            
    # Fallback
    return [
        "1. Tell me about a time you faced a significant challenge in your previous role and how you overcame it.",
        "2. Can you describe a project where you had to lead a team or take initiative without direct authority?",
        "3. How do your skills and previous experience directly align with the core requirements of this position?",
        "4. Describe a situation where you had to adapt to a major change in a project's scope or timeline.",
        "5. Where do you see your career progressing in the next 3-5 years, and how does this role fit into that plan?"
    ]
