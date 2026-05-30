/**
 * Programmatically generates a rich library of 200+ professional resume examples across 15 categories.
 * Each entry is fully structured and can be loaded directly into the Resume Builder.
 */

const CATEGORIES = [
  { id: 'college', label: 'College Students' },
  { id: 'freshers', label: 'Freshers' },
  { id: 'entry', label: 'Entry-Level' },
  { id: 'experienced', label: 'Experienced Professionals' },
  { id: 'it', label: 'IT Professionals' },
  { id: 'swe', label: 'Software Engineers' },
  { id: 'data', label: 'Data Analysts' },
  { id: 'designer', label: 'Designers' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'sales', label: 'Sales' },
  { id: 'finance', label: 'Finance' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'hr', label: 'HR' },
  { id: 'management', label: 'Management' },
  { id: 'executive', label: 'Executive Roles' },
  { id: 'data-scientist', label: 'Data Scientists' },
  { id: 'fullstack', label: 'Full Stack Developers' },
  { id: 'uiux', label: 'UI/UX Designers' },
  { id: 'product-manager', label: 'Product Managers' },
  { id: 'accountant', label: 'Accountants' },
  { id: 'business-analyst', label: 'Business Analysts' }
];

// Names database
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Jamie', 'Casey', 'Robin', 'Drew', 'Chris', 'Pat', 'Terry', 'Kim', 'Kelly', 'Ryan', 'Sarah', 'Jessica', 'David', 'James', 'John'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Los Angeles, CA', 'Atlanta, GA', 'Miami, FL'];

