const TYPO_MAP = {
  'resum': 'resume',
  'resme': 'resume',
  'intervw': 'interview',
  'intrvw': 'interview',
  'experince': 'experience',
  'exprnce': 'experience',
  'skils': 'skills',
  'skillz': 'skills',
  'certficate': 'certificate',
  'achievment': 'achievement',
  'achievemnt': 'achievement',
  'achievments': 'achievements',
  'maneger': 'manager',
  'manger': 'manager',
  'managr': 'manager',
  'recruter': 'recruiter',
  'recuter': 'recruiter',
  'positon': 'position',
  'oportunity': 'opportunity',
  'succesful': 'successful',
  'suport': 'support',
  'spport': 'support',
  'devlop': 'develop',
  'devloper': 'developer',
  'enginner': 'engineer',
  'enginering': 'engineering',
  'programing': 'programming',
  'analisys': 'analysis',
  'comunicate': 'communicate',
  'leadship': 'leadership',
  'profesional': 'professional',
  'qualifed': 'qualified',
  'referenes': 'references',
  'educaton': 'education',
  'responsiblities': 'responsibilities',
  'teh': 'the',
  'recieve': 'receive',
  'occured': 'occurred',
  'seperate': 'separate',
  'definately': 'definitely',
  'accomodate': 'accommodate',
  'occassion': 'occasion',
  'necesary': 'necessary',
  'enviornment': 'environment',
  'performence': 'performance',
  'knowlege': 'knowledge'
};

const BILLING_RESPONSES = {
  cost: "This entire platform is 100% free. No payment, no credit card, no DTS billing is required or used anywhere on the site.",
  price: "Everything here is free. There are no premium tiers or paid plans — all 200+ templates, the ATS analyzer, cover letter builder, and download options are available at no cost.",
  billing: "There is no DTS billing system here. Resume Optimizer operates without any payment processing. Every tool is complimentary.",
  subscription: "No subscription is needed. The platform works fully without an account, though logging in lets you save drafts.",
  free: "Completely free — no strings attached. Use everything without paying.",
  payment: "No payment method is required. Use all tools without entering any billing information."
};

const WORKFLOW_RESPONSES = {
  upload: "To upload your resume, go to the ATS Optimizer section and use the drag-and-drop dropzone. We accept PDF, DOCX, and TXT files up to 10MB.",
  download: "In the Preview page, you'll see Download PDF and Download Word buttons. Click either one to get your file instantly.",
  builder: "The Resume Builder is a step-by-step form. Start with personal info, then use the section manager to enable/disable areas like Experience, Education, Skills. Click 'Live Preview' at any point to see your resume update in real-time.",
  template: "Browse 200+ templates in the Template Gallery. Click 'Apply Template' to instantly change your resume layout. Each template is designed to be ATS-friendly.",
  examples: "The Examples library has 210+ real-sample resumes across industries. Click any example to load it into the builder as a starting point.",
  cover_letter: "The Cover Letter workspace lets you generate a personalized letter using either your resume alone or your resume plus a job description. Select a writing style, paste a JD (optional), and generate.",
  ai_chat: "I'm the AI Career Advisor! You can ask me anything anytime — just click the chat bubble in the bottom-right corner. For a full-page experience with more prompts, visit the AI Assistant page."
};

