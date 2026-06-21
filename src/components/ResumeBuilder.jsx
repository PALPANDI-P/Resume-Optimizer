import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, Linkedin, 
  Briefcase, GraduationCap, Code, Award, 
  Plus, Trash2, ChevronRight, ChevronLeft,
  Eye, FileText, CheckCircle2, PlusCircle, Settings, HelpCircle, Sliders,
  Upload, X, FileCode, Palette
} from 'lucide-react';
import TemplateSelector from './TemplateSelector';
import DownloadButtons from './DownloadButtons';
import { normalizeData, parseToBuilderData, serializeResume } from '../utils/resumeSerializer';
import { PREMIUM_SAMPLE_DATA } from '../constants/templates';

const allSteps = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'sections', label: 'Sections Manager', icon: Settings },
  { id: 'summary', label: 'Summary', icon: FileText, key: 'summary' },
  { id: 'objective', label: 'Objective', icon: FileText, key: 'objective' },
  { id: 'education', label: 'Education', icon: GraduationCap, key: 'education' },
  { id: 'experience', label: 'Experience', icon: Briefcase, key: 'experience' },
  { id: 'internships', label: 'Internships', icon: Briefcase, key: 'internships' },
  { id: 'projects', label: 'Projects', icon: Globe, key: 'projects' },
  { id: 'skills', label: 'Skills', icon: Code, key: 'skills' },
  { id: 'techSkills', label: 'Technical Skills', icon: Code, key: 'technicalSkills' },
  { id: 'softSkills', label: 'Soft Skills', icon: Code, key: 'softSkills' },
  { id: 'certifications', label: 'Certificates', icon: Award, key: 'certifications' },
  { id: 'achievements', label: 'Achievements', icon: Award, key: 'achievements' },
  { id: 'awards', label: 'Awards', icon: Award, key: 'awards' },
  { id: 'languages', label: 'Languages', icon: Globe, key: 'languages' },
  { id: 'publications', label: 'Publications', icon: FileText, key: 'publications' },
  { id: 'volunteer', label: 'Volunteer Experience', icon: Briefcase, key: 'volunteerExperience' },
  { id: 'references', label: 'References', icon: User, key: 'references' },
  { id: 'custom', label: 'Custom Sections', icon: PlusCircle, key: 'customSections' },
  { id: 'chooseTemplate', label: 'Choose Template', icon: Settings }
];