// Category-specific details
const DATA_BY_CATEGORY = {
  college: {
    titles: ['Computer Science Undergrad', 'Business Administration Student', 'Mechanical Engineering Senior', 'Graphic Design Student', 'Pre-Med Bio Student'],
    skills: [
      { category: 'Programming', items: 'Python, C++, Java, Git, HTML/CSS' },
      { category: 'Tools', items: 'Microsoft Excel, Google Workspace, Figma, LaTeX' },
      { category: 'Soft Skills', items: 'Collaboration, Public Speaking, Technical Writing, Problem Solving' }
    ],
    summaries: [
      "Motivated and detail-oriented undergraduate student pursuing a B.S. in Computer Science. Eager to apply academic training in algorithms and software design to real-world engineering challenges.",
      "Dedicated honors student majoring in Business Administration. Proven leadership capability through university club roles and team-based case study challenges."
    ],
    experiences: [
      { role: 'Academic Peer Tutor', company: 'University Learning Center', dates: '2024 - Present', description: '- Mentored 20+ students weekly in college algebra and physics.\n- Designed visual study guides that improved average student exam scores by 15%.' }
    ],
    projects: [
      { name: 'Visual Algorithm Pathfinding Simulator', link: 'github.com/student/pathfinder', description: '- Developed a Java-based desktop application showcasing Dijkstra and A* pathfinding animations.\n- Reached 50+ stars on GitHub and was featured in the department newsletter.' }
    ]
  },
  freshers: {
    titles: ['Graduate Software Engineer', 'Junior Accountant', 'Associate Marketing Specialist', 'HR Coordinator', 'Entry-Level Web Developer'],
    skills: [
      { category: 'Core Skills', items: 'Data Analysis, SQL, Market Research, Communication' },
      { category: 'Tech Stack', items: 'JavaScript, React, Node.js, Microsoft Suite' }
    ],
    summaries: [
      "Ambitious recent graduate with a Bachelor's in Finance. Skilled in building spreadsheets and interpreting financial models, seeking to kickstart a career as an associate.",
      "Creative Communications graduate passionate about social media trends and content strategy. Energetic, organized, and ready to contribute to a collaborative marketing team."
    ],
    experiences: [
      { role: 'Volunteer Web Coordinator', company: 'Local Non-Profit Organization', dates: '2025', description: '- Maintained the organization homepage and updated monthly event listings.\n- Automated contact list management, saving volunteers 3 hours per week.' }
    ],
    projects: [
      { name: 'Personal Financial Tracker App', link: 'finance-tracker.me', description: '- Built a responsive React application to track personal expenses with interactive charts.\n- Implemented local storage parsing for offline usage.' }
    ]
  },
  entry: {
    titles: ['Customer Support Specialist', 'Junior Sales Associate', 'Operations Assistant', 'Junior Designer', 'QA Tester'],
    skills: [
      { category: 'Tools', items: 'Jira, Zendesk, Salesforce, Slack, Notion' },
      { category: 'Interpersonal', items: 'Conflict Resolution, Active Listening, Adaptability' }
    ],
    summaries: [
      "Enthusiastic Customer Success representative with 1 year of experience resolving customer inquiries and maintaining high satisfaction scores. Proficient in Zendesk.",
      "Detail-oriented Quality Assurance tester. Experienced in performing regression testing, writing test scripts, and tracking defects in Jira."
    ],
    experiences: [
      { role: 'Customer Care Representative', company: 'TechSolutions Inc.', dates: '2024 - 2025', description: '- Resolved 45+ daily customer support tickets with a 94% CSAT rating.\n- Authored 12 internal training guides for onboarding new support team members.' }
    ],
    projects: [
      { name: 'Support Automation Scripting', link: 'github.com/user/zendesk-scripts', description: '- Created Python scripts using the Zendesk API to automate common routing tasks.\n- Reduced manual ticket sorting time by 20%.' }
    ]
  },
  experienced: {
    titles: ['Senior Operations Specialist', 'Senior Program Manager', 'Lead Consultant', 'Supply Chain Analyst', 'Senior Research Scientist'],
    skills: [
      { category: 'Management', items: 'Strategic Planning, Process Optimization, Resource Allocation, Budgeting' },
      { category: 'Analysis', items: 'Six Sigma, Lean Operations, SAP, Excel Macros' }
    ],
    summaries: [
      "Results-driven Operations Specialist with over 6 years of experience optimizing logistics and supply chain systems. Proven record of saving operational costs.",
      "Versatile Program Manager with 8+ years of experience leading cross-functional teams to execute engineering deliverables. Skilled in Agile methodologies."
    ],
    experiences: [
      { role: 'Operations Manager', company: 'Global Logistics Corp', dates: '2021 - Present', description: '- Streamlined warehouse routing procedures, reducing shipping delays by 22%.\n- Managed a $1.2M budget while lowering overhead costs by 15% year-over-year.' },
      { role: 'Operations Associate', company: 'National Distribution Ltd', dates: '2018 - 2021', description: '- Monitored inventory levels across 4 regional hubs using SAP ERP.\n- Coordinated with 3rd-party logistics providers to ensure 99% on-time delivery.' }
    ],
    projects: [
      { name: 'Lean Six Sigma Redesign Project', link: 'portfolio.net/six-sigma', description: '- Led a process mapping taskforce to eliminate bottlenecks in packaging.\n- Certified Lean Green Belt project achieving $80k in annual savings.' }
    ]
  },
  it: {
    titles: ['Systems Administrator', 'Network Engineer', 'IT Support Manager', 'Database Administrator', 'Information Security Analyst'],
    skills: [
      { category: 'Networking', items: 'Cisco IOS, TCP/IP, DNS, VPNs, Active Directory' },
      { category: 'Security', items: 'Firewalls, Wireshark, SIEM, Vulnerability Assessment' }
    ],
    summaries: [
      "Certified IT Specialist with 5+ years of experience managing active directory environments, cloud backups, and network security controls. Quick to resolve hardware and software crises.",
      "Database Administrator expert in SQL Server, Oracle, and database performance tuning. Proven capacity to maintain 99.99% database uptime."
    ],
    experiences: [
      { role: 'Lead Network Engineer', company: 'Apex Enterprise Solutions', dates: '2022 - Present', description: '- Redesigned corporate VPN architecture to support 300+ remote workers securely.\n- Conducted monthly audits of server room infrastructure, fixing 10+ hardware faults.' }
    ],
    projects: [
      { name: 'Active Directory Migration', link: 'portfolio.org/ad-migration', description: '- Orchestrated migration of 1,200 users from legacy systems to Microsoft Azure Active Directory.\n- Zero downtime achieved for corporate email and credentials.' }
    ]
  },
  swe: {
    titles: ['Senior Software Engineer', 'Full Stack Developer', 'Cloud Engineer', 'DevOps Specialist', 'Frontend Architect'],
    skills: [
      { category: 'Languages', items: 'JavaScript, TypeScript, Python, Go, SQL' },
      { category: 'Frameworks', items: 'React, Node.js, Express, Docker, Kubernetes, AWS' }
    ],
    summaries: [
      "Innovative Software Engineer with 6+ years of full-stack expertise. Passionate about writing scalable, clean code and designing responsive web services.",
      "DevOps Specialist with a focus on continuous integration and infrastructure as code. Expert in AWS, Terraform, and Kubernetes."
    ],
    experiences: [
      { role: 'Senior Developer', company: 'InnovateTech Systems', dates: '2021 - Present', description: '- Spearheaded transition to microservices architecture, improving page speed by 40%.\n- Mentored 4 junior developers and established code review guidelines.' },
      { role: 'Software Engineer', company: 'ByteCraft Solutions', dates: '2019 - 2021', description: '- Built responsive client dashboards using React, Redux, and TailwindCSS.\n- Reduced API server response times by 30% through caching and query optimization.' }
    ],
    projects: [
      { name: 'Distributed Caching System', link: 'github.com/expert/dist-cache', description: '- Designed and implemented a high-performance distributed key-value store in Go.\n- Handled 10,000+ operations per second with sub-millisecond latencies.' }
    ]
  },
  data: {
    titles: ['Data Analyst', 'Business Intelligence Analyst', 'Data Scientist', 'Quantitative Analyst', 'Data Engineer'],
    skills: [
      { category: 'Data Tools', items: 'SQL, Python (Pandas/NumPy), R, Tableau, Power BI' },
      { category: 'Statistical Method', items: 'Regression Analysis, A/B Testing, Machine Learning, Forecasting' }
    ],
    summaries: [
      "Detail-oriented Data Analyst with 4+ years of experience turning complex datasets into actionable business intelligence. Expert in SQL and Tableau visualizations.",
      "Data Scientist with a background in machine learning and predictive modeling. Skilled in building recommendation systems that drive client retention."
    ],
    experiences: [
      { role: 'Lead Data Analyst', company: 'Insight Analytics Partners', dates: '2022 - Present', description: '- Created automated Tableau executive dashboards that reduced manual reporting time by 70%.\n- Designed A/B tests on landing pages, contributing to a 12% conversion lift.' }
    ],
    projects: [
      { name: 'Customer Churn Prediction Model', link: 'github.com/analyst/churn-ml', description: '- Trained a random forest classifier to identify high-risk customer accounts.\n- Enabled account managers to proactively retain $400k in annual recurring revenue.' }
    ]
  },
  designer: {
    titles: ['UI/UX Designer', 'Product Designer', 'Senior Graphic Designer', 'Brand Specialist', 'Creative Director'],
    skills: [
      { category: 'Design Tools', items: 'Figma, Adobe Creative Suite (Illustrator, Photoshop), Sketch' },
      { category: 'Methods', items: 'Wireframing, Rapid Prototyping, User Research, Journey Mapping' }
    ],
    summaries: [
      "User-centric UI/UX designer with 5 years of experience prototyping web and mobile experiences. Skilled at translating user pain points into elegant visual solutions.",
      "Graphic Designer specializing in branding and corporate design. Focused on clean typography and consistent brand narratives across print and digital."
    ],
    experiences: [
      { role: 'Product Designer', company: 'DesignStudio Co.', dates: '2022 - Present', description: '- Redesigned checkout flow for a major e-commerce client, reducing cart abandonment by 18%.\n- Facilitated 15 user testing sessions to gather qualitative feedback.' }
    ],
    projects: [
      { name: 'Mobile Banking App Prototype', link: 'behance.net/designer/banking', description: '- Created a comprehensive Figma interactive prototype for a modern banking solution.\n- Conducted a usability audit that verified a 90% task success rate.' }
    ]
  },
  marketing: {
    titles: ['Digital Marketing Manager', 'SEO Specialist', 'Content Strategist', 'Social Media Manager', 'Growth Marketer'],
    skills: [
      { category: 'Marketing', items: 'Google Analytics, SEO, SEM, PPC, Email Campaigns, Copywriting' },
      { category: 'Tools', items: 'HubSpot, MailChimp, Semrush, Google Ads' }
    ],
    summaries: [
      "Data-driven Digital Marketer with 5+ years of experience managing paid acquisition and SEO campaigns. Proven track record of scaling search traffic and reducing customer acquisition cost (CAC).",
      "Creative Content Strategist who designs engaging multimedia campaigns that boost audience engagement and social conversions."
    ],
    experiences: [
      { role: 'SEO Manager', company: 'Acuity Media Agency', dates: '2021 - Present', description: '- Increased organic search traffic by 120% through targeted keyword optimization and link building.\n- Managed a $15k monthly budget for Google Search ads with a 3.5x ROAS.' }
    ],
    projects: [
      { name: 'B2B Lead Generation Re-Architecture', link: 'acuity.com/growth-case', description: '- Rebuilt email drip campaigns in HubSpot, achieving a 28% open rate and generating 500+ qualified leads.' }
    ]
  },
  sales: {
    titles: ['Account Executive', 'Business Development Representative', 'Sales Manager', 'Enterprise Account Director', 'Inside Sales Specialist'],
    skills: [
      { category: 'Sales', items: 'Lead Prospecting, Cold Calling, CRM (Salesforce), Negotiation, Relationship Building' },
      { category: 'Competencies', items: 'Pipeline Management, Contract Negotiation, Product Demos' }
    ],
    summaries: [
      "High-performing Account Executive with 4+ years of SaaS sales experience. Consistently exceeding monthly quotas by establishing strong client relationships and executing persuasive demos.",
      "Tenacious Business Development Representative skilled at generating sales-qualified pipelines through cold outreach and account mapping."
    ],
    experiences: [
      { role: 'SaaS Account Executive', company: 'CloudScale Technologies', dates: '2022 - Present', description: '- Exceeded annual sales quota by 125% in 2024, closing $850k in new ARR.\n- Managed a pipeline of 60+ active corporate opportunities inside Salesforce.' }
    ],
    projects: [
      { name: 'Outbound Playbook Development', link: 'sales-portfolio.me/playbook', description: '- Authored a standardized outbound script and email sequence utilized by a team of 8 BDRs.\n- Boosted overall connection rates by 30%.' }
    ]
  },
  finance: {
    titles: ['Financial Analyst', 'Senior Investment Analyst', 'Corporate Accountant', 'Risk Management Consultant', 'Treasury Specialist'],
    skills: [
      { category: 'Finance', items: 'Financial Modeling, Valuation, Forecasting, Auditing, GAAP' },
      { category: 'Tools', items: 'Excel (VBA), Bloomberg Terminal, QuickBooks, SAP Financials' }
    ],
    summaries: [
      "Detail-oriented Financial Analyst with 5 years of experience in corporate finance. Expert in developing forecasting models, analyzing variances, and advising leadership on budget constraints.",
      "Accurate Corporate Accountant with a background in tax compliance and month-end close operations. Skilled in preparing GAAP-compliant reports."
    ],
    experiences: [
      { role: 'Senior Finance Analyst', company: 'Vanguard Capital Partners', dates: '2021 - Present', description: '- Created predictive cash flow models that helped executive leadership optimize $5M in capital expenditures.\n- Reduced invoice reporting discrepancies by 92%.' }
    ],
    projects: [
      { name: 'Cost Center Optimization Project', link: 'vanguard.com/efficiency-report', description: '- Analyzed departmental spending habits to identify $150k in redundant vendor subscriptions.\n- Restructured license provisioning, leading to direct savings.' }
    ]
  },
  healthcare: {
    titles: ['Registered Nurse (RN)', 'Healthcare Administrator', 'Clinical Research Coordinator', 'Medical Lab Technician', 'Occupational Therapist'],
    skills: [
      { category: 'Clinical', items: 'Patient Care, Triage, EMR Systems (Epic), Medication Administration, CPR Certified' },
      { category: 'Regulatory', items: 'HIPAA Compliance, Joint Commission Standards, Patient Safety Protocols' }
    ],
    summaries: [
      "Compassionate Registered Nurse (RN) with 6 years of experience in high-volume emergency departments. Dedicated to providing excellent patient care and managing crisis situations with composure.",
      "Healthcare Administrator skilled in optimizing clinic workflows, scheduling, and billing operations. Expert in HIPAA compliance."
    ],
    experiences: [
      { role: 'Emergency Room Staff Nurse', company: 'Mercy Valley Hospital', dates: '2020 - Present', description: '- Administered care to 25+ critical patients daily in a busy level-2 trauma center.\n- Collaborated with 8 doctors and technicians to reduce patient wait times by 15%.' }
    ],
    projects: [
      { name: 'EMR Epic Migration Support', link: 'mercyvalley.org/epic', description: '- Served as super-user representing emergency nursing staff during the software transition.\n- Trained 45 nurses on patient logging screens.' }
    ]
  },
  hr: {
    titles: ['HR Specialist', 'Talent Acquisition Partner', 'HR Manager', 'Compensation & Benefits Analyst', 'Corporate Trainer'],
    skills: [
      { category: 'HR Operations', items: 'Employee Relations, Onboarding, Recruiting, Conflict Resolution, ATS Systems' },
      { category: 'Platforms', items: 'Workday, ADP, Greenhouse, Lever, LinkedIn Recruiter' }
    ],
    summaries: [
      "Dynamic Human Resources specialist with 5 years of experience in employee relations and talent acquisition. Passionate about building inclusive corporate cultures.",
      "Talent Acquisition Partner with a proven ability to source and close top-tier engineering talent in competitive tech sectors."
    ],
    experiences: [
      { role: 'Human Resources Specialist', company: 'Core Tech Solutions', dates: '2022 - Present', description: '- Redesigned employee onboarding program, boosting 90-day retention scores by 20%.\n- Investigated and resolved 15+ employee relations cases, minimizing corporate risk.' }
    ],
    projects: [
      { name: 'ATS Platform Evaluation & Switch', link: 'coretech.com/ats-case', description: '- Led transition from legacy spreadsheets to Greenhouse ATS.\n- Shortened the average time-to-hire from 45 to 30 days.' }
    ]
  },
  management: {
    titles: ['Product Manager', 'Operations Director', 'Scrum Master', 'Project Management Lead', 'Management Consultant'],
    skills: [
      { category: 'Methodologies', items: 'Scrum, Agile, Kanban, PRINCE2, Change Management' },
      { category: 'Competencies', items: 'Product Roadmap, Stakeholder Relations, Risk Mitigation, Backlog Grooming' }
    ],
    summaries: [
      "Technical Product Manager with 5+ years of experience launching mobile applications. Skilled in defining user stories, managing engineering sprints, and defining feature metrics.",
      "Agile Project Manager with a history of delivering enterprise software projects on time and under budget. Certified Scrum Master (CSM)."
    ],
    experiences: [
      { role: 'Technical Product Manager', company: 'Digital Waves Inc.', dates: '2021 - Present', description: '- Defined product strategy for mobile payment portal, generating $2.4M in transacted value.\n- Managed prioritizations for a dedicated team of 10 developers and QA engineers.' }
    ],
    projects: [
      { name: 'App Store Launch - Payment Portal', link: 'digitalwaves.com/wallet', description: '- Led product lifecycle from initial discovery and wireframes to App Store approval.\n- Reached #12 in Finance category during launch week.' }
    ]
  },
  executive: {
    titles: ['VP of Engineering', 'Chief Financial Officer (CFO)', 'Chief Operating Officer (COO)', 'Executive Director', 'Vice President of Sales'],
    skills: [
      { category: 'Leadership', items: 'Executive Strategy, Board Relations, M&A, Global P&L Management' },
      { category: 'Corporate Scale', items: 'Organizational Restructuring, Team Scaling, Strategic Partnership' }
    ],
    summaries: [
      "Visionary VP of Engineering with 12+ years of leadership experience scaling tech teams from 10 to 120+ engineers. Champion of agile execution and scalable cloud operations.",
      "Strategic Chief Operating Officer with a track record of scaling manufacturing operations and maximizing profit margins. Overseeing $40M+ annual P&L budgets."
    ],
    experiences: [
      { role: 'VP of Software Engineering', company: 'Enterprise Scale Systems', dates: '2020 - Present', description: '- Deployed neural-network recommendation engine, improving user click-through rate (CTR) by 28% and driving $1.4M in incremental revenue.\n- Engineered real-time feature store using Spark and Redis, reducing feature latency by 85%.' },
      { role: 'Director of Development', company: 'MidScale Enterprise Inc.', dates: '2015 - 2020', description: '- Scaled developer team from 15 to 45 members, delivering 5 enterprise releases.\n- Managed vendor contracts and negotiated key software licenses, saving 20%.' }
    ],
    projects: [
      { name: 'Global Infrastructure Modernization', link: 'enterprise-scale.com/infra', description: '- Spearheaded migration of entire product portfolio from on-premises to AWS cloud.\n- Project completed 3 months ahead of schedule and under budget.' }
    ]
  },
  'data-scientist': {
    titles: ['Senior Data Scientist', 'Lead Data Scientist', 'AI/ML Research Scientist', 'Staff Machine Learning Engineer', 'Data Science Consultant'],
    skills: [
      { category: 'Machine Learning', items: 'Deep Learning, PyTorch, TensorFlow, Scikit-learn, NLP, Computer Vision' },
      { category: 'Data Science Stack', items: 'Python (Pandas, NumPy), SQL, Spark, AWS SageMaker, Docker' }
    ],
    summaries: [
      "Innovative Data Scientist with 6+ years of experience building scalable ML solutions. Proven record of deployment and production modeling that drove a 15% increase in customer lifetime value.",
      "Results-oriented ML engineer specializing in predictive modeling and natural language processing. Skilled at turning complex analytical models into production-ready API services."
    ],
    experiences: [
      { role: 'Senior Data Scientist', company: 'Apex Insight Labs', dates: '2022 - Present', description: '- Deployed neural-network recommendation engine, improving user click-through rate (CTR) by 28% and driving $1.4M in incremental revenue.\n- Engineered real-time feature store using Spark and Redis, reducing feature latency by 85%.' }
    ],
    projects: [
      { name: 'LLM Agentic Customer Support Router', link: 'github.com/ds/llm-router', description: '- Created an automated ticket routing pipeline using llama-index and langchain.\n- Attained 94% accuracy in classification, saving 120 customer support hours weekly.' }
    ]
  },
  fullstack: {
    titles: ['Senior Full Stack Engineer', 'Lead Full Stack Developer', 'MERN Stack Developer', 'Staff Software Engineer', 'Full Stack Consultant'],
    skills: [
      { category: 'Frontend', items: 'React, Next.js, TypeScript, TailwindCSS, Redux Toolkit, Webpack' },
      { category: 'Backend & Database', items: 'Node.js, Express, PostgreSQL, MongoDB, Redis, GraphQL, AWS' }
    ],
    summaries: [
      "Versatile Full Stack Engineer with 7+ years of experience architecting high-performance SaaS applications. Expert in React, Node.js, and scaling relational databases.",
      "Detail-oriented developer passionate about responsive design, API security, and optimizing cloud-native deployments. Eager to solve complex software engineering challenges."
    ],
    experiences: [
      { role: 'Lead Full Stack Developer', company: 'SaaSify Platforms', dates: '2021 - Present', description: '- Led development of enterprise dashboard using Next.js and GraphQL, reducing initial page load time by 42%.\n- Refactored PostgreSQL query indexes and database schemas, resulting in a 30% speedup on slow-running reporting queries.' }
    ],
    projects: [
      { name: 'Collaborative Document Workspace', link: 'collab-docs.io', description: '- Engineered a real-time collaborative rich-text editor using WebSockets and CRDTs.\n- Handled 5,000+ concurrent active editing sessions with sub-50ms latency synchronization.' }
    ]
  },
  uiux: {
    titles: ['Senior UI/UX Designer', 'Lead Product Designer', 'User Experience Researcher', 'Interaction Designer', 'Visual Designer'],
    skills: [
      { category: 'Design Tools', items: 'Figma, Adobe XD, Sketch, Photoshop, Illustrator, After Effects' },
      { category: 'Methods & Research', items: 'Wireframing, High-Fidelity Prototyping, Usability Testing, User Journeys, Design Systems' }
    ],
    summaries: [
      "User-centric UI/UX designer with 6 years of experience crafting intuitive digital products. Dedicated to bridging user goals with company business metrics.",
      "Creative Product Designer specializing in building and scaling design systems. Proven ability to conduct generative user research and convert qualitative insights into high-impact visual layouts."
    ],
    experiences: [
      { role: 'Lead UI/UX Designer', company: 'Digital Horizon Studio', dates: '2022 - Present', description: '- Overhauled mobile application checkout flow, resulting in an 18.5% decrease in card abandonment rate.\n- Established a comprehensive cross-platform Figma design library, accelerating frontend development velocity by 35%.' }
    ],
    projects: [
      { name: 'Fintech Mobile App Ecosystem', link: 'behance.net/uiux/fintech', description: '- Crafted visual layouts, user flows, and wireframes for a new micro-investment app.\n- Usability tests verified a 92% task success rate for first-time account creations.' }
    ]
  },
  'product-manager': {
    titles: ['Senior Product Manager', 'Technical Product Manager', 'Lead Growth PM', 'Associate Product Manager', 'Product Owner'],
    skills: [
      { category: 'Product Strategy', items: 'Roadmapping, Market Research, User Personas, Agile/Scrum, OKR Formulation' },
      { category: 'Data & Growth', items: 'Amplitude, Mixpanel, SQL, A/B Testing, Jira, Confluence' }
    ],
    summaries: [
      "Strategic Product Manager with 5+ years of experience leading B2B SaaS features. Skilled at combining quantitative analysis and qualitative customer feedback.",
      "Technical PM with a background in software development. Expert at scoping complex API integrations and managing developer backlogs to ship high-impact features."
    ],
    experiences: [
      { role: 'Senior Product Manager', company: 'Nova Growth Corp', dates: '2021 - Present', description: '- Owned the monetization roadmap, successfully launching three premium tiers that boosted Monthly Recurring Revenue (MRR) by 22%.\n- Coordinated across Engineering, Marketing, and Sales to deliver a major v2 API release ahead of schedule.' }
    ],
    projects: [
      { name: 'SaaS Marketplace Launch', link: 'novagrowth.com/marketplace', description: '- Scoped, designed, and launched a developer integration marketplace.\n- Onboarded 45 third-party apps and generated $300k in new ecosystem transaction volume.' }
    ]
  },
  accountant: {
    titles: ['Senior Accountant', 'Certified Public Accountant (CPA)', 'Financial Accountant', 'Tax Consultant', 'Junior Auditor'],
    skills: [
      { category: 'Accounting Core', items: 'GAAP, IFRS, Tax Compliance, Accounts Payable/Receivable, Ledgers, Auditing' },
      { category: 'Software & Systems', items: 'QuickBooks, NetSuite, SAP Financials, Excel (Macros, VLOOKUP), Sage' }
    ],
    summaries: [
      "Meticulous Senior Accountant (CPA) with 6 years of corporate accounting experience. Expert in ledger accuracy, tax compliance, and managing month-end close schedules.",
      "Dedicated Public Accountant with a strong background in auditing, variance analysis, and internal controls implementation to prevent fraud."
    ],
    experiences: [
      { role: 'Senior Accountant', company: 'Alliance Tax Services', dates: '2020 - Present', description: '- Managed month-end and year-end close procedures for 15+ corporate clients, ensuring 100% GAAP compliance.\n- Automated reconciliation processes in NetSuite, saving 24 hours of manual data entry every month.' }
    ],
    projects: [
      { name: 'Internal Audit & Compliance Redesign', link: 'alliance.com/audit-case', description: '- Spearheaded internal risk audits that identified and fixed $80k in misclassified expense allocations.' }
    ]
  },
  'business-analyst': {
    titles: ['Senior Business Analyst', 'BI Analyst', 'Systems Analyst', 'Agile Business Analyst', 'Operations Analyst'],
    skills: [
      { category: 'Business Analysis', items: 'Requirements Gathering, Process Mapping, UML, BRD/FRD Drafting, Stakeholder Management' },
      { category: 'BI & Analytics', items: 'SQL, Tableau, Power BI, Excel (VBA), Python (Pandas), Jira' }
    ],
    summaries: [
      "Analytical Business Analyst with 5+ years of experience aligning IT capabilities with business goals. Expert at drafting business requirements and optimizing operational workflows.",
      "Results-oriented BI Analyst specialized in translating complex operational data into user-friendly Tableau reporting panels to guide executive decisions."
    ],
    experiences: [
      { role: 'Senior Business Analyst', company: 'Summit Solutions Inc', dates: '2022 - Present', description: '- Gathered technical requirements and drafted specifications for a core ERP migration, ensuring zero operational disruption.\n- Conducted workflow mapping exercises that eliminated 3 redundant reporting steps, boosting operational efficiency by 15%.' }
    ],
    projects: [
      { name: 'Executive Sales Dashboard Integration', link: 'summitsolutions.com/sales-bi', description: '- Designed interactive Power BI reporting dashboard connecting Salesforce and internal databases.\n- Enabled executive team to track key metrics (LTV, CAC, MRR) with live hourly updates.' }
    ]
  }
};

