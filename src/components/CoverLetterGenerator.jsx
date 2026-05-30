import React, { useState } from 'react';
import { FileText, Loader2, Wand2, Copy, CheckCircle2 } from 'lucide-react';

export default function CoverLetterGenerator({ resumeText, jdText }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [docType, setDocType] = useState('cover_letter');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLetter = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, jd_text: jdText, doc_type: docType })
      });
      if (!res.ok) throw new Error('Failed to generate outreach message');
      const data = await res.json();
      setCoverLetter(data.cover_letter);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDocTypeLabel = () => {
    switch (docType) {
      case 'hr_email': return 'HR Outreach Email';
      case 'recruiter_message': return 'Recruiter Message';
      case 'linkedin_note': return 'LinkedIn Connection Note';
      default: return 'Cover Letter';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Outreach Generator</h3>
            <p className="text-sm text-slate-500">Instantly generate tailored cover letters and outreach templates.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            disabled={loading}
            className="text-sm font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl py-2 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            <option value="cover_letter">Cover Letter</option>
            <option value="hr_email">HR Outreach Email</option>
            <option value="recruiter_message">Recruiter Message</option>
            <option value="linkedin_note">LinkedIn Note</option>
          </select>

          <button 
            onClick={generateLetter}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm font-bold shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>

      {coverLetter && (
        <div className="animate-fade-in-up">
          <div className="relative bg-slate-50 p-6 rounded-xl border border-slate-200 mb-4 whitespace-pre-wrap font-serif text-slate-700 leading-relaxed text-sm md:text-base">
            <div className="absolute top-4 left-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">
              Generated {getDocTypeLabel()}
            </div>
            <button 
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <div className="pt-6">
              {coverLetter}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Review and tweak the placeholders before sending.</p>
            <button 
              onClick={generateLetter}
              disabled={loading}
              className="text-sm text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}