const ResumeBuilder = ({ initialData, onSave, onPreview, onChange, templatesList }) => {
  const [data, setData] = useState(() => normalizeData(initialData));
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [importError, setImportError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [activeImportTab, setActiveImportTab] = useState('file');
  const [showDemoDownload, setShowDemoDownload] = useState(false);
  const [importStep, setImportStep] = useState('upload');
  const [parsedImportData, setParsedImportData] = useState(null);
  const [selectedImportTemplate, setSelectedImportTemplate] = useState(null);
  const lastSavedDataRef = React.useRef('');
  const isInitialMount = React.useRef(true);
  const prevInitialDataRef = React.useRef(null);
  const isInternalUpdate = React.useRef(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleLoadDemoData = () => {
    const loaded = normalizeData(PREMIUM_SAMPLE_DATA);
    setData(loaded);
    setActiveStep(0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setImportError(`File exceeds the 5MB size limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please choose a smaller file or paste the text directly.`);
        setImportFile(null);
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type) && !['pdf', 'docx', 'txt'].includes(file.name.split('.').pop()?.toLowerCase())) {
        setImportError('Unsupported file format. Please upload PDF, DOCX, or TXT files only.');
        setImportFile(null);
        return;
      }
      setImportFile(file);
      setImportError('');
      setImportStep('upload');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (file.size > MAX_FILE_SIZE) {
        setImportError(`File exceeds the 5MB size limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please choose a smaller file or paste the text directly.`);
        return;
      }
      if (!['pdf', 'docx', 'txt'].includes(ext)) {
        setImportError('Unsupported file format. Please upload PDF, DOCX, or TXT files only.');
        return;
      }
      setImportFile(file);
      setImportError('');
      setImportStep('upload');
    }
  };

  const getTechnicalKeywords = (data) => {
    const techKeywords = ['javascript', 'python', 'java', 'typescript', 'react', 'node', 'angular',
      'vue', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mongodb', 'git', 'devops',
      'backend', 'frontend', 'fullstack', 'api', 'cloud', 'agile', 'scrum', 'ci/cd', 'linux',
      'python', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'django',
      'flask', 'spring', 'express', 'tensorflow', 'pytorch', 'machine learning', 'data science',
      'developer', 'engineer', 'programmer', 'software', 'technical', 'database', 'framework'];
    const text = serializeResume(data).toLowerCase();
    return techKeywords.filter(kw => text.includes(kw));
  };

  const getExperienceYears = (data) => {
    const datesText = (data.experience || []).map(e => e.dates || '').join(' ');
    const matches = datesText.match(/\d{4}/g) || [];
    if (matches.length >= 2) {
      const years = matches.map(Number).sort((a, b) => a - b);
      return Math.max(0, years[years.length - 1] - years[0]);
    }
    return 0;
  };

  const getGovernmentKeywords = (data) => {
    const govKeywords = ['federal', 'state', 'government', 'public sector', 'civil service',
      'military', 'department of', 'agency', 'congress', 'senate', 'white house',
      'in / contractor', 'clearance', 'security clearance', 'top secret', 'gs-',
      'public administration', 'policy', 'legislation', 'compliance', 'regulatory'];
    const text = serializeResume(data).toLowerCase();
    return govKeywords.filter(kw => text.includes(kw));
  };

  const getSuggestedTemplateIds = (data) => {
    const suggestions = [];
    const techKeywords = getTechnicalKeywords(data);
    const expYears = getExperienceYears(data);
    const govKeywords = getGovernmentKeywords(data);

    if (techKeywords.length >= 3) {
      const itArchetypes = ['modern-sidebar', 'modern-sidebar-right', 'creative-timeline', 'grid-layout'];
      templatesList?.forEach(t => {
        if (itArchetypes.includes(t.archetype) && !suggestions.includes(t.id)) suggestions.push(t.id);
      });
    }

    if (expYears >= 10 || (data.experience || []).some(e => /senior|lead|manager|director|vp|principal/i.test(e.role || ''))) {
      const execArchetypes = ['executive-banner', 'elegant-divider', 'corporate-grid'];
      templatesList?.forEach(t => {
        if (execArchetypes.includes(t.archetype) && !suggestions.includes(t.id)) suggestions.push(t.id);
      });
    }

    if (expYears <= 3 && (data.experience || []).length === 0) {
      const basicArchetypes = ['ats-optimized', 'classic-clean', 'modern-sidebar'];
      templatesList?.forEach(t => {
        if (basicArchetypes.includes(t.archetype) && !suggestions.includes(t.id)) suggestions.push(t.id);
      });
    }

    if (govKeywords.length >= 2) {
      const govArchetypes = ['ats-optimized', 'classic-clean', 'academic-classic'];
      templatesList?.forEach(t => {
        if (govArchetypes.includes(t.archetype) && !suggestions.includes(t.id)) suggestions.push(t.id);
      });
    }

    if (suggestions.length === 0) {
      const defaultArchetypes = ['ats-optimized', 'classic-clean', 'modern-banner'];
      templatesList?.forEach(t => {
        if (defaultArchetypes.includes(t.archetype) && !suggestions.includes(t.id)) suggestions.push(t.id);
      });
    }

    return suggestions.slice(0, 6);
  };

  const getSuggestionReason = (data) => {
    const reasons = [];
    const techKeywords = getTechnicalKeywords(data);
    const expYears = getExperienceYears(data);
    const govKeywords = getGovernmentKeywords(data);

    if (techKeywords.length >= 3) reasons.push(`strong technical content (${techKeywords.length} tech keywords detected)`);
    if (expYears >= 10) reasons.push(`senior-level experience (~${expYears} years)`);
    if (expYears <= 3 && (data.experience || []).length === 0) reasons.push('entry-level profile');
    if (govKeywords.length >= 2) reasons.push('government/public sector keywords detected');
    if (reasons.length === 0) reasons.push('general professional profile');

    return reasons.join(', ');
  };

  const handleConvertToTemplate = () => {
    if (!parsedImportData || !selectedImportTemplate) return;
    const converted = {
      ...parsedImportData,
      template_id: selectedImportTemplate.id,
    };
    setData(converted);
    setShowImportModal(false);
    resetImportState();
    setActiveStep(0);
    if (onPreview) {
      setTimeout(() => onPreview(converted), 100);
    }
  };

  const resetImportState = () => {
    setImportStep('upload');
    setParsedImportData(null);
    setSelectedImportTemplate(null);
    setImportFile(null);
    setImportText('');
    setImportError('');
    setShowImportModal(false);
  };

  const handleImportAction = async () => {
    setImportError('');

    if (importText.trim()) {
      const textSize = new Blob([importText]).size;
      if (textSize > MAX_FILE_SIZE) {
        setImportError(`Pasted text exceeds the 5MB size limit (${(textSize / (1024 * 1024)).toFixed(1)}MB). Please paste a shorter resume.`);
        return;
      }
      if (importText.trim().length < 50) {
        setImportError('Resume text is too short to parse. Please paste at least a few lines of resume content.');
        return;
      }
      setIsParsing(true);
      setImportStep('parse');
      try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const parsed = parseToBuilderData(importText);
        const normalized = normalizeData(parsed);
        setParsedImportData(normalized);
        setSelectedImportTemplate(null);
        setImportStep('templates');
      } catch (err) {
        setImportError('Error parsing resume content: ' + (err?.message || 'Unknown parsing error. Please check your text and try again.'));
        setImportStep('upload');
      } finally {
        setIsParsing(false);
      }
    } else if (importFile) {
      setIsParsing(true);
      setImportStep('parse');
      try {
        const formData = new FormData();
        formData.append('resume', importFile);
        const response = await fetch('/api/parse-resume', {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          if (response.status === 413) {
            throw new Error('File too large for the server. Maximum allowed size is 5MB. Please compress your file or paste the text instead.');
          }
          if (response.status === 415) {
            throw new Error('Unsupported file type. The server only accepts PDF, DOCX, and TXT files.');
          }
          throw new Error(errData.error || 'Failed to extract text from file.');
        }
        const resData = await response.json();
        if (!resData.text) {
          throw new Error('No readable text found in this file. The file may be image-based or password-protected. Try pasting the text instead.');
        }
        await new Promise(resolve => setTimeout(resolve, 800));
        const parsed = parseToBuilderData(resData.text);
        const normalized = normalizeData(parsed);
        setParsedImportData(normalized);
        setSelectedImportTemplate(null);
        setImportStep('templates');
      } catch (err) {
        setImportError(err.message || 'Error parsing uploaded file. Please try again or use the text paste option.');
        setImportStep('upload');
      } finally {
        setIsParsing(false);
      }
    }
  };

  // Call real-time onChange
  useEffect(() => {
    if (onChange && !isInitialMount.current) {
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }
      const serialized = JSON.stringify(data);
      if (serialized !== lastSavedDataRef.current) {
        lastSavedDataRef.current = serialized;
        onChange(data);
      }
    }
  }, [data, onChange]);

  // Sync when initialData changes (e.g. loaded an example)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevInitialDataRef.current = JSON.stringify(initialData);
      return;
    }

    if (initialData) {
      const normalized = normalizeData(initialData);
      const serialized = JSON.stringify(normalized);
      if (serialized !== prevInitialDataRef.current) {
        prevInitialDataRef.current = serialized;
        isInternalUpdate.current = true;
        setData(normalized);

        const nextSteps = allSteps.filter(step => {
          if (!step.key) return true;
          return normalized.visibleSections[step.key] !== false;
        });
        setActiveStep(prev => Math.min(prev, Math.max(0, nextSteps.length - 1)));
      }
    }
  }, [initialData]);

  // Debounce auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave) onSave(data);
    }, 2000);
    return () => clearTimeout(timer);
  }, [data, onSave]);

  const validateField = (field, value) => {
    let err = '';
    if (!value) return err;

    if (field === 'name') {
      const nameRegex = /^[a-zA-Z\s'\-.,]+$/;
      if (!nameRegex.test(value)) {
        err = "Name can only contain letters, spaces, and standard punctuation (., ' -)";
      }
    } else if (field === 'phone') {
      const phoneRegex = /^[0-9\s\-()+]+$/;
      if (!phoneRegex.test(value)) {
        err = 'Phone number can only contain numbers, spaces, and symbols like +, -, (, )';
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        err = 'Please enter a valid email address';
      }
    } else if (field === 'website' || field === 'linkedin') {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (!urlRegex.test(value)) {
        err = 'Please enter a valid URL (e.g. example.com or https://example.com)';
      }
    }
    return err;
  };

  const handlePersonalChange = (field, value) => {
    let sanitizedValue = value;
    if (field === 'name') {
      sanitizedValue = value.replace(/[^a-zA-Z\s'\-.,]/g, '');
    } else if (field === 'phone') {
      sanitizedValue = value.replace(/[^0-9\s\-()+]/g, '');
    }
    const error = validateField(field, sanitizedValue);
    setErrors(prev => ({ ...prev, [field]: error }));
    setData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: sanitizedValue
      }
    }));
  };

  // Filter steps based on what's visible
  const steps = allSteps.filter(step => {
    if (!step.key) return true; // personal and sections are always visible
    return data.visibleSections[step.key] !== false;
  });

  const updateDataItem = (section, index, field, value) => {
    const newData = { ...data };
    newData[section] = [...newData[section]];
    newData[section][index] = { ...newData[section][index], [field]: value };
    setData(newData);
  };

  const addDataItem = (section, template) => {
    setData({ 
      ...data, 
      [section]: [...(data[section] || []), { ...template, id: Date.now() + Math.random() }] 
    });
  };

  const removeDataItem = (section, index) => {
    const newData = { ...data };
    newData[section] = [...newData[section]];
    newData[section].splice(index, 1);
    setData(newData);
  };

  const toggleSection = (key) => {
    const nextVisibleSections = {
      ...data.visibleSections,
      [key]: !data.visibleSections[key]
    };
    
    setData({
      ...data,
      visibleSections: nextVisibleSections
    });

    const nextSteps = allSteps.filter(step => {
      if (!step.key) return true;
      return nextVisibleSections[step.key] !== false;
    });

    setActiveStep(prev => Math.min(prev, Math.max(0, nextSteps.length - 1)));
  };

  const renderStepContent = () => {
    if (!steps[activeStep]) return null;
    const currentStep = steps[activeStep].id;

    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={data.personal.name || ''}
                    onChange={(e) => handlePersonalChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-800 ${
                      errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                    }`} 
                    placeholder="Full Name"
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={data.personal.email || ''}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-800 ${
                      errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                    }`} 
                    placeholder="Email Address"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={data.personal.phone || ''}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-800 ${
                      errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                    }`} 
                    placeholder="Phone with country code"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Location (City, State)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={data.personal.location || ''}
                    onChange={(e) => handlePersonalChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-800" 
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Website / Portfolio Link</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={data.personal.website || ''}
                    onChange={(e) => handlePersonalChange('website', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-800 ${
                      errors.website ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                    }`} 
                    placeholder="Portfolio URL (optional)"
                  />
                </div>
                {errors.website && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.website}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">LinkedIn Profile</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={data.personal.linkedin || ''}
                    onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-800 ${
                      errors.linkedin ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                    }`} 
                    placeholder="LinkedIn Profile URL"
                  />
                </div>
                {errors.linkedin && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.linkedin}</p>}
              </div>
            </div>
          </div>
        );

      case 'sections':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">
              <h4 className="font-bold mb-1 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Dynamic Section Manager</h4>
              Toggle sections off to hide them from the final generated document. Enable them back anytime without losing your inputs.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allSteps.filter(s => s.key).map(s => {
                const isEnabled = data.visibleSections[s.key] !== false;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSection(s.key)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all group ${
                      isEnabled 
                        ? 'bg-white border-blue-200 hover:border-blue-300 ring-2 ring-blue-50/50 text-slate-800' 
                        : 'bg-slate-50/50 border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{s.label}</div>
                        <div className="text-[10px] text-slate-400">Include in resume structure</div>
                      </div>
                    </div>
                    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      isEnabled ? 'bg-blue-600' : 'bg-slate-200'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Professional Summary</label>
              <textarea 
                value={data.summary || ''}
                onChange={(e) => setData({...data, summary: e.target.value})}
                className="w-full h-44 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none text-sm leading-relaxed text-slate-800 transition-all" 
                placeholder="Write a 2-3 sentence professional summary highlighting your key strengths and achievements..."
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                Recruiter tip: Tailor this summary using core verbs and keywords matching your dream job description.
              </p>
            </div>
          </div>
        );

      case 'objective':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Career Objective</label>
              <textarea 
                value={data.objective || ''}
                onChange={(e) => setData({...data, objective: e.target.value})}
                className="w-full h-44 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none text-sm leading-relaxed text-slate-800 transition-all" 
                placeholder="State your career goal and what you aim to achieve in your next role..."
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                Recruiter tip: A career objective is especially useful for entry-level candidates and career changers.
              </p>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.experience || []).map((exp, idx) => (
              <div key={exp.id || idx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('experience', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Job title" 
                    value={exp.role || ''} 
                    onChange={e => updateDataItem('experience', idx, 'role', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    placeholder="Company name" 
                    value={exp.company || ''} 
                    onChange={e => updateDataItem('experience', idx, 'company', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Start date – End date" 
                    value={exp.dates || ''} 
                    onChange={e => updateDataItem('experience', idx, 'dates', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    placeholder="City, State" 
                    value={exp.location || ''} 
                    onChange={e => updateDataItem('experience', idx, 'location', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <textarea 
                  placeholder="Key achievements and responsibilities\n- Use bullet points starting with - or •\n- Quantify impact where possible (%, $, numbers)" 
                  value={exp.description || ''} 
                  onChange={e => updateDataItem('experience', idx, 'description', e.target.value)}
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm resize-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('experience', { role: '', company: '', dates: '', location: '', description: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Professional Experience
            </button>
          </div>
        );

      case 'internships':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.internships || []).map((intern, idx) => (
              <div key={intern.id || idx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('internships', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Internship role title" 
                    value={intern.role || ''} 
                    onChange={e => updateDataItem('internships', idx, 'role', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    placeholder="Company name" 
                    value={intern.company || ''} 
                    onChange={e => updateDataItem('internships', idx, 'company', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Start – End date" 
                    value={intern.dates || ''} 
                    onChange={e => updateDataItem('internships', idx, 'dates', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    placeholder="City, State" 
                    value={intern.location || ''} 
                    onChange={e => updateDataItem('internships', idx, 'location', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <textarea 
                  placeholder="Key tasks and outcomes\n- Start each bullet with - or •\n- Focus on what you learned and delivered" 
                  value={intern.description || ''} 
                  onChange={e => updateDataItem('internships', idx, 'description', e.target.value)}
                  className="w-full h-30 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm resize-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('internships', { role: '', company: '', dates: '', location: '', description: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Internship Entry
            </button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.education || []).map((edu, idx) => (
              <div key={edu.id || idx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('education', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Degree / Major" 
                    value={edu.degree || ''} 
                    onChange={e => updateDataItem('education', idx, 'degree', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    placeholder="University / School" 
                    value={edu.school || ''} 
                    onChange={e => updateDataItem('education', idx, 'school', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Start year – End year" 
                    value={edu.dates || ''} 
                    onChange={e => updateDataItem('education', idx, 'dates', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    placeholder="Honors, GPA (optional)" 
                    value={edu.honors || ''} 
                    onChange={e => updateDataItem('education', idx, 'honors', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('education', { degree: '', school: '', dates: '', honors: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Education History
            </button>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-700">Instructions:</span> Group your skills by categories to make them scannable (e.g., Category: &quot;Languages&quot;, Skills: &quot;Javascript, Python, Rust&quot;).
            </div>
            
            {(data.skills || []).map((skillGroup, idx) => (
              <div key={skillGroup.id || idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative group shadow-sm hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('skills', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <input 
                  placeholder="Skill category (e.g. Languages, Frameworks)" 
                  value={skillGroup.category || ''} 
                  onChange={e => updateDataItem('skills', idx, 'category', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                  placeholder="List skills separated by commas" 
                  value={skillGroup.items || ''} 
                  onChange={e => updateDataItem('skills', idx, 'items', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('skills', { category: '', items: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Skill Category
            </button>
          </div>
        );

      case 'techSkills':
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-700">Technical Skills:</span> Group your technical proficiencies (e.g., Category: &quot;Languages&quot;, Skills: &quot;Javascript, Python, C++&quot;; Category: &quot;Frameworks&quot;, Skills: &quot;React, Node.js, Django&quot;).
            </div>
            
            {(data.technicalSkills || []).map((skillGroup, idx) => (
              <div key={skillGroup.id || idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative group shadow-sm hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('technicalSkills', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <input 
                  placeholder="Skill category (e.g. Cloud, DevOps, Tools)" 
                  value={skillGroup.category || ''} 
                  onChange={e => updateDataItem('technicalSkills', idx, 'category', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input 
                  placeholder="Technologies and tools" 
                  value={skillGroup.items || ''} 
                  onChange={e => updateDataItem('technicalSkills', idx, 'items', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('technicalSkills', { category: '', items: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Technical Skill Category
            </button>
          </div>
        );

      case 'softSkills':
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Soft Skills</label>
              <input 
                type="text" 
                value={data.softSkills || ''}
                onChange={(e) => setData({...data, softSkills: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm text-slate-800" 
                placeholder="Soft skills separated by commas"
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                Enter your soft skills separated by commas. We will automatically format them as distinct tags in your resume.
              </p>
            </div>
            {data.softSkills && (
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                {data.softSkills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.projects || []).map((proj, idx) => (
              <div key={proj.id || idx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('projects', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Project name" 
                    value={proj.name || ''} 
                    onChange={e => updateDataItem('projects', idx, 'name', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    placeholder="Project link (optional)" 
                    value={proj.link || ''} 
                    onChange={e => updateDataItem('projects', idx, 'link', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <textarea 
                  placeholder="Project description\n- Use bullet points starting with - or •\n- Highlight technologies used and outcomes achieved" 
                  value={proj.description || ''} 
                  onChange={e => updateDataItem('projects', idx, 'description', e.target.value)}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm resize-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('projects', { name: '', link: '', description: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Project Entry
            </button>
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.certifications || []).map((cert, idx) => (
              <div key={cert.id || idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group flex gap-4 items-center hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('certifications', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <input 
                    placeholder="Certificate name" 
                    value={cert.name || ''} 
                    onChange={e => updateDataItem('certifications', idx, 'name', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="w-28">
                  <input 
                    placeholder="Year obtained" 
                    value={cert.year || ''} 
                    onChange={e => updateDataItem('certifications', idx, 'year', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('certifications', { name: '', year: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Certification or Award
            </button>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.achievements || []).map((ach, idx) => (
              <div key={ach.id || idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group flex flex-col md:flex-row gap-4 items-start md:items-center hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('achievements', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-1 w-full">
                  <input 
                    placeholder="Achievement title" 
                    value={ach.name || ''} 
                    onChange={e => updateDataItem('achievements', idx, 'name', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1 w-full">
                  <input 
                    placeholder="Brief description of the achievement" 
                    value={ach.details || ''} 
                    onChange={e => updateDataItem('achievements', idx, 'details', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('achievements', { name: '', details: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Achievement Entry
            </button>
          </div>
        );

      case 'awards':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.awards || []).map((award, idx) => (
              <div key={award.id || idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group flex flex-col md:flex-row gap-4 items-start md:items-center hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('awards', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-1 w-full">
                  <input 
                    placeholder="Award title" 
                    value={award.title || ''} 
                    onChange={e => updateDataItem('awards', idx, 'title', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1 w-full">
                  <input 
                    placeholder="Issuing organization" 
                    value={award.issuer || ''} 
                    onChange={e => updateDataItem('awards', idx, 'issuer', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="w-full md:w-28">
                  <input 
                    placeholder="Year received" 
                    value={award.year || ''} 
                    onChange={e => updateDataItem('awards', idx, 'year', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('awards', { title: '', issuer: '', year: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Award Entry
            </button>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.languages || []).map((lang, idx) => (
              <div key={lang.id || idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm relative group flex gap-4 items-center hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('languages', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <input 
                    placeholder="Language" 
                    value={lang.name || ''} 
                    onChange={e => updateDataItem('languages', idx, 'name', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="w-40">
                  <input 
                    placeholder="Proficiency level" 
                    value={lang.proficiency || ''} 
                    onChange={e => updateDataItem('languages', idx, 'proficiency', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 text-center focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('languages', { name: '', proficiency: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Language
            </button>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
              Add completely customizable key-value fields for anything else (e.g. Volunteer Experience, Publications, Interests).
            </div>
            
            {(data.customSections || []).map((section, secIdx) => (
              <div key={section.id || secIdx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('customSections', secIdx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Section Title</label>
                  <input 
                    placeholder="Section Title (e.g. VOLUNTEER WORK)" 
                    value={section.title || ''} 
                    onChange={e => {
                      const newData = { ...data };
                      newData.customSections = [...newData.customSections];
                      newData.customSections[secIdx] = { ...newData.customSections[secIdx], title: e.target.value };
                      setData(newData);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fields</label>
                  {(section.fields || []).map((field, fieldIdx) => (
                    <div key={field.id || fieldIdx} className="flex gap-3 items-center group/field">
                      <input 
                        placeholder="Label (e.g. Organization)" 
                        value={field.label || ''} 
                        onChange={e => {
                          const newData = { ...data };
                          newData.customSections = [...newData.customSections];
                          newData.customSections[secIdx] = { ...newData.customSections[secIdx] };
                          newData.customSections[secIdx].fields = [...newData.customSections[secIdx].fields];
                          newData.customSections[secIdx].fields[fieldIdx] = { ...newData.customSections[secIdx].fields[fieldIdx], label: e.target.value };
                          setData(newData);
                        }}
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input 
                        placeholder="Value (e.g. Red Cross)" 
                        value={field.value || ''} 
                        onChange={e => {
                          const newData = { ...data };
                          newData.customSections = [...newData.customSections];
                          newData.customSections[secIdx] = { ...newData.customSections[secIdx] };
                          newData.customSections[secIdx].fields = [...newData.customSections[secIdx].fields];
                          newData.customSections[secIdx].fields[fieldIdx] = { ...newData.customSections[secIdx].fields[fieldIdx], value: e.target.value };
                          setData(newData);
                        }}
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newData = { ...data };
                          newData.customSections = [...newData.customSections];
                          newData.customSections[secIdx] = { ...newData.customSections[secIdx] };
                          newData.customSections[secIdx].fields = [...newData.customSections[secIdx].fields];
                          newData.customSections[secIdx].fields.splice(fieldIdx, 1);
                          setData(newData);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      const newData = { ...data };
                      newData.customSections = [...newData.customSections];
                      newData.customSections[secIdx] = { ...newData.customSections[secIdx] };
                      if (!newData.customSections[secIdx].fields) {
                        newData.customSections[secIdx].fields = [];
                      } else {
                        newData.customSections[secIdx].fields = [...newData.customSections[secIdx].fields];
                      }
                      newData.customSections[secIdx].fields.push({ id: Date.now() + Math.random(), label: '', value: '' });
                      setData(newData);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row Field
                  </button>
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => {
                setData({
                  ...data,
                  customSections: [...(data.customSections || []), { id: Date.now() + Math.random(), title: '', fields: [{ id: Date.now() + Math.random() + 1, label: '', value: '' }] }]
                });
              }}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Custom Section block
            </button>
          </div>
        );

      case 'publications':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.publications || []).map((pub, idx) => (
              <div key={pub.id || idx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('publications', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Publication Title</label>
                    <input 
                      placeholder="Publication title" 
                      value={pub.title || ''} 
                      onChange={e => updateDataItem('publications', idx, 'title', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Journal / Publisher</label>
                    <input 
                      placeholder="Journal or publisher" 
                      value={pub.journal || ''} 
                      onChange={e => updateDataItem('publications', idx, 'journal', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Year</label>
                    <input 
                      placeholder="Year" 
                      value={pub.year || ''} 
                      onChange={e => updateDataItem('publications', idx, 'year', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Link</label>
                    <input 
                      placeholder="DOI or link (optional)" 
                      value={pub.link || ''} 
                      onChange={e => updateDataItem('publications', idx, 'link', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('publications', { title: '', journal: '', year: '', link: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Publication
            </button>
          </div>
        );

      case 'volunteer':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.volunteerExperience || []).map((vol, idx) => (
              <div key={vol.id || idx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('volunteerExperience', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Volunteer Role</label>
                    <input 
                      placeholder="Volunteer role" 
                      value={vol.role || ''} 
                      onChange={e => updateDataItem('volunteerExperience', idx, 'role', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Organization</label>
                    <input 
                      placeholder="Organization name" 
                      value={vol.organization || ''} 
                      onChange={e => updateDataItem('volunteerExperience', idx, 'organization', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Dates</label>
                  <input 
                    placeholder="e.g. Jan 2022 - Present" 
                    value={vol.dates || ''} 
                    onChange={e => updateDataItem('volunteerExperience', idx, 'dates', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Description</label>
                  <textarea 
                    placeholder="Key accomplishments and activities (use bullet points starting with - or •)" 
                    value={vol.description || ''} 
                    onChange={e => updateDataItem('volunteerExperience', idx, 'description', e.target.value)}
                    className="w-full h-32 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm resize-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('volunteerExperience', { role: '', organization: '', dates: '', description: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Volunteer Experience
            </button>
          </div>
        );

      case 'references':
        return (
          <div className="space-y-5 animate-fade-in">
            {(data.references || []).map((ref, idx) => (
              <div key={ref.id || idx} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm relative group hover:border-slate-300 transition-all">
                <button 
                  type="button"
                  onClick={() => removeDataItem('references', idx)}
                  className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Reference Name</label>
                    <input 
                      placeholder="Reference full name" 
                      value={ref.name || ''} 
                      onChange={e => {
                        const sanitizedVal = e.target.value.replace(/[^a-zA-Z\s'\-.,]/g, '');
                        updateDataItem('references', idx, 'name', sanitizedVal);
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Job Title / Relationship</label>
                    <input 
                      placeholder="Title / relationship" 
                      value={ref.title || ''} 
                      onChange={e => updateDataItem('references', idx, 'title', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Company / Organization</label>
                    <input 
                      placeholder="Company or organization" 
                      value={ref.company || ''} 
                      onChange={e => updateDataItem('references', idx, 'company', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Contact Info</label>
                    <input 
                      placeholder="Email or phone (optional)" 
                      value={ref.contact || ''} 
                      onChange={e => updateDataItem('references', idx, 'contact', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button 
              type="button"
              onClick={() => addDataItem('references', { name: '', title: '', company: '', contact: '' })}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Reference
            </button>
          </div>
        );

      case 'chooseTemplate':
        return (
          <div className="space-y-4 animate-fade-in animate-fade-in-up">
            <TemplateSelector
              selectedTemplateId={data.template_id}
              onSelect={(templateId) => setData({ ...data, template_id: templateId })}
              templatesList={templatesList}
              previewData={data}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-4xl mx-auto">
      {/* Builder Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Resume Builder</h2>
            <p className="text-xs text-slate-400">Crafting your professional story</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
             Auto-save draft enabled
          </div>
          <button 
            type="button"
            onClick={handleLoadDemoData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            title="Populate builder with demo data for testing"
          >
            <Sliders className="w-3.5 h-3.5" />
            Demo Data
          </button>
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowDemoDownload(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-md"
              title="Download a demo resume with the current template"
            >
              Download Demo Resume
            </button>
            {showDemoDownload && (
              <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-2" onClick={(e) => e.stopPropagation()}>
                <DownloadButtons
                  content={serializeResume(PREMIUM_SAMPLE_DATA)}
                  filename="demo_resume"
                  templateId={data.template_id || templatesList?.[0]?.id || 'cc-001'}
                  compact={true}
                />
              </div>
            )}
          </div>
          <button 
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-bold transition-all"
            title="Import and parse existing resume text"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
          <button 
            type="button"
            onClick={() => onPreview && onPreview(data)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Eye className="w-4 h-4" />
            Live Preview
          </button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 overflow-x-auto">
        <div className="flex items-center min-w-max gap-3 py-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const IsActive = activeStep === idx;
            const IsCompleted = activeStep > idx;
            
            return (
              <button 
                key={step.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all relative
                  ${IsActive ? 'bg-white shadow text-blue-600 ring-1 ring-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-all p-1.5
                  ${IsActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 
                    IsCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                  {IsCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-xs font-bold">{step.label}</span>
                {IsActive && <div className="absolute -bottom-[15px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-t border-l border-slate-200 rotate-45 z-10" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/20">
        <div className="max-w-2xl mx-auto">
          {steps[activeStep] && (
            <div className="mb-6">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{steps[activeStep].label}</h3>
              <p className="text-xs md:text-sm text-slate-500">Provide your {steps[activeStep].label.toLowerCase()} details to populate your resume.</p>
            </div>
          )}
          
          {renderStepContent()}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
        <button 
          type="button"
          disabled={activeStep === 0}
          onClick={() => setActiveStep(prev => prev - 1)}
          className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 font-bold transition-all text-sm"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          Previous
        </button>
        
        <div className="hidden sm:flex items-center gap-1">
          {steps.map((_, idx) => (
            <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeStep === idx ? 'w-4 bg-blue-600' : 'bg-slate-300'}`} />
          ))}
        </div>

        {activeStep < steps.length - 1 ? (
          <button 
            type="button"
            onClick={() => setActiveStep(prev => prev + 1)}
            className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all text-sm"
          >
            Next Step
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => onPreview && onPreview(data)}
            className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200 text-sm"
          >
            Finish & Preview
            <Eye className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Import Resume Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up text-slate-800">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4.5 h-4.5 text-blue-400" />
                <span className="font-bold text-sm">Import Existing Resume</span>
              </div>
              <button
                type="button"
                onClick={resetImportState}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                disabled={isParsing}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Step Indicator */}
            {!isParsing && (
              <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  {[
                    { key: 'upload', label: 'Upload', icon: Upload },
                    { key: 'parse', label: 'Parse', icon: FileText },
                    { key: 'templates', label: 'Template', icon: Palette },
                    { key: 'review', label: 'Review', icon: CheckCircle2 },
                  ].map((step, idx, arr) => {
                    const stepOrder = ['upload', 'parse', 'templates', 'review'];
                    const currentIdx = stepOrder.indexOf(importStep);
                    const isActive = importStep === step.key;
                    const isDone = currentIdx > idx;
                    const Icon = step.icon;
                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                              isDone ? 'bg-green-500 text-white' :
                                'bg-slate-200 text-slate-500'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 rounded transition-all ${currentIdx > idx ? 'bg-green-400' : 'bg-slate-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Parallax Progress Bar for Parsing */}
            {isParsing && (
              <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: importStep === 'parse' ? '60%' : '90%',
                        animation: 'pulse-bar 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {importStep === 'parse' ? 'Parsing...' : 'Finalizing...'}
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {importError && (
              <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 text-[10px] font-extrabold font-mono">!</div>
                <div className="space-y-1">
                  <div className="font-bold">Something went wrong</div>
                  <div>{importError}</div>
                  {(importError.includes('size') || importError.includes('file too large')) && (
                    <div className="text-red-600 mt-1">
                      Tip: Try <button type="button" onClick={() => { setActiveImportTab('text'); setImportError(''); }} className="underline font-bold hover:text-red-800">pasting your resume text</button> instead, or remove unnecessary sections to reduce file size.
                    </div>
                  )}
                  {(importError.includes('text') || importError.includes('text too short')) && (
                    <div className="text-red-600 mt-1">Ensure you include at least your name, role, and one work experience entry to enable parsing.</div>
                  )}
                  {(importError.includes('server') || importError.includes('network')) && (
                    <div className="text-red-600 mt-1">The file parsing service may be temporarily unavailable. Please use the text paste option as a fallback.</div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {isParsing ? (
                <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      {importStep === 'parse' ? 'Analyzing Resume Content' : 'Almost Done...'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                      {importStep === 'parse'
                        ? 'Our pipeline is parsing layout tables, extracting dates, sections, and mapping technical skills...'
                        : 'Structuring your parsed data and generating template recommendations...'}
                    </p>
                  </div>
                </div>
              ) : importStep === 'templates' && parsedImportData ? (
                <>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Parse Successful!</strong> We identified {getTechnicalKeywords(parsedImportData).length} technical keywords and {(parsedImportData.experience || []).length} experience entries.
                      <span className="text-green-600 block mt-0.5 text-[10px]">Profile: {getSuggestionReason(parsedImportData)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Recommended Templates
                      <span className="text-blue-600 ml-1">— AI-matched to your profile</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {getSuggestedTemplateIds(parsedImportData).map(tid => {
                        const tmpl = templatesList?.find(t => t.id === tid) || TEMPLATES.find(t => t.id === tid);
                        if (!tmpl) return null;
                        const isSelected = selectedImportTemplate?.id === tid;
                        return (
                          <button
                            key={tid}
                            type="button"
                            onClick={() => setSelectedImportTemplate(tmpl)}
                            className={`relative rounded-xl border-2 transition-all p-1.5 text-left ${
                              isSelected ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <div className={`aspect-[3/4] rounded-lg mb-1.5 overflow-hidden`}
                              style={{
                                background: `linear-gradient(135deg, ${tmpl.styles?.headerColor || '#1e293b'} 0%, ${tmpl.styles?.accentColor || '#3b82f6'} 100%)`,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '6px 4px',
                              }}>
                              <div className="h-1.5 w-3/4 rounded-sm bg-white/90 mb-1" />
                              <div className="h-0.5 w-full rounded-sm bg-white/40 mb-0.5" />
                              <div className="h-0.5 w-5/6 rounded-sm bg-white/30 mb-0.5" />
                              <div className="flex gap-0.5 mt-0.5">
                                <div className="flex-1 h-4 rounded-sm bg-white/20" />
                                <div className="flex-1 h-4 rounded-sm bg-white/15" />
                              </div>
                            </div>
                            <div className="px-1">
                              <div className="text-[10px] font-bold text-slate-700 truncate">{tmpl.name}</div>
                              <div className="text-[8px] text-slate-400 uppercase tracking-wider">{tmpl.archetype?.replace('-', ' ')}</div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Or browse all templates
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                      {(templatesList || TEMPLATES).slice(0, 20).map(tmpl => {
                        const isSelected = selectedImportTemplate?.id === tmpl.id;
                        const isRecommended = getSuggestedTemplateIds(parsedImportData).includes(tmpl.id);
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => setSelectedImportTemplate(tmpl)}
                            className={`relative rounded-lg border transition-all p-1 text-left ${
                              isSelected ? 'border-blue-500 bg-blue-50' : isRecommended ? 'border-amber-300 bg-amber-50/50 hover:border-blue-300' : 'border-slate-200 hover:border-blue-300'
                            }`}
                            title={tmpl.name}
                          >
                            <div className={`aspect-[3/4] rounded-md mb-1 overflow-hidden`}
                              style={{
                                background: `linear-gradient(135deg, ${tmpl.styles?.headerColor || '#1e293b'}40, ${tmpl.styles?.accentColor || '#3b82f6'}40)`,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '3px 2px',
                                gap: '1px',
                              }}>
                              <div className="h-1 w-2/3 rounded-sm" style={{ background: tmpl.styles?.headerColor || '#1e293b' }} />
                              <div className="h-0.5 w-full rounded-sm bg-slate-300/50" />
                              <div className="h-0.5 w-4/5 rounded-sm bg-slate-300/40" />
                              <div className="h-0.5 w-full rounded-sm bg-slate-300/40" />
                              <div className="flex gap-0.5">
                                <div className="flex-1 h-2 rounded-sm" style={{ background: tmpl.styles?.accentColor || '#3b82f6' + '40' }} />
                                <div className="flex-1 h-2 rounded-sm" style={{ background: tmpl.styles?.accentColor || '#3b82f6' + '30' }} />
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {isRecommended && !isSelected && (
                              <div className="absolute top-0.5 right-0.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" title="AI Recommended" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </grid>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
                    <strong>Recruiter-Approved Lossless Parsing:</strong> Upload your file or paste your resume text (max 5MB). Our parser extracts structured sections without altering your original text values.
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setActiveImportTab('file'); setImportError(''); }}
                      className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-all ${
                        activeImportTab === 'file' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'
                      }`}
                    >
                      Upload File (.pdf, .docx, .txt)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveImportTab('text'); setImportError(''); }}
                      className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition-all ${
                        activeImportTab === 'text' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent'
                      }`}
                    >
                      Paste Text Fallback
                    </button>
                  </div>

                  {/* Tab Contents */}
                  {activeImportTab === 'text' ? (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resume Text</label>
                      <textarea
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Paste your plain text resume here... (max 5MB)"
                        rows={10}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none leading-relaxed resize-none text-slate-800 font-sans"
                      />
                      <div className="text-[10px] text-slate-400 text-right">
                        {(new Blob([importText]).size / 1024).toFixed(1)} KB / 5 MB
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      {importFile ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="max-w-[240px] truncate">
                              <div className="text-xs font-bold text-slate-800 truncate">{importFile.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{(importFile.size / 1024).toFixed(1)} KB · {importFile.size > MAX_FILE_SIZE ? '⚠️ exceeds 5MB limit' : '✓ within 5MB limit'}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setImportFile(null); setImportStep('upload'); }}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                            dragActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-350 hover:border-blue-400 hover:bg-slate-50/20'
                          }`}
                          onClick={() => document.getElementById('resume-file-input')?.click()}
                        >
                          <input
                            id="resume-file-input"
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                          <h4 className="text-xs font-bold text-slate-700">Drag and drop your resume file here</h4>
                          <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, and TXT (Max size 5MB)</p>
                          <button
                            type="button"
                            className="mt-3.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all border border-slate-200"
                          >
                            Browse Files
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={resetImportState}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-lg text-xs font-bold transition-all"
                disabled={isParsing}
              >
                Cancel
              </button>

              {importStep === 'templates' && parsedImportData ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setParsedImportData(null); setSelectedImportTemplate(null); setImportStep('upload'); setImportFile(null); setImportText(''); }}
                    className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-lg text-xs font-bold transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConvertToTemplate}
                    disabled={!selectedImportTemplate}
                    className="px-4.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 shadow-md shadow-green-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Convert to Template
                  </button>
                </>
              ) : importStep === 'upload' ? (
                <button
                  type="button"
                  onClick={handleImportAction}
                  disabled={isParsing || (!importFile && !importText.trim())}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                >
                  {isParsing ? 'Parsing...' : 'Start Parsing & Load'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
