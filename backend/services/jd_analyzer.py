import re
from collections import defaultdict


GENERIC_TERMS = {
    'and', 'or', 'the', 'is', 'in', 'to', 'with', 'for', 'a', 'of', 'on', 'as',
    'by', 'an', 'at', 'this', 'that', 'are', 'be', 'will', 'have', 'from', 'it', 'can',

    'experience', 'work', 'team', 'role', 'position', 'company', 'business',
    'industry', 'field', 'background', 'knowledge', 'ability', 'skill',
    'qualification', 'requirement', 'responsibility', 'duty', 'year',
    'degree', 'education', 'candidate', 'applicant', 'looking', 'seeking',
    'candidates', 'applicants', 'people', 'everyone', 'anyone', 'someone',
    'member', 'staff', 'employee',

    'junior', 'senior', 'lead', 'principal', 'staff', 'distinguished',
    'entry-level', 'entry level', 'mid-level', 'mid level',

    'manager', 'managers', 'director', 'directors', 'head', 'heads',
    'executive', 'executives', 'c-level', 'c suite', 'c-suite',
    'vp', 'vice president', 'cto', 'cio', 'cfo', 'ceo', 'chief',

    'working', 'worked', 'works', 'needed', 'required',
    'preferred', 'plus', 'bonus', 'offer', 'offering',

    'location', 'remote', 'office', 'home', 'travel', 'relocation',
    'salary', 'compensation', 'benefits', 'package', 'insurance',

    'opportunity', 'environment', 'culture', 'growth', 'development',
    'career', 'advancement', 'stability', 'security', 'future',

    'time', 'part', 'full', 'contract', 'permanent', 'temporary',
    'intern', 'internship', 'contractor', 'freelance', 'consultant',

    'application', 'applications', 'app', 'apps', 'software',
    'process', 'system', 'systems', 'solution', 'solutions',
    'service', 'services', 'platform', 'platforms', 'product', 'products',
    'project', 'projects', 'program', 'programs',
    'feature', 'features', 'component', 'components',
    'module', 'modules', 'element', 'elements', 'function', 'functions',

    'client', 'clients', 'customer', 'customers', 'user', 'users',

    'test', 'testing', 'tester', 'tests', 'tested', 'quality', 'assurance', 'qa',

    'support', 'supporting', 'supported', 'supports', 'help', 'assist', 'assistance',

    'document', 'documentation', 'report', 'reporting', 'reports', 'reported',

    'communicate', 'communication', 'communicating', 'present', 'presentation',

    'improve', 'improvement', 'enhance', 'enhancement',
    'increase', 'decrease', 'reduce', 'optimize', 'optimization',
    'analyze', 'analysis', 'plan', 'planning', 'design', 'designing',
    'architect', 'architecture', 'implement', 'implementation',
    'deploy', 'deployment', 'maintain', 'maintenance', 'maintaining',
    'operate', 'operation', 'operational', 'run', 'running',
    'manage', 'management', 'managing', 'managed', 'administrator', 'administration',
    'coordinate', 'coordination', 'collaborate', 'collaboration', 'collaborating',
    'partner', 'partnership', 'create', 'creating', 'creation',
    'build', 'building', 'built', 'make', 'making', 'made',
    'develop', 'developing', 'development', 'developed', 'develops',
    'code', 'coding', 'coded', 'program', 'programming', 'programs',

     'pipelines', 'pipeline', 'ability', 'building', 'built', 'makes',
     'use', 'using', 'used',
     'role', 'roles', 'responsibilities', 'duties',
     'qualifications', 'skills', 'expertise', 'proficiency', 'proficient',
     'familiar', 'familiarity', 'understanding',
     'strong', 'excellent', 'outstanding', 'exceptional', 'superior',
     'solid', 'good', 'great', 'nice',
     'must', 'should', 'could', 'would', 'may', 'might', 'require', 'required',
     'included', 'include', 'includes', 'including', 'ensure', 'ensuring',
     'responsible', 'task', 'tasks', 'function', 'functions', 'functionality',
     'aspect', 'aspects', 'area', 'areas', 'field', 'fields', 'domain', 'domains',
     'sector', 'sectors', 'vertical', 'verticals',
     'developer', 'developers', 'engineer', 'engineering', 'engineers',
     'programmer', 'programmers', 'coder', 'coders',
      'requirements', 'requirement',
      'libraries', 'library',
      'practices', 'practice',
      'web',
      'vitals', 'vital',
     'previous', 'prior', 'past', 'former', 'existing', 'current',
     'candidate', 'candidates', 'applicant', 'applicants',
      'person', 'personnel', 'human', 'individual',

    'scale', 'scalable', 'scalability', 'reliable', 'reliability', 'robust',
    'robustness', 'efficient', 'efficiency', 'effective', 'effectiveness',
    'high', 'low', 'fast', 'quick', 'rapid', 'slow',
    'available', 'availability', 'accessible', 'responsive',
    'modern', 'latest', 'current', 'contemporary',
    'cutting edge', 'state of the art', 'world class', 'best', 'optimal',
    'ideally', 'preferably', 'typically', 'usually', 'generally', 'commonly',
    'standard', 'standards', 'practice', 'best practice', 'industry standard',

    'meet', 'meeting', 'participate', 'participation', 'attend', 'attendance',
    'travel', 'travel required', 'relocation', 'relocate', 'moving', 'move',
    'based', 'located', 'opening', 'job', 'jobs', 'vacancy', 'opportunities',
    'slot', 'spots', 'apply', 'applying', 'applied', 'submission', 'submit',
    'resume', 'cv', 'curriculum vitae', 'cover letter', 'portfolio',
    'reference', 'references', 'sample', 'samples', 'example', 'examples',
    'interview', 'interviews', 'screening', 'phone screen', 'onsite',
    'negotiation', 'negotiable', 'schedule', 'scheduling', 'hour', 'hours',
    'day', 'days', 'week', 'weeks', 'month', 'months',
    'shift', 'shifts', 'rotating',

    'title', 'titles', 'designation', 'designations', 'level',
    'l', 'xl', 'xxl', 'size', 'sizes',
    'department', 'departments', 'division', 'divisions', 'unit', 'units',
    'business unit', 'section', 'sections', 'region', 'regions',
    'site', 'sites', 'offices', 'flexibility',
    'hourly', 'annual', 'monthly', 'weekly', 'daily', 'rate',
    'bonus', 'bonuses', 'incentive', 'incentives', 'commission',
    'equity', 'stock', 'options', 'rsu', 'rsus', 'grant', 'grants',
    'perk', 'perks', 'advantage', 'advantages',
    'pto', 'vacation', 'holiday', 'sick', 'leave', 'leaves',
    'educational', 'educate', 'educated', 'diploma',
    'bootcamp', 'boot camp', 'course', 'courses', 'class', 'classes',
    'school', 'schools', 'university', 'universities', 'college', 'colleges',
    'institute', 'institutes', 'academy', 'academies', 'alma mater',
    'graduate', 'graduated', 'graduation', 'alumni', 'alumnus',
    'fresh', 'fresh graduate', 'fresher',

    'startup', 'start-up', 'start up', 'enterprise', 'enterprises',
    'corporate', 'corporation', 'inc', 'fortune', 'fortune 500', 'unicorn',

    'fast', 'paced', 'dynamic', 'innovative', 'creative',
    'cutting', 'edge', 'bleeding', 'state', 'world', 'class',
    'top', 'tier', 'best', 'prestigious', 'reputable', 'well', 'known',
    'market', 'leader', 'global', 'worldwide', 'international',
    'multinational', 'nationwide', 'fast', 'growing', 'rapidly', 'expanding',

    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'morning', 'afternoon', 'evening', 'night', 'overnight', 'weekend', 'weekends',

    'tech', 'technology',

     'meet', 'meeting', 'share', 'sharing', 'provide', 'provided', 'providing',
     'need', 'needs', 'needed', 'want', 'wants', 'wanted',
     'expect', 'expectations', 'expects', 'expected',

     'healthcare', 'health care', 'fintech', 'finance', 'banking', 'retail',
     'ecommerce', 'e-commerce', 'manufacturing', 'logistics', 'transportation',
     'education', 'government', 'nonprofit', 'non-profit', 'media', 'entertainment',
     'gaming', 'sports', 'travel', 'hospitality', 'real estate',
     'telecom', 'telecommunications', 'insurance', 'legal', 'legal services',

     'performance', 'perform', 'performed', 'performing',
     'methodologies', 'methodology',
     'expert-level', 'expert level', 'expert',
     'client-facing', 'client facing', 'customer-facing', 'customer facing',
     'independently', 'independent', 'autonomous', 'self-directed', 'self directed',
     'self-sufficient', 'self sufficient', 'self-motivated', 'self motivated',
     'proven', 'proven ability', 'ability', 'capability', 'capabilities',
}