// Programmatic Generator to populate 210 unique examples (14 variants per category * 15 categories)
export const getResumeExamples = () => {
  const examples = [];
  let uniqueId = 1;

  CATEGORIES.forEach(cat => {
    const catData = DATA_BY_CATEGORY[cat.id];
    
    // Generate 14 variations for this category
    for (let variantIdx = 0; variantIdx < 14; variantIdx++) {
      const firstName = FIRST_NAMES[(variantIdx * 7) % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(variantIdx * 11) % LAST_NAMES.length];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const phone = `+1 (555) ${100 + variantIdx * 12}-${2000 + variantIdx * 3}`;
      const location = LOCATIONS[(variantIdx * 3) % LOCATIONS.length];
      
      const title = catData.titles[variantIdx % catData.titles.length] + ` (V-${variantIdx + 1})`;
      const summary = catData.summaries[variantIdx % catData.summaries.length];
      
      // Adapt experiences
      const experienceList = catData.experiences.map((exp, expIdx) => {
        const companyName = `${exp.company} ${variantIdx + 1}`;
        const finalRole = exp.role;
        return {
          id: uniqueId * 100 + expIdx,
          role: finalRole,
          company: companyName,
          dates: exp.dates,
          location: location,
          description: exp.description
        };
      });

      // Adapt projects
      const projectList = catData.projects.map((proj, projIdx) => {
        return {
          id: uniqueId * 1000 + projIdx,
          name: `${proj.name} - Version ${variantIdx + 1}`,
          link: proj.link,
          description: proj.description
        };
      });

      // Certifications
      const certificationList = [
        { id: uniqueId * 10 + 1, name: `Certified ${cat.label} Specialist`, year: `${2022 + (variantIdx % 4)}` }
      ];

      // Languages
      const languageList = 'English (Fluent)' + (variantIdx % 2 === 0 ? ', Spanish (Conversational)' : ', French (Basic)');

      // Structured data object
      const dataObj = {
        personal: {
          name,
          email,
          phone,
          location,
          website: `portfolio-${firstName.toLowerCase()}.me`,
          linkedin: `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
        },
        summary,
        experience: experienceList,
        education: [
          {
            id: uniqueId * 50 + 1,
            degree: variantIdx % 2 === 0 ? 'Bachelor of Science' : 'Bachelor of Arts',
            school: `State University of ${location.split(',')[0]}`,
            dates: '2016 - 2020',
            honors: 'GPA: 3.8/4.0, Magna Cum Laude'
          }
        ],
        skills: catData.skills.map((s, sIdx) => ({ id: uniqueId * 30 + sIdx, category: s.category, items: s.items })),
        projects: projectList,
        certifications: certificationList,
        awards: [
          {
            id: uniqueId * 600 + 1,
            title: `Outstanding Performance Award`,
            issuer: `${firstName}'s Excellence Society`,
            year: `${2023 + (variantIdx % 2)}`
          }
        ],
        customSections: [
          {
            id: uniqueId * 500,
            title: 'LANGUAGES',
            fields: [
              { id: uniqueId * 500 + 1, label: 'Languages', value: languageList }
            ]
          }
        ]
      };

      // Formulate serialized text
      let textContent = `${name}\n${email} | ${phone} | ${location}\n\n`;
      textContent += `PROFESSIONAL SUMMARY\n${summary}\n\n`;
      
      textContent += `WORK EXPERIENCE\n`;
      experienceList.forEach(e => {
        textContent += `${e.role} at ${e.company} | ${e.dates}\n${e.location}\n${e.description}\n\n`;
      });
      
      textContent += `EDUCATION\n`;
      dataObj.education.forEach(edu => {
        textContent += `${edu.degree} from ${edu.school} | ${edu.dates}\n${edu.honors}\n\n`;
      });

      textContent += `SKILLS\n`;
      dataObj.skills.forEach(s => {
        textContent += `${s.category}: ${s.items}\n`;
      });
      textContent += `\n`;

      textContent += `PROJECTS\n`;
      projectList.forEach(p => {
        textContent += `${p.name}\n${p.description}\n\n`;
      });

      textContent += `CERTIFICATIONS\n`;
      certificationList.forEach(c => {
        textContent += `- ${c.name} (${c.year})\n`;
      });
      
      textContent += `\nAWARDS\n`;
      textContent += `- Outstanding Performance Award | ${firstName}'s Excellence Society | ${2023 + (variantIdx % 2)}\n`;
      
      textContent += `\nLANGUAGES\n- ${languageList}\n`;

      examples.push({
        id: `example-${uniqueId++}`,
        title: title.replace(/ \(V-\d+\)/, ''),
        category: cat.id,
        experienceLevel: variantIdx % 3 === 0 ? 'Entry' : (variantIdx % 3 === 1 ? 'Mid' : 'Senior'),
        summary: summary,
        skills: catData.skills.map(s => s.items).join(', ').split(', ').slice(0, 8),
        data: dataObj,
        textContent: textContent.trim(),
        bestPractices: [
          `Format utilizing strict standard headings (e.g. WORK EXPERIENCE) for optimum ATS scoring.`,
          `Quantify every bullet point with specific business outcomes and financial indicators.`,
          `Ensure keywords from target job descriptions are placed exactly in your core skills list.`
        ]
      });
    }
  });

  return examples;
};

export { CATEGORIES };
