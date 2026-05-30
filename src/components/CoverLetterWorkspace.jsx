import React, { useState, useMemo } from 'react';
import { 
  FileText, Sparkles, AlertCircle, Copy, CheckCircle2, 
  Download, FileDown, RefreshCw, Layers, Edit3, ArrowRight, FileUp
} from 'lucide-react';

const WRITING_STYLES = [
  { id: 'professional', label: 'Professional English', desc: 'Standard business English, polished and articulate.' },
  { id: 'beginner', label: 'Beginner Friendly', desc: 'Simple, direct, and entry-level focused language.' },
  { id: 'corporate', label: 'Corporate English', desc: 'High-level business tone suitable for established companies.' },
  { id: 'executive', label: 'Executive Style', desc: 'Leadership-focused, strategic, and impact-driven phrasing.' },
  { id: 'recruiter', label: 'Recruiter Friendly', desc: 'Keywords-optimized and direct to catch recruiters\' attention.' },
  { id: 'formal', label: 'Formal Style', desc: 'Traditional, highly structured, and respectful tone.' },
  { id: 'modern', label: 'Modern Professional', desc: 'Engaging, bold, and forward-thinking industry vocabulary.' }
];

const parseTextResume = (text) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] || 'Unknown';
  
  let currentSection = '';
  const sections = {
    experience: [],
    education: [],
    skills: [],
    projects: []
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    if (lineLower.match(/\b(experience|employment|work history|career history)\b/i)) {
      currentSection = 'experience';
      continue;
    } else if (lineLower.match(/\b(education|academic|credentials|university)\b/i)) {
      currentSection = 'education';
      continue;
    } else if (lineLower.match(/\b(skills|technical skills|technologies|expertise|competencies)\b/i)) {
      currentSection = 'skills';
      continue;
    } else if (lineLower.match(/\b(projects|personal projects|key projects|academic projects)\b/i)) {
      currentSection = 'projects';
      continue;
    } else if (lineLower.match(/\b(certifications|awards|languages|interests|publications|references|volunteer)\b/i)) {
      currentSection = '';
    }

    if (currentSection) {
      if (sections[currentSection].length < 4) {
        sections[currentSection].push(line);
      }
    }
  }

  return {
    name,
    education: sections.education.join('; ') || 'Not detected',
    experience: sections.experience.join('; ') || 'Not detected',
    skills: sections.skills.join(', ') || 'Not detected',
    projects: sections.projects.join(', ') || 'Not detected'
  };
};