ACTION_VERBS = {
    'develop', 'design', 'lead', 'manage', 'create', 'build', 'implement',
    'deploy', 'maintain', 'operate', 'architect', 'code', 'program',
    'test', 'debug', 'fix', 'solve', 'resolve', 'optimize', 'improve',
    'enhance', 'analyze', 'research', 'evaluate', 'assess', 'review',
    'document', 'write', 'report', 'present', 'communicate', 'collaborate',
    'coordinate', 'mentor', 'train', 'guide', 'support', 'assist',
    'configure', 'setup', 'install', 'integrate', 'migrate', 'upgrade',
    'automate', 'script', 'administer', 'oversee', 'direct',
    'plan', 'strategize', 'forecast', 'budget', 'allocate', 'prioritize',
    'organize', 'streamline', 'standardize', 'audit', 'verify',
    'validate', 'approve', 'authorize', 'launch', 'release', 'ship',
    'troubleshoot', 'diagnose', 'monitor', 'track', 'measure',
    'facilitate', 'negotiate', 'inform', 'advise', 'recommend',
    'define', 'establish', 'found', 'initiate', 'pioneer',
    'transform', 'convert', 'adapt', 'modify', 'refactor',
    'extract', 'load', 'transform', 'clean', 'visualize',
    'model', 'train', 'tune', 'validate', 'defer',
}

