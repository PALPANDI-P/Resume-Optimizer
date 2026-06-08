import React, { useState } from 'react';
import { ChevronLeft, Layout, X, Palette } from 'lucide-react';
import ResumePreview from './ResumePreview';
import TemplateSelector from './TemplateSelector';
import { serializeResume } from '../utils/resumeSerializer';

export default function ResumePreviewPage({ data, onBackToEdit, onTemplateChange }) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Null guard — prevent crash if data is missing
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">No Resume Data</h2>
          <p className="text-slate-400 text-sm">Please create or load a resume first.</p>
          <button
            onClick={onBackToEdit}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            Go to Builder
          </button>
        </div>
      </div>
    );
  }

  // Serialize the builder data for the parser in ResumePreview
  const version = {
    content: serializeResume(data),
    title: 'Optimized Resume'
  };

  const handleTemplateSelect = (templateId) => {
    onTemplateChange(templateId);
    setShowTemplateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col animate-fade-in">
      {/* Top Header Controls */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToEdit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Editor
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Resume Preview</h1>
            <p className="text-xs text-slate-400">Review, customize style and download your resume</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Layout className="w-4.5 h-4.5" />
            Change Template
          </button>
        </div>
      </header>

      {/* Main Content View (wraps the original preview controls and document) */}
      <main className="flex-1 bg-slate-950 p-6 md:p-10 flex flex-col items-center justify-start overflow-y-auto">
        <div className="w-full max-w-7xl">
          <ResumePreview
            version={version}
            templateId={data.template_id || 'cc-001'}
            photoFile={null}
            onBack={onBackToEdit}
            onTemplateChange={onTemplateChange}
            hideBackBtn={true}
          />
        </div>
      </main>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Palette className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-base">Select Resume Design</span>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900/50">
              <TemplateSelector
                selectedTemplateId={data.template_id}
                onSelect={handleTemplateSelect}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-sm font-bold transition-all"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
