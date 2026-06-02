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


class ResumeAnalyzer:
    """Extracts structured, actionable insights from raw resume text."""

    def extract_name(self, text):
        lines = text.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line and '@' not in line and '|' not in line and not any(c.isdigit() for c in line[:20]) and len(line) < 60:
                return line
        return None

    def extract_skills(self, text):
        SKILL_PATTERNS = {
            'Programming': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab'],
            'Web': ['html', 'css', 'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'express', 'next.js', 'tailwind'],
            'Data': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'tableau', 'power bi', 'pandas', 'numpy'],
            'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions'],
            'Design': ['figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'ui/ux', 'wireframing'],
            'Management': ['agile', 'scrum', 'project management', 'jira', 'confluence', 'stakeholder', 'roadmap'],
        }
        found = {}
        text_lower = text.lower()
        for category, skills in SKILL_PATTERNS.items():
            matched = [s for s in skills if s in text_lower]
            if matched:
                found[category] = matched
        return found

    def extract_experience_details(self, text):
        companies = []
        roles = []
        lines = text.split('\n')
        for line in lines:
            if ' at ' in line:
                parts = line.split(' at ', 1)
                roles.append(parts[0].strip())
                companies.append(parts[1].strip())
            elif '|' in line:
                parts = line.split('|')
                if len(parts) >= 2:
                    roles.append(parts[0].strip())
                    companies.append(parts[1].strip())
        return {'roles': roles[:5], 'companies': companies[:5]}

    def detect_experience_level(self, text):
        text_lower = text.lower()
        senior_signals = ['senior', 'lead', 'manager', 'director', 'vp', 'principal', 'years of experience', 'architect', 'head of']
        entry_signals = ['intern', 'junior', 'entry', 'student', 'fresher', 'recent graduate', 'associate']
        senior_count = sum(1 for s in senior_signals if s in text_lower)
        entry_count = sum(1 for s in entry_signals if s in text_lower)
        if senior_count > entry_count and senior_count >= 2:
            return 'senior'
        elif entry_count > senior_count:
            return 'entry'
        return 'mid'

    def identify_gaps(self, text):
        sections_to_check = ['summary', 'objective', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements']
        text_lower = text.lower()
        found_sections = []
        for section in sections_to_check:
            if section in text_lower:
                found_sections.append(section)
        missing = [s for s in sections_to_check if s not in found_sections]

        weak_bullets = 0
        lines = text.split('\n')
        for line in lines:
            if line.strip().startswith(('-', '•', '*')):
                if not any(c.isdigit() for c in line):
                    weak_bullets += 1

        return {
            'missing_sections': missing,
            'weak_bullets': weak_bullets,
            'sections_present': found_sections
        }

    def get_strengths(self, text):
        strengths = []
        text_lower = text.lower()
        if any(x in text_lower for x in ['achieved', 'improved', 'increased', 'reduced', 'led', 'built', 'launched']):
            strengths.append('Strong action verbs detected')
        if any(c.isdigit() for c in text):
            strengths.append('Quantifiable metrics present')
        if len(text) > 500:
            strengths.append('Substantial content depth')
        if ' at ' in text or '|' in text:
            strengths.append('Clear role/company formatting')
        return strengths


class ConversationContext:
    """Tracks conversation state for coherent multi-turn dialogue."""

    def __init__(self):
        self.topic = None
        self.sub_topic = None
        self.resume_insights = None
        self.user_level = None
        self.turn_count = 0
        self.questions_asked = []
        self.user_goals = []

    def update_topic(self, new_topic):
        if self.topic != new_topic:
            self.sub_topic = None
            self.turn_count = 0
            self.questions_asked = []
        self.topic = new_topic
        self.turn_count += 1


BILLING_KNOWLEDGE = {
    'free': "Great news — Resume Optimizer is 100% free. There are no hidden costs, subscription tiers, or upgrade requirements. Every tool here is available at no charge.",
    'pricing': "We don't have a pricing model. Resume Optimizer is completely free — we believe access to career tools should be universal.",
    'dts_billing': "There is no DTS billing or payment processing on this platform. All features including resume building, ATS analysis, cover letters, and template downloads are free. There's nothing to bill.",
    'subscription': "No subscription is required. You have unlimited access to all tools without signing up. Signing in is optional and only useful for saving drafts.",
    'upgrade': "There's nothing to upgrade. Every tool here is fully available in the free tier.",
    'payment_method': "Since the platform is free, no payment method is needed. No credit card, no DTS authorization, no invoices.",
}

TYPO_MAP = {
    'resum': 'resume',
    'intervw': 'interview',
    'experince': 'experience',
    'skils': 'skills',
    'achievmnt': 'achievement',
    'certficate': 'certificate',
    'manger': 'manager',
    'recruter': 'recruiter',
    'positon': 'position',
    'oportunity': 'opportunity',
}


def _detect_intent(message, resume_text, context):
    msg_lower = message.lower()

    greeting_words = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'howdy', 'greetings']
    if any(w in msg_lower for w in greeting_words):
        return 'greeting'

    billing_words = ['cost', 'price', 'subscription', 'billing', 'payment', 'free', 'charge', 'dts', 'upgrade', 'pay']
    if any(w in msg_lower for w in billing_words):
        return 'billing'

    ats_words = ['ats', 'parser', 'scan', 'readability', 'compatibility', 'beat the system', 'keyword match']
    if any(w in msg_lower for w in ats_words):
        return 'ats'

    writing_words = ['write', 'draft', 'create', 'compose', 'generate', 'summary', 'objective', 'bullet', 'cover letter', 'rewrite']
    if any(w in msg_lower for w in writing_words):
        return 'writing'

    interview_words = ['interview', 'questions', 'prepare', 'star', 'behavioral', 'practice']
    if any(w in msg_lower for w in interview_words):
        return 'interview'

    career_words = ['career', 'switch', 'transition', 'path', 'direction', 'goal', 'recommend', 'advice']
    if any(w in msg_lower for w in career_words):
        return 'career'

    website_words = ['how to', "can't", 'broken', 'error', 'download', 'save', 'upload', 'feature', 'website', 'button', 'page']
    if any(w in msg_lower for w in website_words):
        return 'website'

    template_words = ['template', 'format', 'design', 'layout', 'style', 'preview']
    if any(w in msg_lower for w in template_words):
        return 'template'

    follow_up_words = ['tell me more', 'explain', 'why', 'how exactly', 'give example', 'okay but', 'actually', 'more detail', 'elaborate']
    if any(w in msg_lower for w in follow_up_words):
        return 'follow_up'

    gratitude_words = ['thanks', 'thank you', 'bye', 'goodbye', 'that helps', 'appreciate']
    if any(w in msg_lower for w in gratitude_words):
        return 'gratitude'

    resume_words = ['review', 'improve', 'fix', 'better', 'stronger', 'polish', 'enhance', 'resume', 'cv']
    if any(w in msg_lower for w in resume_words):
        return 'resume'

    if resume_text and len(message.split()) >= 3:
        return 'resume'

    return 'general'