SOFT_SKILLS = {
    'leadership', 'management', 'communication', 'teamwork', 'collaboration',
    'problem solving', 'analytical thinking', 'critical thinking', 'creativity',
    'innovation', 'adaptability', 'flexibility', 'time management',
    'organization', 'planning', 'prioritization', 'multi-tasking',
    'attention to detail', 'diligence', 'thoroughness', 'reliability',
    'dependability', 'accountability', 'responsibility', 'initiative',
    'self-motivated', 'proactive', 'interpersonal skills', 'negotiation',
    'conflict resolution', 'mediation', 'facilitation', 'public speaking',
    'presentation', 'writing', 'storytelling', 'empathy', 'patience',
    'humor', 'mentoring', 'coaching', 'training', 'customer service',
    'client relations', 'vendor management', 'stakeholder management',
    'decision making', 'strategic thinking', 'visionary', 'entrepreneurial',
    'resilience', 'stress management', 'work ethic', 'professionalism',
    'team player', 'collaboration', 'cross-functional', 'cross functional',
    'client facing', 'client-facing', 'customer facing', 'customer-facing',
    'work independently', 'independent work', 'self sufficient', 'self-sufficient',
    'self-directed', 'self directed', 'autonomous',
}


TECH_PATTERNS = {
    'programming_languages': {
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c',
        'ruby', 'go', 'golang', 'rust', 'php', 'swift', 'kotlin', 'scala',
        'perl', 'r', 'rstudio', 'matlab', 'sas', 'stata', 'spss',
        'sql', 'html', 'css', 'xml', 'json', 'yaml', 'shell', 'bash',
        'powershell', 'zsh', 'fish', 'cmd', 'vba',
        'haskell', 'clojure', 'elixir', 'f#', 'dart', 'lua',
        'objective-c', 'groovy', 'assembly',
    },

    'web_frontend': {
        'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby',
        'ember', 'backbone', 'jquery', 'bootstrap', 'tailwind', 'bulma',
        'foundation', 'material-ui', 'ant design', 'chakra ui',
        'redux', 'mobx', 'zustand', 'recoil', 'graphql', 'rest', 'apis',
        'axios', 'fetch', 'webpack', 'babel', 'vite', 'parcel', 'rollup',
        'esbuild', 'dom', 'html5', 'css3', 'sass', 'scss', 'less', 'stylus',
        'pwa', 'spa', 'ssr', 'responsive design', 'mobile-first', 'accessibility',
        'wcag', 'aria', 'seo', 'semantic html', 'web components',
    },

    'web_backend': {
        'node.js', 'express', 'fastify', 'koa', 'django', 'flask', 'fastapi',
        'spring', 'spring boot', 'rails', 'laravel', 'asp.net', 'dotnet',
        'fiber', 'gin', 'echo', 'phoenix', 'play', 'strut', 'hibernate',
        'jersey', 'restify', 'socket.io', 'apollo', 'relay', 'microservices',
        'soa', 'restful api', 'soap', 'grpc', 'websocket',
        'oauth', 'jwt', 'saml', 'openid connect', 'api gateway', 'rate limiting',
        'caching', 'session management', 'cors', 'csrf',
    },

    'databases': {
        'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'mongo',
        'redis', 'cassandra', 'elasticsearch', 'solr', 'neo4j', 'dgraph',
        'dynamodb', 'cosmos db', 'firestore', 'couchbase', 'couchdb',
        'mariadb', 'oracle', 'sql server', 'ms sql', 'db2', 'teradata',
        'hive', 'hbase', 'impala', 'presto', 'trino', 'redshift',
        'bigquery', 'snowflake', 'databricks', 'clickhouse', 'timescaledb',
        'influxdb', 'prometheus',
        'orm', 'sequelize', 'typeorm', 'mongoose', 'prisma', 'eloquent',
        'hibernate', 'sqlalchemy', 'database', 'db', 'etl',
        'data warehouse', 'data lake',
    },

    'cloud_platforms': {
        'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp',
        'google cloud', 'google cloud platform', 'ibm cloud', 'oracle cloud',
        'alibaba cloud', 'digitalocean', 'linode', 'vultr', 'heroku',
        'netlify', 'vercel', 'firebase', 'supabase', 'cloudflare',
        'openstack', 'kubernetes', 'k8s', 'docker', 'container', 'podman',
        'vmware', 'virtualization', 'hypervisor', 'bare metal',
        'serverless', 'function as a service', 'faas',
    },

    'devops_tools': {
        'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci',
        'bamboo', 'teamcity', 'azure devops', 'bitbucket pipelines',
        'terraform', 'ansible', 'puppet', 'chef', 'saltstack', 'vagrant',
        'packer', 'consul', 'vault', 'nomad', 'prometheus', 'grafana',
        'elk stack', 'elastic stack', 'logging', 'monitoring', 'alerting',
        'cicd', 'continuous integration', 'continuous delivery',
        'continuous deployment',
        'artifactory', 'nexus', 'sonarqube', 'sentry', 'new relic',
        'datadog', 'splunk', 'logstash', 'kibana', 'filebeat', 'metricbeat',
        'jaeger', 'opentelemetry', 'distributed tracing', 'apm',
        'infrastructure as code', 'iac',
        'git', 'github', 'gitlab', 'bitbucket', 'sourceforge',
        'jira', 'confluence', 'trello', 'asana', 'monday.com', 'clickup',
        'notion', 'basecamp',
    },

    'data_science': {
        'machine learning', 'deep learning', 'neural network',
        'artificial intelligence', 'ai',
        'natural language processing', 'nlp', 'computer vision', 'cv',
        'reinforcement learning', 'supervised learning', 'unsupervised learning',
        'regression', 'classification', 'clustering', 'dimensionality reduction',
        'feature engineering', 'feature selection', 'model training',
        'model evaluation', 'hyperparameter tuning', 'cross validation',
        'a/b testing', 'statistics', 'statistical analysis', 'probability',
        'bayesian', 'frequentist', 'data mining', 'data analysis', 'analytics',
        'tableau', 'power bi', 'looker', 'mode', 'metabase', 'superset',
        'dashboards', 'visualization', 'reporting', 'kpi', 'metrics',
        'pandas', 'numpy', 'scipy', 'scikit-learn', 'sklearn', 'tensorflow',
        'keras', 'pytorch', 'torch', 'mxnet', 'xgboost', 'lightgbm',
        'matplotlib', 'seaborn', 'plotly', 'dash', 'streamlit', 'jupyter',
        'notebook', 'rstudio', 'spss', 'sas', 'stata', 'weka', 'rapidminer',
    },

    'mobile': {
        'ios', 'android', 'swift', 'kotlin', 'java', 'objective-c',
        'react native', 'flutter', 'xamarin', 'ionic', 'cordova', 'phonegap',
        'native', 'hybrid', 'mobile app', 'mobile development',
        'pwa', 'progressive web app',
    },

    'testing': {
        'unit testing', 'integration testing', 'e2e testing', 'end-to-end testing',
        'acceptance testing', 'regression testing', 'smoke testing', 'sanity testing',
        'load testing', 'stress testing', 'performance testing', 'security testing',
        'usability testing', 'compatibility testing', 'cross browser testing',
        'test driven development', 'tdd', 'behavior driven development', 'bdd',
        'atdd', 'acceptance test driven development', 'mocking', 'stubbing',
        'test coverage', 'code coverage',
        'selenium', 'cypress', 'playwright', 'puppeteer', 'jest', 'mocha',
        'chai', 'jasmine', 'karma', 'protractor', 'webdriverio', 'nightwatch',
        'testcafe', 'qtest', 'testrail', 'zalenium', 'appium', 'detox',
        'espresso', 'xcui', 'uiautomator',
    },

    'security': {
        'cybersecurity', 'information security', 'infosec', 'network security',
        'application security', 'appsec', 'penetration testing', 'pentest',
        'vulnerability assessment', 'vulnerability scanning', 'security audit',
        'security compliance', 'gdpr', 'hipaa', 'pci', 'pci dss', 'soc2',
        'iso 27001', 'nist', 'owasp', 'sans',
        'firewall', 'ids', 'ips', 'siem', 'intrusion detection',
        'intrusion prevention', 'waf',
        'encryption', 'decryption', 'certificate', 'pki', 'identity',
        'authentication', 'authorization', 'oauth', 'jwt', 'saml', 'ldap',
        'multi-factor authentication', 'mfa', 'two-factor', '2fa', 'sso',
        'single sign-on', 'access control', 'rbac', 'abac',
        'hashing', 'salting', 'vpn',
    },

    'networking': {
        'tcp/ip', 'tcp ip', 'udp', 'http', 'https', 'ssl', 'tls', 'dns', 'dhcp',
        'ftp', 'sftp', 'ssh', 'telnet', 'snmp', 'icmp', 'arp', 'routing',
        'switching', 'vlan', 'nat', 'pat',
        'load balancer', 'load balancing', 'reverse proxy', 'cdn',
        'content delivery network', 'edge computing',
        'latency', 'bandwidth', 'throughput', 'jitter', 'packet',
        'osi model', 'tcp handshake', 'three-way handshake', 'keepalive',
        'websocket', 'sse', 'server-sent events',
        'endpoint', 'query param', 'path param', 'rate limiting', 'throttling',
    },

    'operating_systems': {
        'linux', 'windows', 'macos', 'unix', 'bsd', 'ubuntu', 'debian',
        'fedora', 'centos', 'rhel', 'suse', 'opensuse', 'arch', 'gentoo',
        'alpine', 'amazon linux', 'red hat', 'oracle linux',
        'windows server', 'mac os', 'ios',
        'chrome os', 'chromeos', 'embedded', 'firmware',
        'rtos', 'real-time operating system', 'kernel', 'shell',
    },
}

