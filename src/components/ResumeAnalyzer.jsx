import React, { memo, useEffect, useState, useRef } from "react";
import {
  Zap, Target, AlertCircle, CheckCircle2, Search, TrendingUp
} from "lucide-react";

// Mini Radar Chart for analysis results
function MiniRadarChart({ scores, size = 200 }) {
  const center = size / 2;
  const maxRadius = size * 0.38;
  const levels = 3;
  const angles = [0, 1, 2, 3, 4].map((i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);
  const getPoint = (angle, radius) => ({ x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius });
  const gridLevels = Array.from({ length: levels }, (_, i) => { const r = (maxRadius / levels) * (i + 1); return angles.map((a) => getPoint(a, r)).map((p) => `${p.x},${p.y}`).join(" "); });
  const scoreValues = [scores.format, scores.keywords, scores.content, scores.sections, scores.technical];
  const dataPoints = scoreValues.map((s, i) => getPoint(angles[i], (s / 100) * maxRadius));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((points, i) => (<polygon key={i} points={points} fill="none" stroke="#e2e8f0" strokeWidth={0.8} />))}
      {angles.map((a, i) => { const ep = getPoint(a, maxRadius); return <line key={i} x1={center} y1={center} x2={ep.x} y2={ep.y} stroke="#e2e8f0" strokeWidth={0.5} />; })}
      <polygon points={dataPolygon} fill="rgba(45, 212, 191, 0.15)" stroke="#2dd4bf" strokeWidth={2} className="radar-polygon" />
      {dataPoints.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r={4} fill="#2dd4bf" stroke="white" strokeWidth={2} />))}
    </svg>
  );
}

