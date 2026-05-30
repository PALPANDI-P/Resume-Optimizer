import React, { memo, useState, useEffect } from 'react';
import { Loader2, FileText, Search, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { label: 'Parsing resume content', icon: FileText, duration: 3000 },
  { label: 'Extracting job keywords', icon: Search, duration: 5000 },
  { label: 'Optimizing for ATS compatibility', icon: Sparkles, duration: 8000 },
  { label: 'Generating 3 tailored versions', icon: CheckCircle2, duration: 12000 },
];

const LoadingState = memo(function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 95));
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="glass-card p-10 sm:p-14 animate-fade-in" id="loading-state">
      <div className="flex flex-col items-center text-center">
        {/* Animated Spinner */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-2">Crafting Your Perfect Resume</h3>
        <p className="text-slate-400 text-sm max-w-md mb-8">
          Our AI is analyzing your resume against the job description and generating 3 optimized versions...
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Processing...</span>
            <span className="text-xs font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="w-full max-w-sm space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                  ${isDone ? 'bg-blue-50/80 border border-blue-100' :
                    isActive ? 'bg-blue-50/80 border border-blue-100 scale-[1.02]' :
                    'bg-slate-50/60 border border-transparent'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDone ? 'bg-blue-600' : isActive ? 'bg-blue-500' : 'bg-slate-200'
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDone ? 'text-blue-700' : isActive ? 'text-blue-700' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
                {isDone && <span className="ml-auto text-[10px] font-bold text-blue-500">Done</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default LoadingState;