ALL_TECH_TERMS = set()
for terms in TECH_PATTERNS.values():
    ALL_TECH_TERMS.update(terms)


MULTI_WORD_PATTERNS = [
    (r'\b(machine learning|deep learning|neural network|artificial intelligence|ai)\b', 'ai_ml'),
    (r'\b(natural language processing|nlp)\b', 'ai_ml'),
    (r'\b(computer vision|cv)\b', 'ai_ml'),
    (r'\b(data science|data engineering|data analytics)\b', 'data'),
    (r'\b(business intelligence|bi)\b', 'data'),
    (r'\b(full stack|frontend|front-end|back end|backend|full-stack)\b', 'web_dev'),
    (r'\b(web development|software development|application development)\b', 'dev'),
    (r'\b(state management)\b', 'web_dev'),
    (r'\b(component library|component libraries)\b', 'web_dev'),
    (r'\b(build tools)\b', 'dev'),
    (r'\b(react native)\b', 'web_dev'),
    (r'\b(unit testing|integration testing|e2e testing|end-to-end testing)\b', 'testing'),
    (r'\b(test driven development|tdd|behavior driven development|bdd)\b', 'testing'),
    (r'\b(continuous integration|continuous delivery|continuous deployment|cicd)\b', 'devops'),
    (r'\b(version control|source control|code review|pair programming)\b', 'dev'),
    (r'\b(software architecture|system design|software design)\b', 'arch'),
    (r'\b(api development|rest api|graphql api|soap api|restful api)\b', 'web_dev'),
    (r'\b(database design|data modeling|schema design)\b', 'database'),
    (r'\b(sql injection|xss|cross site scripting|csrf)\b', 'security'),
    (r'\b(client facing|client-facing|customer facing|customer-facing)\b', 'soft'),
    (r'\b(work independently|independent work|self sufficient)\b', 'soft'),
    (r'\b(cross functional|cross-functional|cross functional team)\b', 'soft'),

    (r'\b(cloud computing|cloud infrastructure|cloud platform)\b', 'cloud'),
    (r'\b(container orchestration|containerization)\b', 'devops'),
    (r'\b(infrastructure as code|iac)\b', 'devops'),
    (r'\b(serverless|function as a service|faas)\b', 'cloud'),
    (r'\b(platform as a service|paas)\b', 'cloud'),
    (r'\b(devsecops|gitops)\b', 'devops'),

    (r'\b(data warehouse|data lake|data pipeline|etl pipeline)\b', 'data'),
    (r'\b(data visualization|visualization)\b', 'data'),
    (r'\b(statistical analysis|hypothesis testing|a/b testing)\b', 'data'),
    (r'\b(predictive modeling|predictive analytics)\b', 'ai_ml'),

    (r'\b(project management|program management|portfolio management)\b', 'pm'),
    (r'\b(product management|product owner|product manager)\b', 'pm'),
    (r'\b(agile methodology|agile framework|scrum framework|scrum master)\b', 'pm'),
    (r'\b(kanban board|sprint planning|daily standup|sprint retrospective)\b', 'pm'),
    (r'\b(stakeholder management|client management|customer success)\b', 'soft'),
    (r'\b(team leadership|people management|engineering manager)\b', 'soft'),
    (r'\b(technical leadership|tech lead|lead developer)\b', 'soft'),

    (r'\b(digital transformation)\b', 'business'),
    (r'\b(go to market|go-to-market|gtm strategy)\b', 'business'),
    (r'\b(competitive analysis|market research|user research)\b', 'business'),
    (r'\b(requirements gathering|user stories|acceptance criteria)\b', 'pm'),
    (r'\b(definition of done|dod)\b', 'pm'),

    (r'\b(application security|appsec|devsecops)\b', 'security'),
    (r'\b(penetration testing|pen test|security audit|vulnerability assessment)\b', 'security'),
    (r'\b(security compliance|gdpr|hipaa|pci dss|soc2|iso 27001)\b', 'security'),
    (r'\b(identity and access management|iam)\b', 'security'),
    (r'\b(multi-factor authentication|mfa)\b', 'security'),
    (r'\b(single sign-on|sso)\b', 'security'),

    (r'\b(load balancing|high availability|fault tolerance|disaster recovery)\b', 'infra'),
    (r'\b(content delivery network|cdn)\b', 'infra'),
    (r'\b(operating system|system administration|sysadmin)\b', 'infra'),

    (r'\b(problem solving|analytical skills|critical thinking)\b', 'soft'),
    (r'\b(team player|teamwork|collaboration skills)\b', 'soft'),
    (r'\b(communication skills|written communication|verbal communication)\b', 'soft'),
    (r'\b(interpersonal skills|conflict resolution|negotiation)\b', 'soft'),
    (r'\b(time management|prioritization|organization skills)\b', 'soft'),
    (r'\b(attention to detail|detail oriented)\b', 'soft'),
    (r'\b(self[- ]?motivated|self motivated)\b', 'soft'),
    (r'\b(customer service|client relations)\b', 'soft'),
    (r'\b(decision making)\b', 'soft'),
    (r'\b(strategic thinking)\b', 'soft'),
    (r'\b(stress management)\b', 'soft'),
    (r'\b(work ethic)\b', 'soft'),
]