def _detect_typos(message):
    found = {}
    msg_lower = message.lower()
    for typo, correction in TYPO_MAP.items():
        if re.search(r'\b' + re.escape(typo) + r'\b', msg_lower):
            found[typo] = correction
    return found


def _build_resume_summary(resume_text, analyzer):
    if not resume_text:
        return None

    name = analyzer.extract_name(resume_text)
    skills = analyzer.extract_skills(resume_text)
    exp_details = analyzer.extract_experience_details(resume_text)
    level = analyzer.detect_experience_level(resume_text)
    gaps = analyzer.identify_gaps(resume_text)
    strengths = analyzer.get_strengths(resume_text)

    summary = f"Name: {name or 'Unknown'}\nExperience Level: {level}\n"
    if exp_details['roles']:
        summary += f"Recent Roles: {', '.join(exp_details['roles'][:3])}\n"
    if exp_details['companies']:
        summary += f"Companies: {', '.join(exp_details['companies'][:3])}\n"
    if skills:
        summary += "Skills by Category:\n"
        for cat, skill_list in skills.items():
            summary += f"  {cat}: {', '.join(skill_list)}\n"
    summary += f"Strengths: {', '.join(strengths) if strengths else 'None detected'}\n"
    summary += f"Gaps: Missing sections: {', '.join(gaps['missing_sections']) if gaps['missing_sections'] else 'None'}"
    if gaps['weak_bullets']:
        summary += f", Weak bullets (no metrics): {gaps['weak_bullets']}"
    return summary


