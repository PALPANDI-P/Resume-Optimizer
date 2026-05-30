import React from 'react';
import { X, Sparkles, Star, CheckCircle2, Heart, FileText, ArrowRight } from 'lucide-react';

export default function FeatureModal({ featureId, onClose }) {
  if (!featureId) return null;

  const renderContent = () => {
    switch (featureId) {
      case 'premium':
        return (
          <div className="p-6 sm:p-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">100% Free Advanced Tools</h2>
            <p className="text-slate-500 mb-8">All optional tools are provided at no cost. A subscription is never required.</p>
            <div className="space-y-4 mb-8">
              {[
                'Unlimited AI Resume Generations',
                'Advanced ATS Keyword Injection',
                'Full Access to All Templates',
                'AI Chat Assistant',
                'Cover Letter Generator (Beta)',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
              Start Building Now
            </button>
          </div>
        );
      case 'examples':
        return (
          <div className="p-6 sm:p-8">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Star className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Resume Examples</h2>
            <p className="text-slate-500 mb-6">Browse professionally designed resume examples across different roles and writing styles. Use them as reference for your own resume.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { title: 'Software Engineer', tag: 'Engineering' },
                { title: 'Product Manager', tag: 'Technology' },
                { title: 'Digital Marketer', tag: 'Marketing' },
                { title: 'Finance Analyst', tag: 'Finance' },
              ].map((ex, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{ex.title}</h4>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{ex.tag}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="text-sm font-bold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors mx-auto">
              Browse the full examples library <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
      case 'cover-letter':
        return (
          <div className="p-6 sm:p-8">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Cover Letter Generator</h2>
            <p className="text-slate-500 mb-6">Generate a customized cover letter once your resume is created. The AI will match tone and content to your targeted job description.</p>
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl text-center mb-6">
              <FileText className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 mb-1">In Active Development</h4>
              <p className="text-xs text-slate-500">This feature is in active development and will be available after your resume is generated.</p>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Continue to Resume Builder</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-down">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors z-10">
          <X className="w-4 h-4" />
        </button>
        {renderContent()}
      </div>
    </div>
  );
}