CATEGORY_WEIGHTS = {
    'ai_ml': 10,
    'security': 9,
    'devops': 9,
    'cloud': 8,
    'testing': 8,
    'database': 7,
    'web_dev': 7,
    'arch': 8,
    'data': 8,
    'pm': 7,
    'infra': 7,
    'soft': 5,
    'action_verbs': 4,
    'business': 6,
    'networking': 6,
    'programming_languages': 9,
    'generic': 0
}

CATEGORY_ALIAS = {
    'programming_languages': 'programming_languages',
    'web_frontend': 'web_dev',
    'web_backend': 'web_dev',
    'databases': 'database',
    'cloud_platforms': 'cloud',
    'devops_tools': 'devops',
    'data_science': 'data',
    'project_management': 'pm',
    'business_terms': 'business',
    'operating_systems': 'infra',
    'networking': 'networking',
    'testing': 'testing',
    'security': 'security',
    'mobile': 'mobile',
}


def extract_multi_word_phrases(text):
    """Extract multi-word technical terms and phrases."""
    phrases = []
    text_lower = text.lower()
    
    for pattern, category in MULTI_WORD_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                for m in match:
                    if m and m.strip():
                        phrases.append((m.strip(), category))
                        break
            else:
                phrases.append((match.strip(), category))
    
    return phrases