export default function CoverLetterWorkspace({ 
  activeResumeText, 
  activeResumeData, 
  activeTemplateId,
  onViewChange 
}) {
  // Option flow toggle
  const [optionMode, setOptionMode] = useState('A'); // 'A' or 'B'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadText, setUploadText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [jdText, setJdText] = useState('');
  const [writingStyle, setWritingStyle] = useState('professional');
  
  // Design Templates for Letterhead
  const [selectedLetterhead, setSelectedLetterhead] = useState('corporate'); // 'corporate', 'modern', 'creative', 'minimal'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Cover Letter output
  const [letterBody, setLetterBody] = useState('');
  const [prevActiveResumeData, setPrevActiveResumeData] = useState(activeResumeData);
  const [senderName, setSenderName] = useState(() => activeResumeData?.personal?.name || '');
  const [senderContact, setSenderContact] = useState(() => {
    if (activeResumeData?.personal) {
      const parts = [];
      if (activeResumeData.personal.email) parts.push(activeResumeData.personal.email);
      if (activeResumeData.personal.phone) parts.push(activeResumeData.personal.phone);
      if (activeResumeData.personal.location) parts.push(activeResumeData.personal.location);
      return parts.join(' | ') || '';
    }
    return '';
  });

  if (activeResumeData !== prevActiveResumeData) {
    setPrevActiveResumeData(activeResumeData);
    if (activeResumeData?.personal) {
      setSenderName(activeResumeData.personal.name || '');
      const parts = [];
      if (activeResumeData.personal.email) parts.push(activeResumeData.personal.email);
      if (activeResumeData.personal.phone) parts.push(activeResumeData.personal.phone);
      if (activeResumeData.personal.location) parts.push(activeResumeData.personal.location);
      setSenderContact(parts.join(' | ') || '');
    }
  }

  // Compute extracted resume summary using useMemo to avoid cascading render warnings
  const extractedSummary = useMemo(() => {
    if (optionMode === 'A') {
      if (activeResumeData && Object.keys(activeResumeData).length > 0) {
        const name = activeResumeData.personal?.name || 'Your Name';
        const education = activeResumeData.education?.map(e => `${e.degree || ''} ${e.school ? 'at ' + e.school : ''}`).filter(Boolean).join('; ') || 'Not specified';
        const experience = activeResumeData.experience?.map(exp => `${exp.role || ''} ${exp.company ? 'at ' + exp.company : ''}`).filter(Boolean).join('; ') || 'Not specified';
        const skills = (activeResumeData.skills || []).join(', ') || 'Not specified';
        const projects = activeResumeData.projects?.map(p => p.name || p.title).filter(Boolean).join(', ') || 'Not specified';
        
        return { name, education, experience, skills, projects };
      } else if (activeResumeText) {
        return parseTextResume(activeResumeText);
      } else {
        return null;
      }
    } else {
      if (uploadText) {
        return parseTextResume(uploadText);
      } else {
        return null;
      }
    }
  }, [optionMode, activeResumeData, activeResumeText, uploadText]);

  // Handle Option B file upload parsing
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to parse uploaded document');
      const data = await response.json();
      setUploadText(data.text || '');
      
      // Attempt to extract sender details from parsed text
      const lines = (data.text || '').split('\n');
      if (lines.length > 0 && lines[0].trim()) {
        setSenderName(lines[0].trim());
      }
    } catch {
      setError('Could not extract text from file. Please ensure it is a valid PDF, DOCX, or TXT file.');
    } finally {
      setUploading(false);
    }
  };

  const generateCoverLetter = async () => {
    setError('');
    
    let resumeContent;
    if (optionMode === 'A') {
      if (!activeResumeText) {
        setError('No active resume draft found. Please build one first or use Option B.');
        return;
      }
      resumeContent = activeResumeText;
    } else {
      if (!uploadText.trim()) {
        setError('Please upload a resume file to parse or paste details.');
        return;
      }
      resumeContent = uploadText;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeContent,
          jd_text: jdText,
          doc_type: 'cover_letter',
          writing_style: writingStyle
        })
      });

      if (!response.ok) throw new Error('Failed to generate cover letter');
      const data = await response.json();
      setLetterBody(data.cover_letter);
    } catch (err) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = getFullDocumentText();
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullDocumentText = () => {
    return `${senderName}\n${senderContact}\n\n${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n${letterBody}`;
  };

  const handleExport = async (fmt) => {
    if (!letterBody) return;
    const fullText = getFullDocumentText();
    
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fullText,
          format: fmt,
          filename: `${senderName.replace(/\s+/g, '_')}_Cover_Letter`,
          template_id: activeTemplateId || 'cc-001'
        })
      });

      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${senderName.replace(/\s+/g, '_')}_Cover_Letter.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting document: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Tailored Cover Letter Workspace
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Generate high-conversion cover letters and application outreach messages matching your exact career credentials to the target job specifications.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            
            {/* Flow selector tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
              <button
                type="button"
                onClick={() => setOptionMode('A')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-extrabold transition-all ${
                  optionMode === 'A' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Option A: Active Resume
              </button>
              <button
                type="button"
                onClick={() => setOptionMode('B')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-extrabold transition-all ${
                  optionMode === 'B' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Option B: Upload Resume
              </button>
            </div>

            {/* Inputs based on flow option */}
            {optionMode === 'A' ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-700">Active Resume Loaded</h4>
                  <button 
                    onClick={() => onViewChange('builder')} 
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                  >
                    Edit Resume <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="text-slate-800 text-xs font-bold">{senderName}</div>
                <div className="text-[10px] text-slate-500 truncate">{senderContact}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Upload Resume File</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500/60 rounded-2xl p-5 bg-slate-50/40 text-center transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileUp className="w-7 h-7 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-bold text-slate-700 block">
                      {uploadedFile ? uploadedFile.name : 'Select PDF, Word, or TXT'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {uploading ? 'Reading layout...' : 'Max 10MB'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Your Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Contact Info</label>
                    <input
                      type="text"
                      value={senderContact}
                      onChange={(e) => setSenderContact(e.target.value)}
                      placeholder="e.g. john.doe@email.com | +1 (555) 019-2834"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Resume Data Summary */}
            {extractedSummary && (
              <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Extracted Resume Summary
                  </h4>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                    Parsed
                  </span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div>
                    <span className="font-extrabold text-slate-700 block">Name</span>
                    <span className="text-slate-500 font-medium truncate block">{extractedSummary.name}</span>
                  </div>
                  {extractedSummary.experience && extractedSummary.experience !== 'Not specified' && extractedSummary.experience !== 'Not detected' && (
                    <div>
                      <span className="font-extrabold text-slate-700 block">Experience</span>
                      <span className="text-slate-500 font-medium line-clamp-2 block">{extractedSummary.experience}</span>
                    </div>
                  )}
                  {extractedSummary.education && extractedSummary.education !== 'Not specified' && extractedSummary.education !== 'Not detected' && (
                    <div>
                      <span className="font-extrabold text-slate-700 block">Education</span>
                      <span className="text-slate-500 font-medium truncate block">{extractedSummary.education}</span>
                    </div>
                  )}
                  {extractedSummary.skills && extractedSummary.skills !== 'Not specified' && extractedSummary.skills !== 'Not detected' && (
                    <div>
                      <span className="font-extrabold text-slate-700 block">Skills</span>
                      <span className="text-slate-500 font-medium line-clamp-2 block">{extractedSummary.skills}</span>
                    </div>
                  )}
                  {extractedSummary.projects && extractedSummary.projects !== 'Not specified' && extractedSummary.projects !== 'Not detected' && (
                    <div>
                      <span className="font-extrabold text-slate-700 block">Projects</span>
                      <span className="text-slate-500 font-medium line-clamp-2 block">{extractedSummary.projects}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Writing Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Writing Style & Tone</label>
              <div className="relative">
                <select
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all pr-10"
                >
                  {WRITING_STYLES.map(style => (
                    <option key={style.id} value={style.id}>
                      {style.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Job Description Requirements */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Paste Job Description</label>
              <textarea
                placeholder="Paste the target job description here. The AI will weave requirements and matching responsibilities seamlessly into the cover letter body..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={6}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-slate-700 leading-relaxed font-sans"
              />
            </div>

            {/* Letterhead selector style options */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Letterhead Template Styling</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'corporate', label: 'Corporate' },
                  { id: 'modern', label: 'Modern' },
                  { id: 'creative', label: 'Creative' },
                  { id: 'minimal', label: 'Minimal' }
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedLetterhead(style.id)}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      selectedLetterhead === style.id
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-extrabold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Trigger Button */}
            <button
              onClick={generateCoverLetter}
              disabled={loading || uploading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting tailored letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generate Tailored Cover Letter</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Preview/Editor Pane (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {/* Editor Action Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-slate-400" />
                Cover Letter Output
              </span>

              {letterBody && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={generateCoverLetter}
                    disabled={loading}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Generating...' : 'Regenerate'}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  
                  <button
                    onClick={() => handleExport('pdf')}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>

                  <button
                    onClick={() => handleExport('docx')}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Word
                  </button>
                </div>
              )}
            </div>

            {/* Letter Preview Container */}
            <div className="flex-1 p-8 md:p-10 flex flex-col bg-slate-50/20">
              {letterBody ? (
                <div className="flex-1 flex flex-col font-serif leading-relaxed text-slate-800 space-y-6">
                  
                  {/* Dynamic Letterhead Styling */}
                  {selectedLetterhead === 'corporate' && (
                    <div className="text-center border-b border-slate-200 pb-4 font-sans">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{senderName}</h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{senderContact}</p>
                    </div>
                  )}

                  {selectedLetterhead === 'modern' && (
                    <div className="border-l-4 border-blue-600 pl-4 font-sans">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{senderName}</h2>
                      <p className="text-xs text-slate-500 font-semibold mt-1">{senderContact}</p>
                    </div>
                  )}

                  {selectedLetterhead === 'creative' && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-xl -mx-4 font-sans">
                      <h2 className="text-xl font-black tracking-tight">{senderName}</h2>
                      <p className="text-[10px] opacity-90 mt-1 uppercase font-bold tracking-wider">{senderContact}</p>
                    </div>
                  )}

                  {selectedLetterhead === 'minimal' && (
                    <div className="font-sans border-b border-slate-100 pb-3">
                      <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">{senderName}</h2>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{senderContact}</p>
                    </div>
                  )}

                  {/* Date line */}
                  <div className="text-xs text-slate-400">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>

                  {/* Editorial Text Area */}
                  <textarea
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    className="flex-1 w-full bg-transparent resize-none border-none outline-none font-serif text-sm md:text-base leading-relaxed text-slate-700"
                    rows={16}
                  />

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                  <FileText className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-600">No Document Generated Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Enter job details on the left, choose your styling configuration, and trigger the generator to draft a premium outreach cover letter.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
