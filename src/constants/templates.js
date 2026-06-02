// ============================================================================
// RESUME TEMPLATE LIBRARY — 200+ Professional ATS-Friendly Templates
// ============================================================================
// Structure inspired by: resume-now.com, overleaf.com, resume.io, canva.com
// All templates are original structural interpretations — no copyrighted designs copied
// ============================================================================

export const CATEGORY_GROUPS = [
  { id: 'basic', label: 'Basic / Beginner', categories: ['basic', 'ats'] },
  { id: 'expert', label: 'Expert / Senior Professional', categories: ['expert', 'executive', 'professional'] },
  { id: 'it', label: 'IT / Technical', categories: ['it', 'technical', 'creative'] },
  { id: 'government', label: 'Government / Civil Service', categories: ['government', 'ats'] },
  { id: 'business', label: 'Business / Industrial', categories: ['business', 'professional'] },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'ats', label: 'ATS Friendly' },
  { id: 'basic', label: 'Basic / Beginner' },
  { id: 'expert', label: 'Expert / Senior Professional' },
  { id: 'it', label: 'IT / Technical' },
  { id: 'government', label: 'Government / Civil Service' },
  { id: 'business', label: 'Business / Industrial' },
  { id: 'professional', label: 'Professional General' },
  { id: 'executive', label: 'Executive' },
  { id: 'creative', label: 'Creative Modern' },
];