const RESPONSE_VARIANTS = {
  greeting: [
    "Hello! Whether you're building your first resume or refining one for an executive role, I'm here to help.",
    "Hi there! Great to see you. I can help with anything from resume structure to interview prep.",
    "Hey! Welcome — whether you're starting from scratch or polishing an existing resume, I've got your back."
  ],
  gratitude: [
    "You're welcome! Is there anything else I can help with?",
    "Happy to help! Feel free to ask if you have more questions.",
    "Glad I could assist. Let me know if you'd like to dive deeper into any topic.",
    "Anytime! What else would you like to work on?"
  ],
  closing: [
    "Take care and good luck! If you want to come back later to review your progress, I'll be here.",
    "Best of luck with your job search! Come back anytime you need another set of eyes on your resume.",
    "All the best! Remember, revisions are completely free — iterate until it's perfect."
  ],
  follow_up_intro: [
    "Sure — let me expand on that.",
    "Happy to go deeper.",
    "Great question — here's a more detailed breakdown.",
    "Let me walk you through this step-by-step."
  ],
  disambiguation: [
    "I want to make sure I'm giving you the right advice. Can you say more about what aspect you're unsure about? For example, are you asking about formatting, content, or ATS optimization?",
    "Let me clarify. Could you rephrase your question so I can give you the most accurate help?",
    "I don't want to guess wrong. Could you tell me more about what you're trying to achieve?"
  ],
  general_advice_intro: [
    "Here's something worth considering:",
    "Let me share a perspective that might help:",
    "Based on what recruiters look for, here's my take:",
    "Here's advice that tends to make a real difference:"
  ],
  resume_quality: [
    "Let's look at what makes a resume stand out. Recruiters typically spend just 7 seconds on a first pass, so clarity and impact are everything. Would you like me to review specific sections, or walk through a quick self-audit?",
    "A strong resume tells a story — not just what you did, but the impact you had. Start every bullet with an action verb, quantify results wherever possible, and tailor keywords to the job description. Want me to assess a specific section?",
    "Think of your resume as a marketing document, not a biography. Every line should answer the question: 'Why should we hire this person?' Want to work through your bullets together?"
  ],
  writing_help: [
    "Writing a powerful resume is all about specifics. Instead of saying 'Responsible for managing a team,' try 'Led a team of 8 engineers to deliver a platform migration two weeks ahead of schedule.' The difference is night and day. Want to try rewriting one of your bullets?",
    "A great trick: use the XYZ formula — 'Accomplished [X] as measured by [Y], by doing [Z].' This naturally leads to results-oriented bullet points. Want me to help you apply it to your experience?"
  ],
  ats_advice: [
    "ATS systems are looking for keyword matches and clean formatting. Stick to standard headings like WORK EXPERIENCE and EDUCATION, avoid tables and text boxes, and sprinkle in keywords from the job description naturally. Would you like me to check how well your resume would likely score?",
    "Keep your resume ATS-friendly by using standard fonts, simple layouts, and job-specific keywords. Many candidates get filtered out before a human even sees their resume. Want tips tailored to your target role?"
  ],
  interview_advice: [
    "Interview prep is about telling compelling stories. The STAR method (Situation, Task, Action, Result) gives you a solid framework. Prepare 3-5 stories that showcase different strengths, and practice articulating them in under 2 minutes each. Want me to help you draft a story?",
    "The best interview answers are specific and quantifiable. Instead of 'I improved the system,' say 'I reduced API latency by 45%, cutting page load time from 3s to 1.6s.' Numbers stick. Do you have a project we could turn into a STAR story?"
  ],
  career_advice: [
    "Career transitions are totally normal — most people have 12+ jobs in their career. The key is framing your existing skills in the language of your target industry. Want to talk through your situation?",
    "When considering a career move, think about what you genuinely enjoy doing. The sweet spot is where your skills, interests, and market demand overlap. Where are you feeling pulled toward right now?"
  ],
  cover_letter_advice: [
    "A cover letter should feel personal, not generic. Open with a hook — maybe a specific company achievement you admire — then connect your story to their needs. Our Cover Letter tool can generate drafts using your resume as a base. Want to give it a try?",
    "Cover letters work best when they show you've done your homework. Mention something specific about the company, then explain why your background makes you a natural fit. Have you got a particular role in mind?"
  ]
};