def extract_single_words(text):
    """Extract single technical terms and action verbs."""
    words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.-]*\b', text.lower())
    
    categorized = []
    for word in words:
        if len(word) < 3:
            continue
        
        if word in ALL_TECH_TERMS:
            raw_category = next(
                (cat for cat, terms in TECH_PATTERNS.items() if word in terms),
                'generic'
            )
            category = CATEGORY_ALIAS.get(raw_category, raw_category)
            categorized.append((word, category))
        elif word in ACTION_VERBS:
            categorized.append((word, 'action_verbs'))
        elif word in SOFT_SKILLS:
            categorized.append((word, 'soft'))
        else:
            categorized.append((word, 'generic'))
    
    return categorized


def score_keyword(word, category, freq, total_words, is_phrase=False):
    """
    Score a keyword based on category weight, frequency, and term features.
    
    Higher scores = more relevant for resume modification
    """
    base_score = CATEGORY_WEIGHTS.get(category, 1)
    
    if is_phrase:
        phrase_bonus = 15 + (len(word.split()) * 4)
    else:
        phrase_bonus = 1
    
    freq_factor = min(freq * 2, 10)
    
    if not is_phrase:
        word_length = len(word)
        length_bonus = max(1, min(word_length * 0.4, 4))
    else:
        length_bonus = 0
    
    is_rare = freq == 1
    rare_boost = 5 if is_rare and category in (
        'ai_ml', 'security', 'devops', 'cloud',
        'programming_languages', 'web_dev', 'database'
    ) else 0
    
    if category == 'generic' or word in GENERIC_TERMS:
        base_score *= 0.03
    
    total = (base_score * phrase_bonus) + freq_factor + length_bonus + rare_boost
    
    return total



