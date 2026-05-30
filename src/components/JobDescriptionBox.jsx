import React, { memo, useRef } from 'react';
import { Clipboard, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const JobDescriptionBox = memo(function JobDescriptionBox({ jdText, setJdText }) {
  const textareaRef = useRef(null);
  const wordCount = jdText.trim() ? jdText.split(/\s+/).filter(Boolean).length : 0;
  const isGoodLength = wordCount >= 50;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setJdText(text);
    } catch {
      // Clipboard API may be denied
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8" id="jd-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20">
          <Clipboard className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">Job Description</h2>
          <p className="text-sm text-slate-400">Paste the full job posting</p>
        </div>
        {/* Quick paste button */}
        <button
          onClick={handlePaste}
          className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
          id="clipboard-paste-btn"
        >
          Paste from Clipboard
        </button>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here... Include requirements, responsibilities, and qualifications for best results."
          className="input-field h-44 resize-none text-sm leading-relaxed"
          id="jd-textarea"
        />
        {!jdText && (
          <div className="absolute top-3 right-3">
            <Sparkles className="w-4 h-4 text-slate-300" />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {jdText.length > 0 ? (
            <>
              {isGoodLength ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{wordCount} words — Great length!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{wordCount} words — Aim for 50+ for best results</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">Minimum 50 words recommended</p>
          )}
        </div>
        {jdText.length > 0 && (
          <button
            onClick={() => setJdText('')}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
            id="clear-jd"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
});

export default JobDescriptionBox;