const ResumeParser = {
  extractName(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 2 && line.length < 60 && !line.includes('@') && !line.includes('|') && !line.match(/\d{4}/)) {
        if (/^[A-Z]/.test(line)) return line;
      }
    }
    return null;
  },

  extractSkills(text) {
    const SKILL_PATTERNS = {
      programming: ['javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala'],
      web: ['react', 'angular', 'vue', 'node', 'django', 'flask', 'html', 'css', 'tailwind', 'next.js'],
      data: ['sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'tableau', 'pandas', 'numpy', 'spark'],
      cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins'],
      management: ['agile', 'scrum', 'jira', 'stakeholder', 'roadmap', 'okr', 'kpi'],
      design: ['figma', 'sketch', 'photoshop', 'illustrator', 'ui/ux', 'wireframe']
    };
    const found = {};
    const lower = text.toLowerCase();
    for (const [cat, skills] of Object.entries(SKILL_PATTERNS)) {
      const matched = skills.filter(s => lower.includes(s));
      if (matched.length) found[cat] = matched;
    }
    return found;
  },

  extractExperience(text) {
    const roles = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes(' at ')) {
        const parts = trimmed.split(' at ');
        roles.push({ role: parts[0].trim(), company: parts[1].trim() });
      } else if (trimmed.includes('|')) {
        const parts = trimmed.split('|');
        if (parts.length >= 2) roles.push({ role: parts[0].trim(), company: parts[1].trim() });
      }
    }
    return roles.slice(0, 5);
  },

  detectLevel(text) {
    const lower = text.toLowerCase();
    const seniorWords = ['senior', 'lead', 'manager', 'director', 'vp', 'principal', 'architect', 'head', 'years of experience'];
    const entryWords = ['intern', 'junior', 'entry', 'student', 'fresher', 'graduate', 'recent', 'associate'];
    const seniorCount = seniorWords.filter(w => lower.includes(w)).length;
    const entryCount = entryWords.filter(w => lower.includes(w)).length;
    if (seniorCount >= 2 && seniorCount > entryCount) return 'senior';
    if (entryCount >= 2) return 'entry';
    return 'mid';
  },

  hasQuantifiableMetrics(text) {
    const bulletLines = text.split('\n').filter(l => {
      const t = l.trim();
      return t.startsWith('-') || t.startsWith('•');
    });
    const quantified = bulletLines.filter(l => /\d+%|\$\d+|\d+\+|\d+ million|\d+ thousand|\d+ hours|\d+ days/i.test(l));
    return quantified.length;
  },

  missingCoreSections(text) {
    const lower = text.toLowerCase();
    const required = ['experience', 'education', 'skills'];
    const present = required.filter(s => lower.includes(s));
    return required.filter(s => !present.includes(s));
  },

  hasSoftSkills(text) {
    const softSkills = ['communication', 'leadership', 'team player', 'collaborated', 'mentored', 'negotiated', 'presented'];
    const lower = text.toLowerCase();
    return softSkills.filter(s => lower.includes(s)).length;
  },

  hasProjectsSection(text) {
    return /\b(projects?)\b/i.test(text);
  },

  hasSummarySection(text) {
    return /\b(summary|profile|objective)\b/i.test(text);
  },

  extractKeyAchievements(text) {
    const achievements = [];
    const lines = text.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
    lines.forEach(l => {
      if (/\d+%|\$\d+|\d+\+|\d+ million|\d+ thousand|\d+ hours|\d+ days/i.test(l)) {
        achievements.push(l.trim());
      }
    });
    return achievements.slice(0, 3);
  }
};

class ConversationContext {
  constructor() {
    this.topic = null;
    this.subTopic = null;
    this.turnCount = 0;
    this.lastBotMessage = '';
    this.userLevel = null;
    this.resumeAnalyzed = false;
    this.questionsAsked = [];
    this.metricsMentioned = false;
    this.followUpShown = {};
    this.userName = null;
  }

  startNewTopic(topic) {
    if (this.topic !== topic) {
      this.subTopic = null;
      this.questionsAsked = [];
      this.turnCount = 0;
    }
    this.topic = topic;
    this.turnCount++;
  }

  canAsk(topic) {
    return !this.followUpShown[topic];
  }

  markAsked(topic) {
    this.followUpShown[topic] = true;
  }

  resetForNewSession() {
    this.topic = null;
    this.subTopic = null;
    this.turnCount = 0;
    this.lastBotMessage = '';
    this.userLevel = null;
    this.resumeAnalyzed = false;
    this.questionsAsked = [];
    this.metricsMentioned = false;
    this.followUpShown = {};
    this.userName = null;
  }
}

const DEFAULT_CONTEXT = new ConversationContext();

