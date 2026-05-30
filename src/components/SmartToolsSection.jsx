import React, { memo } from 'react';
import { 
  FileText, Sparkles, Shield, BookOpen, Heart,
  ArrowRight
} from 'lucide-react';

const TOOLS = [
  {
    icon: FileText,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Free Resume Maker',
    description: 'Create professional-quality resumes for free — no hidden fees or credit card required',
    actionId: 'workspace',
  },
  {
    icon: Sparkles,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Advanced Optimization — Free Forever',
    description: 'Resume analytics, keyword optimization, recruiter recommendations, and ATS guidance — all included at no charge.',
    actionId: 'premium',
  },
  {
    icon: Shield,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    title: 'ATS-Friendly Resume Templates',
    description: 'Our resumes are designed to pass applicant tracking systems, ensuring your resume gets in front of recruiters',
    actionId: 'templates',
  },
  {
    icon: BookOpen,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Resume Examples Library',
    description: 'Study professionally structured examples across different roles and industries to understand best practices. Use them as a guide for your own resume.',
    actionId: 'examples',
  },
  {
    icon: Heart,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    title: 'Matching Cover Letter Templates',
    description: 'Generate a personalized cover letter that matches your resume and the specific job you are applying for.',
    actionId: 'cover-letter',
  },
];

const SmartToolsSection = memo(function SmartToolsSection({ onToolClick }) {
  return (
    <section id="tools" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 leading-tight">
            Smart Job-Hunt Tools for the Modern Job-Seeker
          </h2>
          <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
            Everything you need to land your dream job, from resume building to interview preparation.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <button
                key={idx}
                onClick={() => onToolClick(tool.actionId)}
                className="feature-card group text-left"
                id={`smart-tool-${idx}`}
              >
                <div className={`feature-icon ${tool.iconBg}`}>
                  <Icon className={`w-7 h-7 ${tool.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {tool.description}
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 group-hover:text-blue-500 transition-colors">
                  Read
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default SmartToolsSection;