/**
 * Client-side local chatbot simulation.
 * Handles intent classification, typo detection, incomplete queries,
 * experience-adapted advice, and randomized responses for offline capability.
 */

const TYPOS_MAP = {
  'resum': 'resume',
  'intervw': 'interview',
  'experince': 'experience',
  'skillz': 'skills',
  'manger': 'manager',
  'certficate': 'certificate',
  'achievment': 'achievement'
};

const RANDOM_INTROS = [
  "I'd be glad to help with that! Here is some targeted advice:",
  "Great question! Based on recruiter guidelines, here is what you should consider:",
  "Let's tackle this step-by-step. Here are some actionable suggestions:",
  "Excellent query. Here is a professional perspective on this:"
];

export function getLocalChatbotResponse(message, _userData = {}) {
  const query = (message || '').trim();
  const lowerQuery = query.toLowerCase();

  // 1. Check for short / incomplete queries
  if (query.split(/\s+/).length < 2) {
    return {
      response: `It looks like you entered a very short query: "${query}". Could you please clarify what you're looking for? E.g., "How can I improve my software developer resume?" or "How do I format my experience section?"`
    };
  }

  // 2. Check for spelling typos and generate a constructive note
  let typoCorrectionNote = "";
  const detectedTypos = [];
  Object.keys(TYPOS_MAP).forEach(typo => {
    if (new RegExp('\\b' + typo + '\\b', 'i').test(lowerQuery)) {
      detectedTypos.push(`"${typo}" (should be "${TYPOS_MAP[typo]}")`);
    }
  });
  if (detectedTypos.length > 0) {
    typoCorrectionNote = `*Note: I noticed a minor typo in your query: ${detectedTypos.join(', ')}. Keep an eye on similar typos in your resume, as spelling mistakes are a top reason recruiters reject candidates!* \n\n`;
  }

  // 3. Detect experience level
  let experienceLevel = 'mid';
  if (/\b(fresher|junior|student|graduate|entry|college|intern|beginner|no experience)\b/.test(lowerQuery)) {
    experienceLevel = 'fresher';
  } else if (/\b(senior|lead|manager|executive|director|vp|principal|years of experience)\b/.test(lowerQuery)) {
    experienceLevel = 'executive';
  }

  // 4. Classify intent
  let advice;

  if (/\b(ats|parser|score|match|scan|system|optimize|optimized)\b/.test(lowerQuery)) {
    advice = `### ATS Compatibility Guidelines
- **Use Standard Section Headers**: Keep headers simple: \`WORK EXPERIENCE\`, \`EDUCATION\`, \`SKILLS\`, \`AWARDS\`, \`PROJECTS\`. Avoid creative names like "My Journey" or "Expertise Details".
- **Format Chronologically**: List items starting with your most recent experience.
- **Ensure Plain-Text Compatibility**: Avoid columns, graphics, text boxes, or tables if you are submitting to older ATS platforms. Use our single-column layout templates like "Stockholm" or "Wall Street".`;
  } 
  else if (/\b(write|summary|objective|bullet|phrasing|phrase|google|xyz)\b/.test(lowerQuery)) {
    advice = `### Action-Oriented Resume Writing Tips
- **Google X-Y-Z Formula**: Write bullet points showing impact: *Accomplished [X], as measured by [Y], by doing [Z].* E.g., "Enhanced query speed by 40% (Y) by rewriting legacy PostgreSQL joins (Z), speeding up reports (X)."
- **Summary vs. Objective**: Use a **Professional Summary** if you have experience (summarizing achievements + tech skills). Use a **Career Objective** if you are a student/career switcher (highlighting your passion, education, and what you aim to achieve).`;
  }
  else if (/\b(interview|prep|prepare|question|star|behavioral)\b/.test(lowerQuery)) {
    advice = `### Interview Preparation Tips
- **Use the STAR Method**: Prepare answers using **Situation, Task, Action, Result**. Highlight the concrete impact you made.
- **Quantify Your Work**: Be ready to explain *how* you calculated metrics in your resume.
- **Match the Job Description**: Study the core requirements and prepare 2 stories demonstrating how you utilized those specific skills.`;
  }
  else if (/\b(export|download|pdf|docx|word|save|print|builder|template|preview)\b/.test(lowerQuery)) {
    advice = `### Exporter and Builder Assistance
- **Download Options**: Click the **Download** button in the preview pane. You can export as **PDF** (highly recommended for visual consistency) or **DOCX/Word** (best if you need to edit further).
- **Layouts and Grids**: Use the **Template Selector** to switch between layouts. For a classic corporate look, choose "Wall Street" or "Harvard". For creative, choose "Stockholm".`;
  }
  else if (/\b(award|achievement|honor|cert|certificate)\b/.test(lowerQuery)) {
    advice = `### Showcasing Awards & Certifications
- **List Structured Details**: For every award, include the **Title**, **Granting Organization (Issuer)**, and the **Year**.
- **Demonstrate Prestige**: If relevant, add details. E.g., "Employee of the Year (1 recipient selected out of 150 team members)."
- **Keep it Professional**: Place technical certifications and academic honors in clear dedicated lists.`;
  }
  else {
    advice = `### Resume Optimizer Best Practices
- **Customization is Key**: Optimize your resume for *each* role. Align your skills section with keywords from the target job description.
- **Quantify Impact**: Include dollar values, percentage improvements, and headcount managed to show scale.
- **Keep it Concise**: A 1-page resume is optimal for candidates with under 8 years of experience.`;
  }

  // 5. Adapt advice based on experience level
  let levelAdvice = "";
  if (experienceLevel === 'fresher') {
    levelAdvice = `\n\n### Career Starter/Fresher Advice
- **Leverage Academic Projects**: Focus heavily on capstone projects, club leadership, coursework, and personal git repositories.
- **Showcase Adaptability**: Emphasize quick learning, core academic foundations, and any extra certifications.`;
  } else if (experienceLevel === 'executive') {
    levelAdvice = `\n\n### Executive/Senior Level Advice
- **Focus on Leadership & Scope**: Emphasize team size managed, budget responsibilities, and strategic vision.
- **Highlight Business Outcomes**: Focus on revenue growth, cost reduction, efficiency improvements, and stakeholder alignment.`;
  }

  const intro = RANDOM_INTROS[Math.floor(Math.random() * RANDOM_INTROS.length)];
  const fullResponse = `${typoCorrectionNote}${intro}\n\n${advice}${levelAdvice}`;

  return {
    response: fullResponse
  };
}