function pickRandom(arr) {
  if (!arr || !arr.length) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickFrom(obj) {
  if (!obj) return '';
  const keys = Object.keys(obj);
  if (!keys.length) return '';
  const k = keys[Math.floor(Math.random() * keys.length)];
  return obj[k];
}

function detectTyposOnly(message) {
  const lower = message.toLowerCase();
  const found = [];
  Object.keys(TYPO_MAP).forEach(typo => {
    if (new RegExp('\\b' + typo + '\\b', 'i').test(lower)) {
      found.push({ typo, correction: TYPO_MAP[typo] });
    }
  });
  found.sort((a, b) => {
    const aPos = lower.indexOf(a.typo);
    const bPos = lower.indexOf(b.typo);
    return aPos - bPos;
  });
  return found;
}

function classifyIntent(message, lowerMessage) {
  const intents = [
    {
      name: 'greeting',
      test: () => /\b(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings)\b/i.test(lowerMessage) && lowerMessage.split(/\s+/).length < 8,
      priority: 1
    },
    {
      name: 'gratitude',
      test: () => /\b(thanks|thank you|thx|appreciate|cheers|tyvm|much obliged)\b/i.test(lowerMessage),
      priority: 2
    },
    {
      name: 'closing',
      test: () => /\b(bye|goodbye|that's all|see you|later|done talking|end|gotta go)\b/i.test(lowerMessage),
      priority: 3
    },
    {
      name: 'follow_up',
      test: () => /\b(tell me more|explain|why|how|example|okay but|really|what do you mean|elaborate|go deeper|expand)\b/i.test(lowerMessage),
      priority: 4
    },
    {
      name: 'disambiguation',
      test: () => /\b(not sure|confused|unclear|what do you mean|don't understand|doesn't make sense|lost)\b/i.test(lowerMessage),
      priority: 5
    },
    {
      name: 'website_workflow',
      test: () => /\b(how to use|can't find|where is|how does it work|how do i|button|click|step by step|workflow|using this)\b/i.test(lowerMessage) || /(billing|pricing|price|free|subscription|payment|dts|cost|charge)/i.test(lowerMessage) === false && /\b(how|where|find|use)\b/i.test(lowerMessage),
      priority: 6
    },
    {
      name: 'billing',
      test: () => /\b(cost|price|free|subscription|billing|dts|payment|charge|pricing|pay|premium|paid)\b/i.test(lowerMessage),
      priority: 7
    },
    {
      name: 'resume_upload',
      test: () => /\b(upload|import|parse|extract|read my resume|process|load file|analyze my)\b/i.test(lowerMessage) && /\b(resume|cv|file)\b/i.test(lowerMessage),
      priority: 8
    },
    {
      name: 'grammar_spelling',
      test: () => detectTyposOnly(message).length > 0 && !/\b(billing|pricing|workflow|upload)\b/i.test(lowerMessage),
      priority: 9
    },
    {
      name: 'resume_quality',
      test: () => /\b(review|check|improve|fix|weak|strengthen|make better|audit|rate|score|polish)\b/i.test(lowerMessage) && /\b(resume|cv)\b/i.test(lowerMessage),
      priority: 10
    },
    {
      name: 'writing_help',
      test: () => /\b(write|rewrite|draft|create|summary|bullet|objective|phrase|wording|language|tone)\b/i.test(lowerMessage) || (/\b(help me with|write a|draft a)\b/i.test(lowerMessage)),
      priority: 11
    },
    {
      name: 'ats',
      test: () => /\b(ats|parser|scan|score|keyword|match|compatibility|filter|applicant tracking)\b/i.test(lowerMessage),
      priority: 12
    },
    {
      name: 'cover_letter',
      test: () => /\b(cover letter|outreach|email to recruiter|intro letter|letter of interest)\b/i.test(lowerMessage),
      priority: 13
    },
    {
      name: 'interview',
      test: () => /\b(interview|question|star|behavioral|prepare|mock|practice|screener|phone screen)\b/i.test(lowerMessage),
      priority: 14
    },
    {
      name: 'career_path',
      test: () => /\b(career|switch|transition|next step|path|recommend|direction|industry change|pivot)\b/i.test(lowerMessage),
      priority: 15
    },
    {
      name: 'template',
      test: () => /\b(template|format|design|layout|style|theme|template gallery)\b/i.test(lowerMessage),
      priority: 16
    }
  ];

  intents.sort((a, b) => a.priority - b.priority);
  for (const intent of intents) {
    if (intent.test()) return intent.name;
  }
  return 'default';
}

function detectUserLevel(message, resumeText) {
  const lower = message.toLowerCase();
  const combined = resumeText ? lower + ' ' + resumeText.toLowerCase() : lower;
  
  const seniorWords = ['senior', 'lead', 'manager', 'director', 'vp', 'principal', 'architect', 'head', 'years of experience', 'sr.', 'staff'];
  const entryWords = ['intern', 'junior', 'entry', 'student', 'fresher', 'graduate', 'recent', 'associate', 'no experience', 'starting out'];
  
  const seniorCount = seniorWords.filter(w => combined.includes(w)).length;
  const entryCount = entryWords.filter(w => combined.includes(w)).length;
  
  if (seniorCount >= 2 && seniorCount > entryCount) return 'senior';
  if (entryCount >= 2) return 'entry';
  return 'mid';
}

function buildResumeGreeting(parseResults, userName) {
  const parts = [];
  const { skills, experienceRoles, metricsFound, level } = parseResults;
  
  if (userName) parts.push(`Hi ${userName}!`);
  else parts.push("Hi!");
  
  if (level === 'senior') parts.push("I can see you're at a senior level.");
  else if (level === 'entry') parts.push("Looks like you're early in your career.");
  
  if (experienceRoles.length > 0 && experienceRoles[0].company) {
    parts.push(`Your experience at ${experienceRoles[0].company} stands out.`);
  }
  
  if (skills.programming && skills.programming.length > 0) {
    parts.push(`I also notice your technical skills include ${skills.programming.slice(0, 3).join(', ')}.`);
  }
  
  if (metricsFound > 0) {
    parts.push(`Your quantified metrics show real impact — that's exactly what recruiters look for.`);
  }
  
  parts.push("I'm here to help with anything you need.");
  
  return parts.join(' ');
}

function buildFollowUp(context, resumeText) {
  if (!resumeText) {
    const followUps = [
      "By the way — what industry are you targeting? That helps me give you more relevant advice.",
      "Are you building a resume from scratch or updating an existing one?",
      "What's the biggest challenge you're facing with your resume right now?",
      "Do you have a specific role in mind, or are you exploring options?"
    ];
    return pickRandom(followUps);
  }
  
  const followUpByGap = [];
  const hasSummary = ResumeParser.hasSummarySection(resumeText);
  const hasProjects = ResumeParser.hasProjectsSection(resumeText);
  const missingSections = ResumeParser.missingCoreSections(resumeText);
  const metricsCount = ResumeParser.hasQuantifiableMetrics(resumeText);
  const softSkillsCount = ResumeParser.hasSoftSkills(resumeText);
  const roles = ResumeParser.extractExperience(resumeText);
  
  if (!hasSummary && context.canAsk('summary')) {
    followUpByGap.push("One thing I notice — your resume could use a stronger summary section to open with impact. Want me to show you how to write one?");
  }
  
  if (metricsCount === 0 && !context.metricsMentioned) {
    followUpByGap.push("I notice most of your bullets lack quantifiable results. Adding numbers — 'increased X by Y%' — can make a huge difference. Would you like to try quantifying a few?");
  }
  
  if (roles.length === 1 && context.canAsk('more_experience')) {
    followUpByGap.push("You've listed one role so far — do you have additional experience, side projects, or freelance work that could round things out?");
  }
  
  if (!hasProjects && context.canAsk('projects')) {
    followUpByGap.push("A Projects section can really showcase hands-on skills. Have you built anything personal or open-source worth highlighting?");
  }
  
  if (missingSections.includes('skills')) {
    followUpByGap.push("I don't see a dedicated Skills section — those keywords make a big difference for both recruiters and ATS systems. Want help organizing yours?");
  }
  
  if (softSkillsCount === 0 && context.canAsk('soft_skills')) {
    followUpByGap.push("Consider weaving in soft skills like communication, collaboration, or leadership through your achievements — it rounds out your profile.");
  }
  
  if (followUpByGap.length > 0) {
    return pickRandom(followUpByGap);
  }
  
  const openEnded = [
    "What would you like to work on next?",
    "Is there a specific section you want to focus on?",
    "What's your biggest priority right now — getting interviews, passing ATS, or making a career switch?",
    "Feel free to share your job description — I can help tailor your resume to match it."
  ];
  return pickRandom(openEnded);
}

function buildGradualReveal(intent, context) {
  if (intent === 'follow_up' || intent === 'disambiguation') {
    return pickRandom(RESPONSE_VARIANTS.follow_up_intro);
  }
  if (intent === 'resume_quality') {
    return pickRandom(RESPONSE_VARIANTS.resume_quality);
  }
  if (intent === 'writing_help') {
    return pickRandom(RESPONSE_VARIANTS.writing_help);
  }
  if (intent === 'ats') {
    return pickRandom(RESPONSE_VARIANTS.ats_advice);
  }
  if (intent === 'interview') {
    return pickRandom(RESPONSE_VARIANTS.interview_advice);
  }
  if (intent === 'cover_letter') {
    return pickRandom(RESPONSE_VARIANTS.cover_letter_advice);
  }
  if (intent === 'career_path') {
    return pickRandom(RESPONSE_VARIANTS.career_advice);
  }
  if (intent === 'career_path') {
    return pickRandom(RESPONSE_VARIANTS.career_advice);
  }
  return pickRandom(RESPONSE_VARIANTS.default_advice_intro || RESPONSE_VARIANTS.general_advice_intro);
}

function getBillingResponse(message) {
  const lower = message.toLowerCase();
  
  if (/\b(dts|billing)\b/i.test(lower)) return BILLING_RESPONSES.billing;
  if (/\b(subscription|plan|account|premium)\b/i.test(lower)) return BILLING_RESPONSES.subscription;
  if (/\b(payment|card|pay|charge|cheap)\b/i.test(lower)) return BILLING_RESPONSES.payment;
  if (/\b(cost|how much|price)\b/i.test(lower)) return BILLING_RESPONSES.cost;
  if (/\b(free|no cost|no charge)\b/i.test(lower)) return BILLING_RESPONSES.free;
  return pickFrom(BILLING_RESPONSES);
}

function getWorkflowResponse(message) {
  const lower = message.toLowerCase();
  
  if (/\b(download|pdf|docx|word|export|save|print)\b/i.test(lower)) return WORKFLOW_RESPONSES.download;
  if (/\b(builder|form|step by step|wizard)\b/i.test(lower)) return WORKFLOW_RESPONSES.builder;
  if (/\b(template|gallery|layout|design)\b/i.test(lower)) return WORKFLOW_RESPONSES.template;
  if (/\b(example|sample|reference|model)\b/i.test(lower)) return WORKFLOW_RESPONSES.examples;
  if (/\b(cover letter|outreach|email)\b/i.test(lower)) return WORKFLOW_RESPONSES.cover_letter;
  if (/\b(ai|chat|assistant|advisor|chatbot)\b/i.test(lower)) return WORKFLOW_RESPONSES.ai_chat;
  if (/\b(upload|import|file|pdf|docx)\b/i.test(lower)) return WORKFLOW_RESPONSES.upload;
  return "I can guide you through any part of the platform. What specific feature are you trying to find?";
}

function buildDefaultResponse(message, lowerMessage, userLevel) {
  if (/\b(recommend|should i|good idea|worth|worthwhile|advisable|suggest)\b/i.test(lowerMessage)) {
    return pickRandom([
      "Great question. I'd suggest starting with a self-audit: read your resume out loud, check for quantifiable achievements, and make sure each bullet answers 'So what?' Want me to help you run through one?",
      "It depends on your goals, but a strong rule of thumb is to customize your resume for each application. That single change makes a huge difference. Want to talk through your target role?",
      "Always start with clarity: know what role you want, then build your resume around those requirements. I can help you map your experience to any job description if you share it."
    ]);
  }
  
  if (/\b(compare|vs|versus|difference|better|which)\b/i.test(lowerMessage)) {
    return "It's hard to speak absolutely without context, but generally I'd recommend choosing the approach that tells a clearer, more results-driven story. Want to share specifics so I can give more targeted guidance?";
  }
  
  if (/\b(tips|advice|suggestions|help|guidance)\b/i.test(lowerMessage)) {
    return pickRandom(RESPONSE_VARIANTS.general_advice_intro) + " Prioritize action verbs and measurable outcomes over responsibilities. Recruiters hire based on impact, not job descriptions. What part of your resume could use more impact?";
  }
  
  return pickRandom([
    "That's a fair question. The best resumes tell a clear story of progression and impact. Want to explore a specific angle together?",
    "I'd love to help dig into that. Could you share a bit more about what you're aiming for?",
    "Every resume situation is unique. If you can tell me more about your target role or current challenge, I can give you much more focused advice.",
    "Good thinking — the details matter here. Let's walk through it: what's the specific outcome you want from your resume?"
  ]);
}

export function getLocalChatbotResponse(message, _userData = {}) {
  const query = (message || '').trim();
  const lowerQuery = query.toLowerCase();
  const resumeText = _userData?.resume_text || '';
  
  let context = DEFAULT_CONTEXT;
  let parseResults = {};
  
  if (resumeText && !context.resumeAnalyzed) {
    parseResults = {
      name: ResumeParser.extractName(resumeText),
      skills: ResumeParser.extractSkills(resumeText),
      experienceRoles: ResumeParser.extractExperience(resumeText),
      level: ResumeParser.detectLevel(resumeText),
      metricsFound: ResumeParser.hasQuantifiableMetrics(resumeText),
      missingSections: ResumeParser.missingCoreSections(resumeText),
      softSkillsCount: ResumeParser.hasSoftSkills(resumeText),
      hasProjects: ResumeParser.hasProjectsSection(resumeText),
      hasSummary: ResumeParser.hasSummarySection(resumeText),
      keyAchievements: ResumeParser.extractKeyAchievements(resumeText)
    };
    context.resumeAnalyzed = true;
    if (parseResults.name) context.userName = parseResults.name;
  }
  
  const words = query.split(/\s+/);
  if (words.length < 2 && !/\b(hi|hello|hey)\b/i.test(query)) {
    return {
      response: "Could you tell me a bit more? For example, you could ask about resume formatting, ATS optimization, interview prep, or anything else related to your career."
    };
  }
  
  const typos = detectTyposOnly(query);
  let typoNote = '';
  if (typos.length > 0 && typos[0]) {
    const t = typos[0];
    typoNote = `I noticed you wrote "${t.typo}" — just a heads-up to fix that in your resume too. The correct spelling is "${t.correction}". Recruiters notice these small details.\n\n`;
  }
  
  const userLevel = detectUserLevel(query, resumeText);
  const intent = classifyIntent(query, lowerQuery);
  context.startNewTopic(intent);
  
  let responseBody = '';
  
  if (intent === 'greeting') {
    if (resumeText && parseResults.name) {
      responseBody = buildResumeGreeting(parseResults, context.userName);
    } else {
      responseBody = pickRandom(RESPONSE_VARIANTS.greeting);
    }
  } else if (intent === 'gratitude') {
    responseBody = pickRandom(RESPONSE_VARIANTS.gratitude);
  } else if (intent === 'closing') {
    responseBody = pickRandom(RESPONSE_VARIANTS.closing);
  } else if (intent === 'disambiguation') {
    responseBody = pickRandom(RESPONSE_VARIANTS.disambiguation);
  } else if (intent === 'billing') {
    responseBody = getBillingResponse(query);
  } else if (intent === 'website_workflow') {
    responseBody = getWorkflowResponse(query);
  } else if (intent === 'follow_up') {
    const base = buildGradualReveal(intent, context);
    responseBody = base + " " + buildDefaultResponse(query, lowerQuery, userLevel);
  } else if (intent === 'grammar_spelling') {
    responseBody = "Absolutely! Grammar and spelling matter on a resume — they're a direct reflection of your attention to detail. Aim for zero errors by running your final draft through a spellchecker and reading it backward. Want help with any specific wording?";
  } else if (intent === 'resume_quality') {
    responseBody = pickRandom(RESPONSE_VARIANTS.resume_quality);
  } else if (intent === 'writing_help') {
    responseBody = pickRandom(RESPONSE_VARIANTS.writing_help);
  } else if (intent === 'ats') {
    responseBody = pickRandom(RESPONSE_VARIANTS.ats_advice);
  } else if (intent === 'interview') {
    responseBody = pickRandom(RESPONSE_VARIANTS.interview_advice);
  } else if (intent === 'cover_letter') {
    responseBody = pickRandom(RESPONSE_VARIANTS.cover_letter_advice);
  } else if (intent === 'career_path') {
    responseBody = pickRandom(RESPONSE_VARIANTS.career_advice);
  } else if (intent === 'template') {
    responseBody = pickRandom(RESPONSE_VARIANTS.resume_quality) + " Browse the Template Gallery — we have over 200 options, and our ATS-friendly picks include Stockholm, Wall Street, and Harvard. Want me to suggest one based on your industry?";
  } else if (intent === 'resume_upload') {
    responseBody = getWorkflowResponse(query);
  } else {
    responseBody = buildDefaultResponse(query, lowerQuery, userLevel);
  }
  
  const followUp = buildFollowUp(context, resumeText);
  if (followUp && responseBody.length < 400) {
    responseBody += ' ' + followUp;
  }
  
  const finalResponse = typoNote + responseBody;
  
  return {
    response: finalResponse.trim()
  };
}