const TRACK_COLORS = {
  basic: [
    { header: '#0f172a', accent: '#2563eb', text: '#1e293b', sidebar: '#f8fafc' },
    { header: '#1e3a8a', accent: '#3b82f6', text: '#334155', sidebar: '#eff6ff' },
    { header: '#14532d', accent: '#16a34a', text: '#374151', sidebar: '#f0fdf4' },
    { header: '#1e293b', accent: '#64748b', text: '#334155', sidebar: '#f8fafc' },
    { header: '#172554', accent: '#1d4ed8', text: '#1e293b', sidebar: '#eff6ff' },
    { header: '#0f172a', accent: '#475569', text: '#334155', sidebar: '#f1f5f9' },
    { header: '#1c1917', accent: '#78716c', text: '#292524', sidebar: '#f5f5f4' },
    { header: '#0c4a6e', accent: '#0891b2', text: '#164e63', sidebar: '#ecfeff' },
    { header: '#365314', accent: '#65a30d', text: '#3f6212', sidebar: '#f7fee7' },
    { header: '#4c1d95', accent: '#7c3aed', text: '#5b21b6', sidebar: '#f5f3ff' },
  ],
  expert: [
    { header: '#0c0a09', accent: '#b45309', text: '#292524', sidebar: '#fffbeb' },
    { header: '#1e3a5f', accent: '#b87333', text: '#334155', sidebar: '#fef3e2' },
    { header: '#450a0a', accent: '#b91c1c', text: '#404040', sidebar: '#fef2f2' },
    { header: '#1c1917', accent: '#78716c', text: '#44403c', sidebar: '#f5f5f4' },
    { header: '#172554', accent: '#1e40af', text: '#1e293b', sidebar: '#eff6ff' },
    { header: '#422006', accent: '#a16207', text: '#44403c', sidebar: '#fefce8' },
    { header: '#082f49', accent: '#0369a1', text: '#0c4a6e', sidebar: '#f0f9ff' },
    { header: '#1a1a2e', accent: '#c9a227', text: '#16213e', sidebar: '#fffbeb' },
    { header: '#212529', accent: '#6c757d', text: '#343a40', sidebar: '#f8f9fa' },
    { header: '#2d1b00', accent: '#d97706', text: '#451a03', sidebar: '#fff7ed' },
  ],
  it: [
    { header: '#0f172a', accent: '#0284c7', text: '#334155', sidebar: '#e0f2fe' },
    { header: '#312e81', accent: '#6d28d9', text: '#3730a3', sidebar: '#ede9fe' },
    { header: '#022c22', accent: '#0d9488', text: '#134e4a', sidebar: '#ccfbf1' },
    { header: '#1e1b4b', accent: '#4f46e5', text: '#312e81', sidebar: '#e0e7ff' },
    { header: '#0f172a', accent: '#06b6d4', text: '#164e63', sidebar: '#cffafe' },
    { header: '#172554', accent: '#2563eb', text: '#1e40af', sidebar: '#dbeafe' },
    { header: '#1a1a2e', accent: '#6366f1', text: '#3730a3', sidebar: '#e0e7ff' },
    { header: '#0c4a6e', accent: '#0ea5e9', text: '#075985', sidebar: '#e0f2fe' },
    { header: '#1e293b', accent: '#8b5cf6', text: '#4338ca', sidebar: '#ede9fe' },
    { header: '#134e4a', accent: '#14b8a6', text: '#0f766e', sidebar: '#ccfbf1' },
  ],
  government: [
    { header: '#0f172a', accent: '#1e40af', text: '#1e293b', sidebar: '#f8fafc' },
    { header: '#14532d', accent: '#15803d', text: '#166534', sidebar: '#f0fdf4' },
    { header: '#1c1917', accent: '#57534e', text: '#292524', sidebar: '#f5f5f4' },
    { header: '#1e3a8a', accent: '#1d4ed8', text: '#1e40af', sidebar: '#eff6ff' },
    { header: '#064e3b', accent: '#047857', text: '#065f46', sidebar: '#ecfdf5' },
    { header: '#292524', accent: '#78716c', text: '#44403c', sidebar: '#fafaf9' },
    { header: '#0c4a6e', accent: '#0284c7', text: '#0369a1', sidebar: '#f0f9ff' },
    { header: '#1e293b', accent: '#475569', text: '#334155', sidebar: '#f8fafc' },
    { header: '#365314', accent: '#4d7c0f', text: '#3f6212', sidebar: '#f7fee7' },
    { header: '#3f6212', accent: '#65a30d', text: '#3f6212', sidebar: '#f7fee7' },
  ],
  business: [
    { header: '#0f172a', accent: '#1e40af', text: '#1e293b', sidebar: '#f8fafc' },
    { header: '#1e3a5f', accent: '#0f766e', text: '#334155', sidebar: '#f0fdfa' },
    { header: '#1c1917', accent: '#44403c', text: '#292524', sidebar: '#fafaf9' },
    { header: '#172554', accent: '#1e40af', text: '#1e293b', sidebar: '#eff6ff' },
    { header: '#0f172a', accent: '#475569', text: '#334155', sidebar: '#f1f5f9' },
    { header: '#292524', accent: '#78716c', text: '#44403c', sidebar: '#f5f5f4' },
    { header: '#1e293b', accent: '#64748b', text: '#334155', sidebar: '#f8fafc' },
    { header: '#0c4a6e', accent: '#0284c7', text: '#075985', sidebar: '#e0f2fe' },
    { header: '#1c1917', accent: '#b91c1c', text: '#1c1917', sidebar: '#fef2f2' },
    { header: '#1e3a8a', accent: '#2563eb', text: '#1e40af', sidebar: '#eff6ff' },
  ],
};

