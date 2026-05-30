import React, { useState } from 'react';
import { Target, Loader2, Play, CheckCircle2 } from 'lucide-react';

export default function InterviewPrep({ resumeText, jdText }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, jd_text: jdText })
      });
      if (!res.ok) throw new Error('Failed to generate interview questions');
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Smart Interview Prep</h3>
            <p className="text-sm text-slate-500">Practice questions tailored to your profile.</p>
          </div>
        </div>
        {!questions.length && (
          <button 
            onClick={generateQuestions}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Generate Questions
          </button>
        )}
      </div>

      {questions.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="space-y-3 mb-6">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 hover:border-indigo-200 hover:shadow-md transition-all group">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0 group-hover:text-indigo-600" />
                <p className="text-slate-700 text-sm md:text-base font-medium">{q.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <h4 className="font-bold text-indigo-900 text-sm mb-1">💡 Pro Tip: Use the STAR Method</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Answer these questions by describing the <strong>S</strong>ituation, your <strong>T</strong>ask, the <strong>A</strong>ction you took, and the quantifiable <strong>R</strong>esult. Use our AI ChatBot if you need help structuring your answers!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