const ResumeAnalyzer = memo(function ResumeAnalyzer({ resumeText, jdText }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const scoreRef = useRef(null);
  const actionVerbs = ["managed","led","developed","implemented","increased","created","designed","optimized","spearheaded","achieved","coordinated","transformed","negotiated","presented","launched","automated","scaled","reduced","delivered","architected","mentored","streamlined","pioneered"];
  const keywords = jdText.toLowerCase().split(/[,\s.]+/).filter((w) => w.length > 4);
  const foundKeywords = keywords.filter((k) => resumeText.toLowerCase().includes(k));
  const uniqueKeywords = [...new Set(keywords)];
  const uniqueFound = [...new Set(foundKeywords)];
  const foundVerbs = actionVerbs.filter((v) => resumeText.toLowerCase().includes(v));
  const hasNumbers = (resumeText.match(/\d+%/g) || []).length;
  const bulletCount = (resumeText.match(/[•\-*]\s/g) || []).length;

  const keywordAlignmentScore = uniqueFound.length > 0 ? Math.min(40, Math.round((uniqueFound.length / Math.max(1, uniqueKeywords.length)) * 40)) : 0;
  const verbRichnessScore     = Math.min(25, foundVerbs.length * 3);
  const quantificationScore   = Math.min(20, hasNumbers * 8);
  const structureClarityScore  = bulletCount > 3 ? 15 : bulletCount * 3;
  const totalScore = Math.min(100, Math.round(keywordAlignmentScore + verbRichnessScore + quantificationScore + structureClarityScore));

  const radarScores = {
    format:    Math.min(100, 50 + structureClarityScore + (bulletCount > 5 ? 15 : 0)),
    keywords:  Math.min(100, Math.round((uniqueFound.length / Math.max(1, uniqueKeywords.length)) * 100)),
    content:   Math.min(100, Math.round((foundVerbs.length / Math.max(1, actionVerbs.length)) * 70 + hasNumbers * 8)),
    sections:  Math.min(100, Math.min(90, 55 + bulletCount * 6)),
    technical: Math.min(100, Math.min(95, 55 + hasNumbers * 10)),
  };

  useEffect(() => {
    const duration = 1500, start = performance.now();
    const animate = (now) => {
      const elapsed = now - start, progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(totalScore * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [totalScore]);

  const getScoreLabel = () => {
    if (totalScore >= 80) return 'Strong alignment \u2014 well above the typical screening threshold.';
    if (totalScore >= 60) return 'Good alignment \u2014 room to strengthen a few areas.';
    return 'Review the recommendations below to improve your alignment.';
  };



  return (
    <div className="glass-card p-8 sm:p-10 mb-10 relative overflow-hidden shadow-premium" id="resume-analyzer">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl -ml-32 -mb-32" />
      <div className="relative z-10">
        <div className="text-center mb-10">
          <div className="section-divider mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Resume Impact Analysis</h2>
          <p className="text-slate-500 text-sm">Comprehensive evaluation across 5 critical dimensions</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex flex-col items-center lg:w-2/5">
            <div className="relative w-48 h-48 group mb-6" ref={scoreRef}>
              <div className="absolute inset-0 rounded-full blur-2xl opacity-15 bg-blue-500 group-hover:opacity-25 transition-all duration-700" />
              <svg className="w-full h-full transform -rotate-90 relative">
                <circle cx="96" cy="96" r="82" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                <circle cx="96" cy="96" r="82" stroke="url(#scoreGradient)" strokeWidth="14" fill="transparent" strokeLinecap="round" strokeDasharray={515} strokeDashoffset={515 - (515 * animatedScore) / 100} className="transition-all duration-1000 ease-out" />
                <defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900 leading-none">{animatedScore}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Impact Score</span>
              </div>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-1">{totalScore >= 80 ? "Outstanding Match" : totalScore >= 60 ? "Strong Contender" : "Needs Optimization"}</h3>
              <p className="text-xs text-slate-500 font-medium">{getScoreLabel()}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <MiniRadarChart scores={radarScores} />
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {[
                  { label: "Format", color: "bg-blue-400" },
                  { label: "Keywords", color: "bg-blue-400" },
                  { label: "Content", color: "bg-blue-500" },
                  { label: "Sections", color: "bg-indigo-400" },
                  { label: "Technical", color: "bg-blue-300" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow" id="metric-keywords">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Search className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keywords</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{uniqueFound.length}<span className="text-slate-300">/{uniqueKeywords.length}</span></div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill bg-blue-500" style={{ width: `${(uniqueFound.length / Math.max(1, uniqueKeywords.length)) * 100}%` }} />
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow" id="metric-verbs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Zap className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Verbs</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{foundVerbs.length}</div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill bg-blue-500" style={{ width: `${Math.min(100, (foundVerbs.length / Math.max(1, actionVerbs.length)) * 100)}%` }} />
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow" id="metric-quantified">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantified</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{hasNumbers}</div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill bg-amber-500" style={{ width: `${Math.min(100, hasNumbers * 20)}%` }} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />Keyword Match Analysis</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueFound.slice(0, 20).map((k) => (
                  <span key={k} className="px-3 py-1.5 bg-blue-500 text-white text-[11px] font-bold rounded-full">? {k}</span>
                ))}
                {uniqueKeywords.filter((k) => !uniqueFound.includes(k)).slice(0, 10).map((k) => (
                  <span key={k} className="px-3 py-1.5 bg-slate-100 text-slate-400 text-[11px] font-medium rounded-full border border-dashed border-slate-200">{k}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Strategic Recommendations</h5>
              <ul className="space-y-3">
                {foundKeywords.length < keywords.length / 2 && (<li className="flex items-start gap-3 text-sm text-slate-600"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><span>Incorporate more job-specific terminology to improve ATS matching.</span></li>)}
                {hasNumbers < 3 && (<li className="flex items-start gap-3 text-sm text-slate-600"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><span>Add quantified achievements (e.g. &quot;increased sales by 20%&quot;) to strengthen impact.</span></li>)}
                <li className="flex items-start gap-3 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><span>Your resume formatting is optimized for ATS parsing.</span></li>
                {foundVerbs.length >= 5 && (<li className="flex items-start gap-3 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><span>Strong action-verb usage — great for recruiter engagement.</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ResumeAnalyzer;