def _select_proactive_question(analyzer, resume_text, context):
    if not resume_text:
        return None

    gaps = analyzer.identify_gaps(resume_text)
    skills = analyzer.extract_skills(resume_text)
    exp_details = analyzer.extract_experience_details(resume_text)

    if 'summary' in gaps.get('missing_sections', []):
        return "I notice your resume doesn't have a professional summary yet. Would you like help writing one that captures your value proposition?"

    if gaps.get('weak_bullets', 0) > 2:
        return "I don't see many numbers in your experience bullets. What results can you quantify — like percentages, dollar amounts, or time saved?"

    if exp_details['roles'] and len(exp_details['roles']) == 1:
        company = exp_details['companies'][0] if exp_details['companies'] else 'your current role'
        return f"It looks like you have solid experience at {company}. Are there other roles or projects you'd like to include on your resume?"

    if skills:
        top_category = list(skills.keys())[0]
        top_skill = skills[top_category][0]
        return f"I see you have strong {top_category} skills, particularly {top_skill}. Can you tell me about a project where you applied it?"

    return None


def get_chat_response(message: str, resume_text: str = None, history: list = None) -> str:
    """Generate a human-level conversational response with resume-aware context."""
    analyzer = ResumeAnalyzer()
    context = ConversationContext()

    if not message or not message.strip():
        return "I'm here to help with your career journey. What would you like to work on — your resume, ATS optimization, interview prep, or something else?"

    words = message.strip().split()
    if len(words) < 2:
        return f"It looks like you entered a very short query: '{message}'. Could you tell me a bit more about what you're trying to achieve? For example, 'How can I improve my software engineer resume?' or 'What should I put in my cover letter?'"

    typos = _detect_typos(message)
    typo_note = ""
    if typos:
        typo_list = ", ".join(f"'{k}' (should be '{v}')" for k, v in typos.items())
        typo_note = f"*(Quick note: I spotted a potential spelling issue in your message: {typo_list}. It's worth double-checking your resume for similar typos — spelling errors are one of the top reasons recruiters pass on otherwise strong candidates.)*\n\n"

    intent = _detect_intent(message, resume_text, context)

    if intent == 'greeting':
        if resume_text:
            name = analyzer.extract_name(resume_text)
            if name:
                return f"{typo_note}Hey {name}! Great to see you here. I've reviewed your resume and I can see some real strengths to build on. What would you like to focus on today — polishing your bullet points, improving your ATS score, or something else?"
        return f"{typo_note}Hello! Welcome to Resume Optimizer. I'm here to help you craft a resume that gets noticed — whether that means beating the ATS, sharpening your bullet points, or preparing for interviews. What are you working on?"

    if intent == 'billing':
        msg_lower = message.lower()
        matched_key = None
        for key, phrase in [('free', 'free'), ('pricing', 'pricing'), ('dts_billing', 'dts'), ('subscription', 'subscription'), ('upgrade', 'upgrade'), ('payment_method', 'payment')]:
            if key.replace('_', ' ') in msg_lower or phrase in msg_lower:
                matched_key = key
                break
        if not matched_key:
            matched_key = 'free'
        return f"{typo_note}{BILLING_KNOWLEDGE[matched_key]}"

    if intent == 'ats':
        if resume_text:
            gaps = analyzer.identify_gaps(resume_text)
            weak = gaps.get('weak_bullets', 0)
            response = f"{typo_note}ATS systems look for exact keyword matches from the job description, so the key is aligning your skills, titles, and bullet points with what they're scanning for."
            if weak > 3:
                response += " One thing I noticed on your resume: quite a few bullets don't include quantifiable results. Even adding a single metric — like 'increased sales by 15%' — can significantly boost your ATS score and recruiter appeal. Want me to help rewrite one of those bullets?"
            return response
        return f"{typo_note}ATS systems look for exact keyword matches from the job description. The best strategy is to create a 'Core Competencies' section with 8-12 skills pulled directly from the posting, and mirror their language in your experience bullets. Our Advanced Resume Optimization tool does this automatically — just paste your resume and the JD, and it'll highlight gaps for you."

    if intent == 'writing':
        if resume_text:
            name = analyzer.extract_name(resume_text)
            skills = analyzer.extract_skills(resume_text)
            skill_context = ""
            if skills:
                first_cat = list(skills.keys())[0]
                skill_context = f" Given your background in {', '.join(skills[first_cat][:2])}, "
            return f"{typo_note}Absolutely — writing is where most resumes go from good to great.{skill_context}the key is leading every bullet with a strong action verb and following it with a measurable outcome. For example, instead of 'Managed projects,' try 'Led 5 cross-functional projects that delivered 20% cost savings within 6 months.' What section or bullet would you like to work on, {name or 'friend'}?"
        return f"{typo_note}Great — let's get writing. A powerful resume summary is 2-3 sentences that answer: Who are you, what do you deliver, and why does it matter to the employer? Or if you'd prefer, we can draft a specific achievement bullet — just share a rough description of what you did and the impact you had."

    if intent == 'interview':
        if resume_text:
            name = analyzer.extract_name(resume_text)
            exp = analyzer.extract_experience_details(resume_text)
            role = exp['roles'][0] if exp['roles'] else "your background"
            return f"{typo_note}Interview prep is all about telling your story in a way that feels both authentic and impressive. Based on your experience as {role}, I'd recommend preparing 3-4 stories using the STAR method — and the best ones come from moments where things didn't go perfectly. Recruiters remember how you handled pressure more than a string of easy wins. Want me to help you map out some of those stories, {name or 'friend'}?"
        return f"{typo_note}For interviews, the STAR method is your best framework — Situation, Task, Action, Result. It keeps your answers structured and memorable. I'd suggest building a bank of 5-6 stories from your experience that highlight problem-solving, leadership, and learning. Want to start with one now?"

    if intent == 'career':
        if resume_text:
            level = analyzer.detect_experience_level(resume_text)
            skills = analyzer.extract_skills(resume_text)
            skill_str = ""
            if skills:
                first_cat = list(skills.keys())[0]
                skill_str = f"With your {first_cat} skills, "
            level_context = "you have a strong foundation to build on" if level in ['mid', 'senior'] else "your current experience is a great launch pad"
            return f"{typo_note}{skill_str}{level_context}. Career transitions work best when you reframe existing experience rather than starting from scratch. What's the role or industry you're eyeing? I can help you translate your current skills into their language."
        return f"{typo_note}Career direction is personal, but a good starting point is identifying what you genuinely enjoy day-to-day versus what you're simply good at. The best career moves usually land at their intersection. What kind of work lights you up — and what kind would you rather avoid?"

    if intent == 'website':
        return f"{typo_note}Here's how to navigate the platform: the 'Free Resume Builder' is where you build section by section — add your experience, skills, education, and it auto-saves. For ATS analysis, use the 'Advanced Resume Optimization' tab: paste your resume and a job description, then hit Analyze. You'll get a match score, keyword gaps, and specific recommendations. Download options (PDF/DOCX) are available in the builder and preview. What feature are you trying to use?"

    if intent == 'template':
        return f"{typo_note}Our Template Gallery has over 200 recruiter-approved designs — from clean and minimal to modern and bold. Pick one that matches your industry: more conservative roles lean toward traditional layouts, while creative and tech roles can use bolder typography. Once you choose a template, it populates your builder content instantly, so you can tweak spacing and fonts before downloading. What industry or style are you going for?"

    if intent == 'follow_up':
        if resume_text:
            gaps = analyzer.identify_gaps(resume_text)
            if gaps.get('weak_bullets', 0) > 0:
                return f"{typo_note}Let's dig deeper into those bullets I flagged earlier. A well-crafted bullet follows this pattern: action verb + task + measurable result. For instance, 'Streamlined the onboarding process' becomes 'Redesigned onboarding for 20+ new hires, cutting ramp-up time by 35%.' Want to try rewriting one of yours?"
            skills = analyzer.extract_skills(resume_text)
            if skills:
                first_cat = list(skills.keys())[0]
                first_skill = skills[first_cat][0]
                return f"{typo_note}Glad you want to explore that further. Since you have {first_skill} listed, let's think about how to frame it in a way that stands out. Can you walk me through a project or accomplishment with {first_skill} that you're proud of? The more specific the context, the stronger we can make it."
        return f"{typo_note}Of course — let's go deeper. Could you share more context? For example, if we're working on your resume, tell me what role you're targeting and I can suggest exactly how to position your experience. The more detail you give me, the more tailored my advice will be."

    if intent == 'gratitude':
        if resume_text:
            name = analyzer.extract_name(resume_text)
            gaps = analyzer.identify_gaps(resume_text)
            extra = ""
            if gaps.get('missing_sections'):
                missing = ", ".join(gaps['missing_sections'][:2])
                extra = f" And just a heads up — your resume could be even stronger with a {missing} section added in. I'm here whenever you're ready to tackle that."
            return f"{typo_note}You're very welcome, {name or 'friend'}! It's been great working through this with you.{extra} Come back anytime you want to refine, review, or try something new — I'm always here to help."
        return f"{typo_note}You're welcome! I'm glad I could help. Come back anytime you want to refine your resume, practice for interviews, or explore something new. Have a great day ahead!"

    if intent == 'resume':
        gaps = analyzer.identify_gaps(resume_text) if resume_text else {'missing_sections': [], 'weak_bullets': 0}
        resume_summary = _build_resume_summary(resume_text, analyzer) if resume_text else None
        proactive = _select_proactive_question(analyzer, resume_text, context)

        if not resume_text:
            return f"{typo_note}A strong resume tells a clear story: who you are, what you deliver, and why a team needs you. I'd recommend uploading your resume here so I can give you specific, personalized feedback. In the meantime, would you like general guidance on structure, bullet writing, or ATS compatibility?"

        name = analyzer.extract_name(resume_text)
        skills = analyzer.extract_skills(resume_text)
        strengths = analyzer.get_strengths(resume_text)
        level = analyzer.detect_experience_level(resume_text)

        personalization = f"Hey {name or 'friend'}, "

        if strengths:
            strength_note = strengths[0].lower()
            opening = f"{personalization}I've looked at your resume and one thing that stands out right away is that you have {strength_note}. That gives you a real head start."
        else:
            opening = f"{personalization}I've reviewed what you've shared so far, and there's a solid base here to build from."

        if gaps.get('weak_bullets', 0) > 2:
            opening += f" The biggest opportunity I see is in your experience bullets — many of them read as duties rather than achievements. Adding specific numbers and outcomes would make a huge difference."

        if gaps.get('missing_sections'):
            missing_top = gaps['missing_sections'][0]
            opening += f" You're also missing a {missing_top} section, which is something a lot of candidates overlook."

        if not gaps.get('missing_sections') and gaps.get('weak_bullets', 0) <= 2:
            opening += " Overall, your resume is in good shape — though there's almost always room to make it sharper and more targeted."

        closing_proactive = ""
        if proactive:
            closing_proactive = f" {proactive}"

        return f"{typo_note}{opening}{closing_proactive}"

    if intent == 'general':
        if resume_text:
            name = analyzer.extract_name(resume_text)
            skills = analyzer.extract_skills(resume_text)
            skill_mention = ""
            if skills:
                first_cat = list(skills.keys())[0]
                skill_mention = f" I can see you have experience in {', '.join(skills[first_cat][:2])}, which is a great starting point."
            return f"{typo_note}I'm happy to help with that.{skill_mention} Could you tell me a bit more about what specifically you're looking for? I can help with resume writing, ATS optimization, cover letters, interview prep, or just figuring out the best direction for your career."
        return f"{typo_note}That's a great question — career topics can be pretty broad. Could you give me a bit more detail? For example, are we working on your resume, prepping for interviews, figuring out a career direction, or something else entirely? I'm here for all of it."

    if model:
        try:
            resume_summary = _build_resume_summary(resume_text, analyzer)
            profile_context = f"\n## Candidate Context\n{resume_summary}\n" if resume_summary else "\n## Candidate Context\nNo resume provided yet.\n"
            history_context = ""
            if history:
                history_context = "\n## Conversation History (last 10 turns)\n"
                for msg in history[-10:]:
                    role_label = "User" if msg.get('role') == 'user' else "Advisor"
                    history_context += f"{role_label}: {msg.get('text', '')}\n"

            prompt = (
                "You are a highly experienced career coach and resume advisor named Alex at Resume Optimizer. You are warm, insightful, and deeply analytical.\n\n"
                f"{profile_context}"
                "\n## Your Personality\n"
                "- You sound like a knowledgeable mentor, not an FAQ bot\n"
                "- You reference specific details from the candidate's resume naturally in conversation\n"
                "- You ask thoughtful follow-up questions that show you're actively listening\n"
                "- You balance encouragement with constructive honesty\n"
                "- You avoid jargon unless explaining it\n"
                "- You vary your response structure — don't always use bullet points\n\n"
                "## Conversation Rules\n"
                "1. If the resume is available, personalize EVERY response using concrete details (name, companies, roles, skills)\n"
                "2. Detect if the user seems unsure or vague and GENTLY ask clarifying questions\n"
                "3. If you notice a resume gap or weakness, mention it conversationally and offer to help fix it\n"
                "4. For grammar/spelling issues in the user's message, mention one constructively — but don't overwhelm\n"
                "5. If this is clearly a follow-up to your last message, acknowledge what you said before and build on it\n"
                "6. NEVER repeat the same advice verbatim across responses\n"
                "7. Keep responses under 200 words unless the user asks for deep detail\n"
                "8. If uncertain about something, say so honestly rather than guessing\n\n"
                "## Resume Optimizer Facts (use ONLY these)\n"
                "- 100% free, no payment, no DTS billing, no subscriptions\n"
                "- Features: Resume Builder, ATS Optimizer, Template Gallery (200+ templates), Resume Examples, Cover Letter Builder, AI Career Advisor\n"
                "- All tools work without login; login is optional for saving drafts\n"
                "- Upload: PDF, DOCX, TXT (max 10MB)\n"
                "- Download: PDF or DOCX format\n"
                "- No email confirmation required\n\n"
                "## Avoid\n"
                "- Generic advice that doesn't reference their specific profile\n"
                "- Long bullet lists in conversational replies\n"
                "- Repeated phrases or structure across messages\n"
                "- Asking for information they already provided\n"
                "- Claiming features that don't exist\n\n"
                f"User message: {message}\n"
                f"{history_context}"
                "Advisor:\n"
            )
            response = model.generate_content(prompt)
            if response and response.text:
                return typo_note + response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API error: {e}")

    if resume_text:
        gaps = analyzer.identify_gaps(resume_text)
        proactive = _select_proactive_question(analyzer, resume_text, context)
        fallback = f"{typo_note}That's a really good area to dig into. Based on your resume, the best next step depends on your target role — but in general, clarity and specificity are your biggest assets right now."
        if gaps.get('weak_bullets', 0) > 2:
            fallback += " Those experience bullets with no measurable outcomes are holding you back more than you might think."
        if proactive:
            fallback += f" {proactive}"
        return fallback

    level = analyzer.detect_experience_level(message + (" " + resume_text if resume_text else ""))
    level_advice = ""
    if level == 'senior':
        level_advice = "\n\nAs a senior professional, I'd make sure your resume emphasizes scope — team size, budgets, and measurable business impact."
    elif level == 'entry':
        level_advice = "\n\nSince you're earlier in your career, focus on academic projects, certifications, and any hands-on experience that shows potential."

    return f"{typo_note}That's a thoughtful question. The most impactful resumes are the ones that tell a clear story about the value someone delivers.{level_advice} Would you like to share your resume so I can give you more specific guidance? Or tell me more about the role you're targeting?"


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
            else:
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

    else:
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
        else:
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

    return [
        "1. Tell me about a time you faced a significant challenge in your previous role and how you overcame it.",
        "2. Can you describe a project where you had to lead a team or take initiative without direct authority?",
        "3. How do your skills and previous experience directly align with the core requirements of this position?",
        "4. Describe a situation where you had to adapt to a major change in a project's scope or timeline.",
        "5. Where do you see your career progressing in the next 3-5 years, and how does this role fit into that plan?"
    ]