const TRACK_FONTS = {
  basic: [
    { primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
    { primary: "'Roboto', sans-serif", secondary: "'Roboto', sans-serif" },
    { primary: "'Source Sans 3', sans-serif", secondary: "'Source Sans 3', sans-serif" },
    { primary: "'Lato', sans-serif", secondary: "'Lato', sans-serif" },
    { primary: "'Open Sans', sans-serif", secondary: "'Open Sans', sans-serif" },
    { primary: "'Montserrat', sans-serif", secondary: "'Montserrat', sans-serif" },
    { primary: "'Nunito Sans', sans-serif", secondary: "'Nunito Sans', sans-serif" },
    { primary: "'Work Sans', sans-serif", secondary: "'Work Sans', sans-serif" },
    { primary: "'IBM Plex Sans', sans-serif", secondary: "'IBM Plex Sans', sans-serif" },
    { primary: "'Noto Sans', sans-serif", secondary: "'Noto Sans', sans-serif" },
  ],
  expert: [
    { primary: "'Playfair Display', serif", secondary: "'Inter', sans-serif" },
    { primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
    { primary: "'Cormorant Garamond', serif", secondary: "'Inter', sans-serif" },
    { primary: "'DM Sans', sans-serif", secondary: "'DM Sans', sans-serif" },
    { primary: "'Outfit', sans-serif", secondary: "'Outfit', sans-serif" },
    { primary: "'Merriweather', serif", secondary: "'Inter', sans-serif" },
    { primary: "'Libre Baskerville', serif", secondary: "'Inter', sans-serif" },
    { primary: "'Noto Serif', serif", secondary: "'Noto Sans', sans-serif" },
    { primary: "'Raleway', sans-serif", secondary: "'Raleway', sans-serif" },
    { primary: "'Roboto Slab', serif", secondary: "'Roboto', sans-serif" },
  ],
  it: [
    { primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
    { primary: "'JetBrains Mono', monospace", secondary: "'Inter', sans-serif" },
    { primary: "'Fira Code', monospace", secondary: "'Inter', sans-serif" },
    { primary: "'Outfit', sans-serif", secondary: "'Outfit', sans-serif" },
    { primary: "'Space Grotesk', sans-serif", secondary: "'Space Grotesk', sans-serif" },
    { primary: "'IBM Plex Sans', sans-serif", secondary: "'IBM Plex Sans', sans-serif" },
    { primary: "'Source Code Pro', monospace", secondary: "'Inter', sans-serif" },
    { primary: "'Raleway', sans-serif", secondary: "'Raleway', sans-serif" },
    { primary: "'Urbanist', sans-serif", secondary: "'Urbanist', sans-serif" },
    { primary: "'DM Sans', sans-serif", secondary: "'DM Sans', sans-serif" },
  ],
  government: [
    { primary: "'Times New Roman', serif", secondary: "'Times New Roman', serif" },
    { primary: "'Georgia', serif", secondary: "'Georgia', serif" },
    { primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
    { primary: "'Roboto', sans-serif", secondary: "'Roboto', sans-serif" },
    { primary: "'Arial', sans-serif", secondary: "'Arial', sans-serif" },
    { primary: "'Noto Serif', serif", secondary: "'Noto Sans', sans-serif" },
    { primary: "'Source Serif 4', serif", secondary: "'Source Sans 3', sans-serif" },
    { primary: "'Merriweather', serif", secondary: "'Merriweather', serif" },
    { primary: "'Libre Baskerville', serif", secondary: "'Libre Baskerville', serif" },
    { primary: "'IBM Plex Serif', serif", secondary: "'IBM Plex Sans', sans-serif" },
  ],
  business: [
    { primary: "'Inter', sans-serif", secondary: "'Inter', sans-serif" },
    { primary: "'DM Sans', sans-serif", secondary: "'DM Sans', sans-serif" },
    { primary: "'Outfit', sans-serif", secondary: "'Outfit', sans-serif" },
    { primary: "'Poppins', sans-serif", secondary: "'Poppins', sans-serif" },
    { primary: "'Roboto', sans-serif", secondary: "'Roboto', sans-serif" },
    { primary: "'Lato', sans-serif", secondary: "'Lato', sans-serif" },
    { primary: "'Montserrat', sans-serif", secondary: "'Montserrat', sans-serif" },
    { primary: "'Work Sans', sans-serif", secondary: "'Work Sans', sans-serif" },
    { primary: "'Urbanist', sans-serif", secondary: "'Urbanist', sans-serif" },
    { primary: "'Manrope', sans-serif", secondary: "'Manrope', sans-serif" },
  ],
};

const TRACK_ARCHETYPES = {
  basic: [
    'ats-optimized', 'ats-optimized', 'ats-optimized', 'classic-clean',
    'classic-clean', 'classic-clean', 'modern-sidebar', 'modern-sidebar',
    'modern-sidebar-right', 'two-column-balanced',
  ],
  expert: [
    'executive-banner', 'executive-banner', 'elegant-divider', 'elegant-divider',
    'classic-clean', 'corporate-grid', 'two-column-balanced', 'modern-banner',
    'executive-banner', 'classic-clean',
  ],
  it: [
    'modern-sidebar', 'modern-sidebar', 'modern-sidebar', 'modern-sidebar-right',
    'creative-timeline', 'two-column-weighted', 'ats-optimized', 'grid-layout',
    'timeline', 'modern-banner',
  ],
  government: [
    'ats-optimized', 'ats-optimized', 'ats-optimized', 'ats-optimized',
    'classic-clean', 'academic-classic', 'two-column-balanced', 'two-column-balanced',
  ],
  business: [
    'corporate-grid', 'corporate-grid', 'two-column-balanced', 'two-column-balanced',
    'modern-banner', 'sidebar-left', 'classic-clean', 'modern-sidebar',
  ],
};

const TRACK_HEADER_TYPES = {
  basic: ['classic', 'classic', 'centered', 'classic', 'modern-split', 'centered', 'classic', 'classic', 'modern-split', 'centered'],
  expert: ['modern-banner', 'classic', 'centered', 'centered', 'modern-split', 'classic', 'modern-banner', 'modern-banner', 'classic', 'centered'],
  it: ['modern-split', 'modern-banner', 'modern-split', 'modern-banner', 'modern-banner', 'modern-split', 'classic', 'classic', 'modern-banner', 'modern-split'],
  government: ['classic', 'classic', 'classic', 'centered', 'classic', 'centered', 'classic', 'centered', 'classic', 'classic'],
  business: ['modern-split', 'modern-banner', 'modern-split', 'classic', 'modern-split', 'modern-split', 'classic', 'classic', 'modern-banner', 'modern-split'],
};

const TRACK_DIVIDERS = {
  basic: ['none', 'thin-line', 'thin-line', 'thin-line', 'none', 'thin-line', 'accent-bar', 'accent-bar', 'accent-bar', 'thin-line'],
  expert: ['thick-line', 'double-line', 'ornament', 'ornament', 'colored-block', 'accent-bar', 'colored-block', 'thick-line', 'double-line', 'thin-line'],
  it: ['accent-bar', 'gradient-line', 'gradient-line', 'accent-bar', 'gradient-line', 'accent-bar', 'thin-line', 'thin-line', 'gradient-line', 'accent-bar'],
  government: ['thin-line', 'thin-line', 'none', 'thin-line', 'thin-line', 'thin-line', 'thin-line', 'none', 'thin-line', 'thin-line'],
  business: ['accent-bar', 'colored-block', 'accent-bar', 'accent-bar', 'thick-line', 'thick-line', 'thin-line', 'accent-bar', 'double-line', 'thin-line'],
};

const TRACK_SPACING = {
  basic: [0.95, 1.0, 0.95, 1.0, 1.0, 0.95, 1.0, 1.05, 1.0, 0.95],
  expert: [1.1, 1.15, 1.15, 1.2, 1.1, 1.05, 1.1, 1.15, 1.1, 1.05],
  it: [1.0, 1.05, 1.0, 1.05, 1.05, 1.0, 1.0, 1.0, 1.05, 1.0],
  government: [0.95, 1.0, 1.0, 0.95, 1.0, 1.0, 0.95, 1.0, 1.0, 0.95],
  business: [1.05, 1.05, 1.0, 1.05, 1.1, 1.05, 1.0, 1.0, 1.1, 1.0],
};

function mapArchetypeToLayout(archetype) {
  const layoutMap = {
    'ats-optimized': 'single-column',
    'classic-clean': 'single-column',
    'modern-sidebar': 'sidebar-left',
    'modern-sidebar-right': 'sidebar-right',
    'executive-banner': 'single-column',
    'elegant-divider': 'single-column',
    'academic-classic': 'single-column',
    'modern-banner': 'single-column',
    'corporate-grid': 'grid-layout',
    'two-column-balanced': 'two-column',
    'two-column-weighted': 'two-column',
    'creative-timeline': 'timeline',
    'timeline': 'timeline',
    'grid-layout': 'grid-layout',
    'sidebar-left': 'sidebar-left',
    'sidebar-right': 'sidebar-right',
  };
  return layoutMap[archetype] || 'single-column';
}

const TRACK_NAME_BASES = {
  basic: [
    'Essential Starter', 'Clean Start', 'Simple Professional', 'Fresh Grad',
    'New Career', 'First Resume', 'Starter Kit', 'Launch Pad', 'Entry Point', 'Foundation',
  ],
  expert: [
    'Executive Command', 'C-Suite Elite', "Director's Suite", "President's Choice",
    'Senior Authority', 'Leadership Premium', 'Boardroom', 'Executive Edge', 'C-Level Gold', 'Master Professional',
  ],
  it: [
    'Tech Modernist', 'Code Professional', 'Dev Engineer', 'System Architect',
    'Data Pro', 'Cloud Expert', 'Digital Specialist', 'API Pro', 'Stack Developer', 'Tech Lead Elite',
  ],
  government: [
    'Public Service Pro', 'Civil Professional', 'Government Standard', 'Federal Classic',
    'State Service', 'Military Transition', 'Public Admin', 'Civic Leader', 'Service Professional', 'Protocol Standard',
  ],
  business: [
    'Corporate Elite', 'Business Pro', 'Manager Plus', 'Consultant Pro',
    'Finance Executive', 'Sales Leader', 'Operations Pro', 'Strategy Plus', 'Growth Executive', 'Market Leader',
  ],
};

const TRACK_NAME_SUFFIXES = ['', ' II', ' Pro', ' Prime', ' Plus', ' Select', ' Advance', ' Core', ' Edge', ' Ultra'];

const TRACK_CATEGORIES_MAP = {
  basic: { categories: ['basic', 'ats'], category: 'basic' },
  expert: { categories: ['expert', 'professional', 'executive'], category: 'expert' },
  it: { categories: ['it', 'technical', 'creative'], category: 'it' },
  government: { categories: ['government', 'ats'], category: 'government' },
  business: { categories: ['business', 'professional'], category: 'business' },
};

const TRACK_IDS = {
  basic: 'beg',
  expert: 'exp',
  it: 'it',
  government: 'gov',
  business: 'biz',
};

function generateTemplates() {
  const templates = [];
  const trackKeys = ['basic', 'expert', 'it', 'government', 'business'];

  trackKeys.forEach((track) => {
    const archetypes = TRACK_ARCHETYPES[track];
    const colors = TRACK_COLORS[track];
    const fonts = TRACK_FONTS[track];
    const headerTypes = TRACK_HEADER_TYPES[track];
    const dividers = TRACK_DIVIDERS[track];
    const spacings = TRACK_SPACING[track];
    const nameBases = TRACK_NAME_BASES[track];
    const catConfig = TRACK_CATEGORIES_MAP[track];
    const prefix = TRACK_IDS[track];

    for (let i = 0; i < 40; i++) {
      const idx = i % 10;
      const archetype = archetypes[idx];
      const colorSet = colors[idx];
      const fontSet = fonts[idx];
      const headerType = headerTypes[idx];
      const dividerStyle = dividers[idx];
      const spacingScale = spacings[idx];
      const nameBase = nameBases[idx];
      const suffix = i >= 10 ? TRACK_NAME_SUFFIXES[Math.floor(i / 10)] || TRACK_NAME_SUFFIXES[i % 10] : '';
      const name = `${nameBase}${suffix}`.trim();

      templates.push({
        id: `${prefix}-${String(i + 1).padStart(3, '0')}`,
        name,
        archetype,
        categories: catConfig.categories,
        category: catConfig.category,
        styles: {
          layout: mapArchetypeToLayout(archetype),
          headerType,
          fontFamily: fontSet.primary,
          secondaryFont: fontSet.secondary,
          headerColor: colorSet.header,
          accentColor: colorSet.accent,
          backgroundColor: '#ffffff',
          textColor: colorSet.text,
          sidebarBg: colorSet.sidebar,
          dividerStyle,
          spacingScale,
          sectionOrder: 'standard',
        },
      });
    }
  });

  return templates;
}

export const TEMPLATES = generateTemplates();

export const PREMIUM_SAMPLE_DATA = {
  personal: {
    name: 'Alexandra Chen',
    role: 'Senior Software Engineer',
    email: 'alex.chen@email.com',
    phone: '+1 (415) 892-3047',
    location: 'San Francisco, CA',
    website: 'alexchen.dev',
    linkedin: 'linkedin.com/in/alexandrachen',
  },
  summary: 'Results-driven Senior Software Engineer with 8+ years of experience designing scalable distributed systems and leading cross-functional engineering teams. Specialized in cloud-native architectures, real-time data pipelines, and high-performance APIs serving 50M+ daily requests. Proven track record of reducing infrastructure costs by 40% while improving system reliability to 99.99% uptime.',
  experience: [
    {
      id: 1,
      role: 'Senior Software Engineer',
      company: 'Stripe',
      dates: 'Jan 2022 – Present',
      location: 'San Francisco, CA',
      description: '- Architected a real-time fraud detection pipeline processing 15M+ transactions daily with sub-100ms latency.\n- Led migration of monolithic payment service to microservices, reducing deployment time from 4 hours to 12 minutes.\n- Mentored 6 junior engineers and established code review standards adopted across 3 engineering teams.',
    },
    {
      id: 2,
      role: 'Software Engineer II',
      company: 'Datadog',
      dates: 'Jun 2019 – Dec 2021',
      location: 'New York, NY',
      description: '- Built high-throughput metrics ingestion service handling 2B+ data points per day using Go and Kafka.\n- Designed and implemented customer-facing dashboard API, improving page load performance by 65%.\n- Contributed to open-source monitoring libraries with 2,000+ GitHub stars.',
    },
    {
      id: 3,
      role: 'Software Engineer',
      company: 'Palantir Technologies',
      dates: 'Aug 2016 – May 2019',
      location: 'Palo Alto, CA',
      description: '- Developed data integration platform connecting 50+ enterprise data sources for Fortune 500 clients.\n- Optimized query engine reducing average response time from 8s to 400ms for complex analytical queries.',
    },
  ],
  education: [
    {
      id: 4,
      degree: 'M.S. Computer Science',
      school: 'Stanford University',
      dates: '2014 – 2016',
      honors: 'Focus: Distributed Systems & Machine Learning | GPA: 3.92/4.0',
    },
    {
      id: 5,
      degree: 'B.S. Computer Science',
      school: 'UC Berkeley',
      dates: '2010 – 2014',
      honors: 'Summa Cum Laude | Dean\'s List (all semesters) | GPA: 3.95/4.0',
    },
  ],
  skills: [
    { id: 6, category: 'Languages', items: 'Go, Python, TypeScript, Rust, Java, SQL' },
    { id: 7, category: 'Frameworks & Tools', items: 'React, Node.js, gRPC, Kafka, Redis, PostgreSQL' },
    { id: 8, category: 'Infrastructure', items: 'AWS, GCP, Kubernetes, Docker, Terraform, CI/CD' },
  ],
  projects: [
    {
      id: 9,
      name: 'DistCache — Distributed Caching Engine',
      link: 'github.com/alexchen/distcache',
      description: '- Built an open-source distributed memory cache in Go, achieving 50K ops/sec with consistent hashing.\n- Adopted by 3 companies in production; 1,200+ GitHub stars.',
    },
  ],
  certifications: [
    { id: 10, name: 'AWS Certified Solutions Architect – Professional', year: '2023' },
    { id: 11, name: 'Google Cloud Professional Data Engineer', year: '2022' },
  ],
  achievements: [
    { id: 12, name: 'Patent Holder — US Patent #10,234,567', details: 'Real-time anomaly detection in distributed payment systems' },
    { id: 13, name: '1st Place, Stripe Internal Hackathon 2023', details: 'Built ML-powered merchant risk scoring prototype' },
  ],
  languages: [
    { id: 14, name: 'English', proficiency: 'Native' },
    { id: 15, name: 'Mandarin', proficiency: 'Fluent' },
    { id: 16, name: 'Spanish', proficiency: 'Conversational' },
  ],
  customSections: [],
  visibleSections: {
    summary: true,
    experience: true,
    internships: false,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    achievements: true,
    languages: true,
    customSections: false,
  },
};
