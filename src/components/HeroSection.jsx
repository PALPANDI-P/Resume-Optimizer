import React, { memo } from 'react';
import { FileText, Target, CheckCircle2, Sparkles, ArrowRight, Star } from 'lucide-react';

const HeroSection = memo(function HeroSection({ onGetStarted, onAnalyzeResume }) {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

      {/* Floating Resume Icons */}
      <div className="absolute top-12 left-[10%] text-blue-600/20 animate-float-1 hidden lg:block">
        <FileText className="w-14 h-14 transform -rotate-12" />
      </div>
      <div className="absolute top-36 right-[12%] text-blue-500/30 animate-float-2 hidden lg:block">
        <Target className="w-16 h-16 transform rotate-12" />
      </div>
      <div className="absolute bottom-32 left-[20%] text-blue-400/25 animate-float-3 hidden lg:block">
        <Sparkles className="w-10 h-10 transform rotate-45" />
      </div>
      <div className="absolute top-48 right-[6%] text-blue-500/20 animate-float-2 hidden xl:block">
        <Star className="w-10 h-10" />
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-left">
            {/* Brand Tag */}
            <div className="inline-block bg-blue-600 text-white font-medium rounded-full px-4 py-1.5 text-xs mb-6">
              Resume Optimizer
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
              <span className="text-gradient">Build. Analyze. Optimize.</span>
              <br />
              Land the Job.
            </h1>

            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
              Upload your resume, paste a job description, and get AI-powered optimization — complete with ATS analysis, keyword matching, and 3 tailored resume versions. 100% free.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={onGetStarted}
                className="btn-primary-blue text-base px-10 py-4 !rounded-full group"
                id="hero-cta-primary"
              >
                Create Your Resume
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onAnalyzeResume}
                className="btn-outline-blue text-base px-8 py-4 !rounded-full"
                id="hero-cta-secondary"
              >
                Analyze Your Resume
              </button>
            </div>

            <p className="text-sm text-slate-400">No account or credit card required. Your data stays private.</p>
          </div>

          {/* Right Column - Visual Preview Card */}
          <div className="hidden lg:block relative">
            <div className="relative mx-auto w-full max-w-md">
              {/* Main Resume Card */}
              <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/50 p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Resume Preview Mockup */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Sarah Johnson</h3>
                    <p className="text-xs text-blue-600 font-semibold">Senior Software Engineer</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Full-stack developer with 5+ years of experience building scalable web applications using React, Node.js, and cloud technologies.
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-md">React</span>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded-md">Node.js</span>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                        <Target className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Experience</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">• Lead Developer, Tech Corp</p>
                    <p className="text-[11px] text-slate-400">2020 - Present</p>
                  </div>
                </div>
              </div>

              {/* Background Color Panel */}
              <div className="absolute -left-16 top-16 bg-white rounded-xl shadow-xl border border-slate-200/50 p-3 w-44 transform -rotate-3 animate-float-3">
                <p className="text-xs font-bold text-slate-700 mb-2">Backgrounds</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-[10px] text-slate-500">Apply color to background</span>
                </div>
                <div className="flex gap-1.5">
                  {['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'].map(c => (
                    <div key={c} className="w-5 h-5 rounded-md cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="flex flex-wrap justify-center gap-8 mt-20 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Free forever</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">ATS-optimized</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Star className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">AI-powered</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HeroSection;