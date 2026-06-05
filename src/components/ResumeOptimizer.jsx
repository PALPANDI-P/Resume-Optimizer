import React, { useState } from 'react';
import { 
  FileText, Upload, Sparkles, AlertCircle, CheckCircle2, 
  ChevronRight, ArrowRight, RefreshCw, HelpCircle, 
  ListTodo, Info, Download, Eye, FileUp
} from 'lucide-react';
import { parseToBuilderData } from '../utils/resumeSerializer';
import { analyzeResumeLocally } from '../utils/localAnalyzer';

export default function ResumeOptimizer({ 
  activeResumeText, 
  activeTemplateId,
  onLoadResumeToBuilder, 
  onViewChange 
}) {
  // Options
  const [sourceType, setSourceType] = useState(() => activeResumeText ? 'active' : 'upload'); // 'active' or 'upload'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jdText, setJdText] = useState('');
  
  // State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [versions, setVersions] = useState([]);
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState('score'); // 'score', 'keywords', 'versions', 'tips'
  const [selectedVersionText, setSelectedVersionText] = useState(null);
  
  // Checklist states
  const [checkedItems, setCheckedItems] = useState({});

  const [prevActiveResumeText, setPrevActiveResumeText] = useState(activeResumeText);
  if (activeResumeText !== prevActiveResumeText) {
    setPrevActiveResumeText(activeResumeText);
    if (!activeResumeText && sourceType === 'active') {
      setSourceType('upload');
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setError('');
    }
  };

  const runAnalysis = async () => {
    setError('');
    
    // Validations
    if (sourceType === 'upload' && !uploadedFile) {
      setError('Please select a resume file (PDF, DOCX, or TXT) to optimize.');
      return;
    }
    if (sourceType === 'active' && !activeResumeText) {
      setError('No active resume draft found in the builder. Please enter details or choose "Upload File".');
      return;
    }
    if (!jdText.trim()) {
      setError('Please paste the job description text to perform alignment calculations.');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setVersions([]);
    
    // Simulated steps for polished UX
    const steps = [
      'Extracting resume text layout...',
      'Analyzing job description semantic keywords...',
      'Evaluating ATS scoring algorithm rules...',
      'Generating optimized resume variations...'
    ];
    
    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
      }
    }, 1500);

    const formData = new FormData();
    formData.append('jd_text', jdText);

    if (sourceType === 'active') {
      // Create a plain text Blob of the serialized draft and append it as a file
      const blob = new Blob([activeResumeText], { type: 'text/plain' });
      formData.append('resume', blob, 'resume_draft.txt');
    } else {
      formData.append('resume', uploadedFile);
    }

    try {
      const response = await fetch('/api/generate-resumes', {
        method: 'POST',
        body: formData,
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        let errMsg = 'Failed to analyze resume.';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch {
          /* ignore */
        }
        throw new Error(errMsg);
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      setVersions(result.versions);
      setActiveTab('score');
      
      // Initialize checklist from analysis items
      const initialChecked = {};
      if (result.analysis?.feedback) {
        result.analysis.feedback.forEach((_, i) => {
          initialChecked[`feedback-${i}`] = false;
        });
      }
      if (result.analysis?.changes_made) {
        result.analysis.changes_made.forEach((_, i) => {
          initialChecked[`change-${i}`] = false;
        });
      }
      setCheckedItems(initialChecked);
    } catch (err) {
      clearInterval(stepInterval);
      console.warn("Backend optimization failed or offline. Running client-side fallback:", err);
      
      try {
        // Prepare text of resume
        let resumeContentText = '';
        if (sourceType === 'active') {
          resumeContentText = activeResumeText;
        } else if (uploadedFile) {
          if (uploadedFile.type === 'text/plain' || uploadedFile.name.endsWith('.txt')) {
            resumeContentText = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.readAsText(uploadedFile);
            });
          } else {
            resumeContentText = `Resume File: ${uploadedFile.name}`;
          }
        }

        // Run local analysis
        const localResult = analyzeResumeLocally(resumeContentText, jdText);
        
        // Generate mock versions locally
        const localVersions = [
          {
            id: 'v1',
            title: 'ATS Keyword Optimized',
            description: 'Maximum keyword alignment. Best for ATS screening systems.',
            content: `${resumeContentText || 'Uploaded Resume'}\n\n[ATS OPTIMIZED SECTION]\nSKILLS: ${localResult.matched_skills.join(', ')}, ${localResult.skills_to_emphasize.join(', ')}`
          },
          {
            id: 'v2',
            title: 'Recruiter Friendly',
            description: 'Clean, polished, professional wording. Easy to read.',
            content: `${resumeContentText || 'Uploaded Resume'}\n\n[RECRUITER REVIEWED]\nFocusing on achievements and impact.`
          },
          {
            id: 'v3',
            title: 'Balanced Configuration',
            description: 'Optimal mix of ATS optimization and human readability.',
            content: `${resumeContentText || 'Uploaded Resume'}\n\n[BALANCED VERSION]\nSkills and experience optimized.`
          }
        ];

        setAnalysis(localResult);
        setVersions(localVersions);
        setActiveTab('score');
        
        // Initialize checklist
        const initialChecked = {};
        if (localResult.feedback) {
          localResult.feedback.forEach((_, i) => {
            initialChecked[`feedback-${i}`] = false;
          });
        }
        if (localResult.changes_made) {
          localResult.changes_made.forEach((_, i) => {
            initialChecked[`change-${i}`] = false;
          });
        }
        setCheckedItems(initialChecked);
        
        setError('Offline Mode: Backend server is unreachable. Displaying local client-side analysis and recommendations.');
        
      } catch {
        setError(err.message || 'Connection error. Make sure the backend server is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (content, title, fmt) => {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          format: fmt,
          filename: (title || '').replace(/[^a-zA-Z0-9]/g, '_'),
          template_id: activeTemplateId || 'cc-001'
        })
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting document: ' + err.message);
    }
  };

  const handleLoadVersionIntoBuilder = (versionContent) => {
    const structuredData = parseToBuilderData(versionContent);
    onLoadResumeToBuilder(structuredData);
    onViewChange('builder');
  };

  const getScoreColor = (score) => {
    if (score < 50) return 'text-red-500 stroke-red-500';
    if (score < 75) return 'text-amber-500 stroke-amber-500';
    return 'text-emerald-500 stroke-emerald-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          ATS AI Resume Optimizer
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
          Audit and align your credentials with any target job listing. Our deep semantic scanner computes match compatibility, surfaces key missing concepts, and tailors drafts for recruiters.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Configuration Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              Optimization Setup
            </h2>

            {/* Resume Source Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Select Resume Input</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSourceType('active')}
                  disabled={!activeResumeText}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                    sourceType === 'active'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                      : activeResumeText
                        ? 'border-slate-200 hover:border-slate-300 bg-white'
                        : 'border-slate-100 bg-slate-50/70 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <FileText className={`w-5 h-5 ${sourceType === 'active' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Use Active Draft</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Loads text from current resume builder session</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('upload')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                    sourceType === 'upload'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Upload className={`w-5 h-5 ${sourceType === 'upload' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Upload New File</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Upload a local PDF, Word, or plain text file</p>
                  </div>
                </button>
              </div>
            </div>

            {/* File Upload Zone */}
            {sourceType === 'upload' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Upload Resume File</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500/60 rounded-2xl p-6 bg-slate-50/40 text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-bold text-slate-700 block">
                    {uploadedFile ? uploadedFile.name : 'Choose a file or drag it here'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Supports PDF, DOCX, or TXT (Max 10MB)
                  </span>
                </div>
              </div>
            )}

            {/* Job Description Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Paste Job Description</label>
                {jdText && (
                  <button 
                    onClick={() => setJdText('')} 
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <textarea
                placeholder="Paste the target job description details here. Include role, requirements, and tech stack details for maximum matching accuracy..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={8}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-slate-700 leading-relaxed font-sans"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={runAnalysis}
              disabled={loading}
              className={`w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all ${
                loading ? 'opacity-90 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate Match Compatibility</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Dashboard Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analysis ? (
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden animate-fade-in-up">
              {/* Dashboard Navigation Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
                {[
                  { id: 'score', label: 'Match Score' },
                  { id: 'analysis', label: 'Strengths & Weaknesses' },
                  { id: 'keywords', label: 'Keyword Match' },
                  { id: 'versions', label: 'AI Optimized Resumes' },
                  { id: 'tips', label: 'Recruiter Tips' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2 px-1 text-center rounded-xl text-[10px] sm:text-xs font-extrabold transition-all border ${
                      activeTab === t.id
                        ? 'bg-white border-slate-200 text-blue-600 shadow-sm'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Panels */}
              <div className="p-6">
                
                {/* 1. Score Tab */}
                {activeTab === 'score' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      
                      {/* Original Score Dial */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="54" className="stroke-slate-200 fill-none" strokeWidth="8" />
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="54" 
                              className={`fill-none transition-all duration-1000 ${getScoreColor(analysis.match_score)}`} 
                              strokeWidth="8" 
                              strokeDasharray={`${2 * Math.PI * 54}`}
                              strokeDashoffset={`${2 * Math.PI * 54 * (1 - analysis.match_score / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-800">{analysis.match_score}%</span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Original</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center text-slate-300">
                        <ChevronRight className="w-6 h-6 stroke-[3]" />
                      </div>

                      {/* Optimized Score Dial */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="72" cy="72" r="60" className="stroke-slate-200 fill-none" strokeWidth="10" />
                            <circle 
                              cx="72" 
                              cy="72" 
                              r="60" 
                              className={`fill-none transition-all duration-1000 ${getScoreColor(analysis.updated_score)}`} 
                              strokeWidth="10" 
                              strokeDasharray={`${2 * Math.PI * 60}`}
                              strokeDashoffset={`${2 * Math.PI * 60 * (1 - (analysis.updated_score || 85) / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-slate-800">{analysis.updated_score || 85}%</span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Optimized
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Actionable Strategic Checklist */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-blue-500" />
                        Strategic Action Plan
                      </h3>
                      <div className="space-y-2">
                        {analysis.feedback.map((item, idx) => {
                          const itemKey = `feedback-${idx}`;
                          const isChecked = checkedItems[itemKey];
                          return (
                            <div 
                              key={itemKey}
                              onClick={() => setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-slate-50/50 border-slate-200 opacity-60 line-through text-slate-400' 
                                  : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border transition-all ${
                                isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isChecked && <span className="text-[10px] font-black">✓</span>}
                              </div>
                              <span className="text-xs font-semibold leading-relaxed">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses Tab */}
                {activeTab === 'analysis' && (
                  <div className="space-y-6 animate-fade-in text-slate-700">
                    {/* Industry and Grades Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-center p-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Industry</span>
                        <span className="text-sm font-extrabold text-slate-800">{analysis.detected_industry || 'General Professional'}</span>
                      </div>
                      <div className="text-center p-2 border-t sm:border-t-0 sm:border-x border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">ATS Parser Grade</span>
                        <span className={`text-sm font-black px-2 py-0.5 rounded ${analysis.ats_grade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {analysis.ats_grade || 'B'}
                        </span>
                      </div>
                      <div className="text-center p-2 border-t sm:border-t-0 border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Recruiter Impression</span>
                        <span className={`text-sm font-black px-2 py-0.5 rounded ${analysis.recruiter_grade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {analysis.recruiter_grade || 'B'}
                        </span>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Key Profile Strengths
                      </h3>
                      <div className="space-y-2">
                        {(analysis.strengths || []).map((strength, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start p-3 bg-emerald-50/20 border border-emerald-100/30 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs font-semibold">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Required Improvements (ATS & Recruiter Gaps)
                      </h3>
                      <div className="space-y-4">
                        {(analysis.weaknesses || []).map((weakness, idx) => (
                          <div key={idx} className="p-4 bg-amber-50/15 border border-amber-100/50 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2 border-b border-amber-100/40 pb-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <h4 className="text-xs font-bold text-slate-800">{weakness.title}</h4>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="font-extrabold text-slate-500 block text-[10px] uppercase">Why it&apos;s a weakness:</span>
                                <p className="text-slate-600 mt-0.5">{weakness.why_weak}</p>
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-500 block text-[10px] uppercase">How to improve:</span>
                                <p className="text-slate-600 mt-0.5">{weakness.how_to_improve}</p>
                              </div>
                              {weakness.example_improvement && (
                                <div className="bg-slate-900 text-slate-300 p-3 rounded-xl font-mono text-[10px] whitespace-pre-wrap leading-relaxed mt-1">
                                  <span className="text-blue-400 font-bold block mb-1">Recommended Phrasing:</span>
                                  {weakness.example_improvement}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Keywords Tab */}
                {activeTab === 'keywords' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Matched Keywords */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Matched Keywords ({(analysis.matched_skills || []).length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                        {(analysis.matched_skills || []).length > 0 ? (
                          (analysis.matched_skills || []).map((kw, i) => (
                            <span 
                              key={i} 
                              className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200/40"
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">No direct matches. We suggest optimizing your core terms.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        Missing Core Keywords ({(analysis.skills_to_emphasize || []).length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        {(analysis.skills_to_emphasize || []).length > 0 ? (
                          (analysis.skills_to_emphasize || []).map((kw, i) => (
                            <span 
                              key={i} 
                              className="bg-white border-2 border-dashed border-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg"
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">All critical keywords matched. Outstanding!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Versions Tab */}
                {activeTab === 'versions' && (
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      The AI generated 3 custom versions optimized for recruiter layout types. Review and select any version to load into the builder.
                    </p>

                    <div className="space-y-4">
                      {versions.map(v => {
                        const isExpanded = selectedVersionText === v.id;
                        return (
                          <div 
                            key={v.id} 
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all flex flex-col"
                          >
                            <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                              <div>
                                <h4 className="text-xs font-black text-slate-800 capitalize">
                                  {(v.title || '').replace('-', ' ')} Profile
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                  ATS optimized configuration
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedVersionText(isExpanded ? null : v.id)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 rounded-lg transition-all"
                                  title="Preview content outline"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownload(v.content, `Optimized_Resume_${v.title}`, 'pdf')}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 rounded-lg transition-all"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleLoadVersionIntoBuilder(v.content)}
                                  className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all"
                                >
                                  Load Builder
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-4 bg-slate-900 border-t border-slate-800 animate-slide-down">
                                <pre className="font-mono text-[9px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[300px]">
                                  {v.content}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Tips Tab */}
                {activeTab === 'tips' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-4">
                      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/60 space-y-2">
                        <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                          <Info className="w-4 h-4" />
                          How Recruiters Evaluate This Role
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                          Recruiters scanning resumes in this field look for direct evidence of tools applied in high-throughput settings. When listing your skill inventory, place languages first followed by frameworks, avoiding vague soft-skill filler words like &quot;hardworker&quot;.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" />
                          ATS Parsing Compatibility Rules
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                          Most corporate companies use ATS parsers that cannot extract content placed in text boxes, complex columns, or tables. Ensure you use standard header terms (e.g. WORK EXPERIENCE instead of &quot;My Career Story&quot;) and export in standard PDF formats.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 border border-slate-200/60 rounded-3xl text-center">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-600">Pending Compatibility Check</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Paste the job listing requirements and execute the scan to calculate your match score, missing skills, and optimized drafts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
