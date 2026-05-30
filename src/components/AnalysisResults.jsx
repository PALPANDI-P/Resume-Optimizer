import React, { memo, useEffect, useState } from 'react';
import { Target, CheckCircle2, Zap, ArrowRight, Lightbulb, ListChecks, Award } from 'lucide-react';

const AnalysisResults = memo(function AnalysisResults({ analysis, onModifyForJD }) {
  const { matched_skills, skills_to_emphasize, match_score, updated_score, feedback, changes_made } = analysis;
  const [animatedOriginal, setAnimatedOriginal] = useState(0);
  const [animatedUpdated, setAnimatedUpdated] = useState(0);

  const finalUpdated = updated_score || Math.min(match_score + 15, 100);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedOriginal(Math.round(match_score * eased));
      setAnimatedUpdated(Math.round(finalUpdated * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [match_score, finalUpdated]);

  const getScoreColor = (score) => {
    if (score >= 70) return { ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-blue-600', gradient: 'from-emerald-500 to-emerald-500' };
    if (score >= 40) return { ring: 'ring-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-500 to-yellow-500' };
    return { ring: 'ring-rose-200', bg: 'bg-rose-50', text: 'text-rose-600', gradient: 'from-rose-500 to-red-500' };
  };

  const originalColor = getScoreColor(match_score);

  return (
    <div className="glass-card p-6 sm:p-8 animate-fade-in-up border border-blue-100/50 mb-8 space-y-8" id="analysis-results">
      {/* Score Comparison */}
      <div className="grid md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 sm:p-8 rounded-2xl border border-slate-100">
        <div className="flex justify-center items-center gap-6 sm:gap-10">
          {/* Original Score */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">Before</div>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ring-4 ${originalColor.ring} ${originalColor.bg} shadow-sm`}>
              <div className={`text-3xl font-black ${originalColor.text}`}>{animatedOriginal}%</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="w-8 h-8 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-500 bg-emerald-50 px-2 py-0.5 rounded-full">
              +{finalUpdated - match_score}%
            </span>
          </div>

          {/* Updated Score */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-bold text-blue-500 mb-3 uppercase tracking-widest">After</div>
            <div className={`w-28 h-28 rounded-full flex items-center justify-center ring-4 ring-blue-200 bg-blue-50 shadow-lg shadow-blue-500/15`}>
              <div className="text-4xl font-black text-blue-600">{animatedUpdated}%</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-black text-slate-900">Optimization Summary</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">We analyzed your resume against the target job description. The updated score reflects the expected match rate after AI enhancements.</p>
          <p className="text-xs text-slate-500 mt-3">
            Match improvements help your resume pass automated screening and stand out to recruiters.
          </p>
        </div>
      </div>

      {/* Changes and Feedback */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100/60">
          <h4 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            Improvement Ideas
          </h4>
          <ul className="space-y-3">
            {feedback?.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-amber-900/80">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200/50 flex items-center justify-center text-[10px] font-bold text-amber-700 mt-0.5">{i + 1}</span>
                <span>{item}</span>
              </li>
            )) || (
              <li className="flex gap-3 text-sm text-amber-900/80">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></span>
                <span>Consider adding more quantified results to your bullet points so recruiters and ATS systems can quickly see your impact.</span>
              </li>
            )}
          </ul>
        </div>
        
        <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/60">
          <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-blue-600" />
            </div>
            Changes Applied
          </h4>
          <ul className="space-y-3">
            {changes_made?.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-blue-900/80">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            )) || (
               <li className="text-sm text-blue-900/80 italic">Resume content has been restructured and keywords aligned with the job description.</li>
            )}
          </ul>
        </div>
      </div>

      {onModifyForJD && (
        <div className="mt-6">
          <button
            onClick={onModifyForJD}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Target className="w-4 h-4" />
            Review Against Your Target Job
          </button>
        </div>
      )}

      {/* Skills columns */}
      <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Matched Skills ({matched_skills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {matched_skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                ✓ {skill}
              </span>
            ))}
            {matched_skills.length === 0 && (
              <span className="text-sm text-slate-400 italic">No matching skills found</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Skills to Emphasize ({skills_to_emphasize.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills_to_emphasize.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                + {skill}
              </span>
            ))}
            {skills_to_emphasize.length === 0 && (
              <span className="text-sm text-slate-400 italic">Your resume fully matches JD keywords</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AnalysisResults;
