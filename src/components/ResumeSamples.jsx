import React, { memo } from 'react';
import { Target, Users, Scale, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

const VERSION_CONFIG = {
  v1: {
    icon: Target,
    label: 'ATS Optimized',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-500', icon: 'text-blue-600', ring: 'ring-blue-200', gradient: 'from-blue-500 to-blue-500' },
    tagIcon: Shield,
  },
  v2: {
    icon: Users,
    label: 'Recruiter Focused',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600', icon: 'text-blue-600', ring: 'ring-blue-200', gradient: 'from-blue-500 to-blue-600' },
    tagIcon: Sparkles,
  },
  v3: {
    icon: Scale,
    label: 'Balanced Pro',
    color: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-600', icon: 'text-indigo-600', ring: 'ring-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
    tagIcon: Zap,
  },
};

const ResumeCard = memo(function ResumeCard({ version, onSelect }) {
  const config = VERSION_CONFIG[version.id] || VERSION_CONFIG.v1;
  const Icon = config.icon;
  const TagIcon = config.tagIcon;

  return (
    <div
      className="glass-card glass-card-hover p-6 sm:p-7 cursor-pointer animate-fade-in-up group"
      onClick={() => onSelect(version)}
      id={`resume-card-${version.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className={`w-14 h-14 rounded-2xl ${config.color.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-7 h-7 ${config.color.icon}`} />
        </div>
        <span className={`px-3 py-1 ${config.color.badge} text-white text-xs font-bold rounded-full flex items-center gap-1.5`}>
          <TagIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-slate-900">{version.title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2">{version.description}</p>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
          <span>Preview & Select</span>
          <ArrowRight className="w-4 h-4" />
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="w-4 h-4 text-blue-500" />
        </div>
      </div>
    </div>
  );
});

const ResumeSamples = memo(function ResumeSamples({ versions, onSelect }) {
  return (
    <div className="animate-fade-in-up" id="resume-samples">
      <div className="text-center mb-8">
        <div className="section-divider mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Choose Your Version</h2>
        <p className="text-slate-400 text-sm sm:text-base">3 tailored resumes generated. Select one to preview and download.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {versions.map((version) => (
          <ResumeCard
            key={version.id}
            version={version}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
});

export default ResumeSamples;