def analyze_jd(text):
    """
    Analyze job description text and extract relevant keywords for resume modification.

    Supports:
    - Bullet point lists (- item, * item, • item)
    - Paragraphs of mixed text
    - Section headers (Requirements, Qualifications, etc.)
    - Mixed formatting

    Args:
        text (str): Job description text

    Returns:
        list: Prioritized list of 20-25 most relevant keywords for resume modification,
              sorted by relevance (most important first)
    """
    if not text or not text.strip():
        return []
    
    text = re.sub(r'\n+', '\n', text)  # Collapse multiple newlines
    text = re.sub(r'\s+', ' ', text)    # Collapse whitespace
    
    phrases = extract_multi_word_phrases(text)
    
    single_words = extract_single_words(text)
    
    freq_dict = defaultdict(int)
    phrase_freq = defaultdict(int)
    category_map = {}
    is_phrase_map = {}
    
    for word, category in phrases:
        if len(word.split()) == 1 and word in GENERIC_TERMS:
            continue
        phrase_freq[word] += 1
        category_map[word] = category
        is_phrase_map[word] = True
    
    for word, category in single_words:
        if word in phrase_freq:
            continue
        freq_dict[word] += 1
        category_map[word] = category
        is_phrase_map[word] = False
    
    combined_freq = defaultdict(int)
    for d in [freq_dict, phrase_freq]:
        for k, v in d.items():
            combined_freq[k] += v
    
    if not combined_freq:
        return []
    
    all_keywords = list(combined_freq.keys())
    scored_keywords = []
    total_words = len(all_keywords)
    
    for word in all_keywords:
        category = category_map.get(word, 'generic')
        freq = combined_freq[word]
        is_phrase = is_phrase_map.get(word, False)
        score = score_keyword(word, category, freq, total_words, is_phrase)
        scored_keywords.append((word, score, category, freq, is_phrase))
    
    scored_keywords.sort(key=lambda x: (-x[1], -x[4], -x[3], x[0]))
    
    final_keywords = []
    seen = set()  # Track normalized versions to avoid near-duplicates
    
    max_per_category = {
        'ai_ml': 4,
        'security': 3,
        'devops': 4,
        'cloud': 4,
        'testing': 3,
        'database': 4,
        'web_dev': 4,
        'programming_languages': 6,
        'data': 3,
        'pm': 2,
        'soft': 5,
        'action_verbs': 2,
        'business': 2,
        'infra': 2,
        'networking': 1,
        'arch': 2,
    }
    
    category_counts = defaultdict(int)
    
    for word, score, category, freq, is_phrase in scored_keywords:
        norm_kw = word.lower().strip()

        if category == 'generic':
            continue

        if len(norm_kw) < 3 and norm_kw not in ('go', 'js', 'ui', 'ux', 'io', 'ci', 'cd'):
            continue

        if norm_kw in seen:
            continue

        if category_counts[category] >= max_per_category.get(category, 2):
            continue

        final_keywords.append(word)
        seen.add(norm_kw)
        category_counts[category] += 1

        if len(final_keywords) >= 25:
            break
    
    return final_keywords
