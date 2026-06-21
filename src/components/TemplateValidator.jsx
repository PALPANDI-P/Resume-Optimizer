import React, { useState, useMemo, useCallback } from 'react';
import { Play, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Loader2, FlaskConical, BarChart3, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../constants/templates';
import { PREMIUM_SAMPLE_DATA } from '../constants/templates';

const ARCHETYPE_ATS_SCORE = {
  'ats-optimized': 98,
  'classic-clean': 95,
  'academic-classic': 94,
  'modern-banner': 88,
  'executive-banner': 90,
  'elegant-divider': 87,
  'two-column-balanced': 80,
  'two-column-weighted': 76,
  'sidebar-left': 75,
  'sidebar-right': 70,
  'corporate-grid': 72,
  'modern-sidebar': 73,
  'modern-sidebar-right': 68,
  'creative-timeline': 65,
  'timeline': 62,
  'grid-layout': 60,
};

const ARCHETYPE_RATIONALE = {
  'ats-optimized': 'Single column, no tables, standard headings — maximum ATS compatibility.',
  'classic-clean': 'Linear flow, standard sections, no graphics — passes all major ATS parsers.',
  'academic-classic': 'Conservative formatting, CV-standard — safe for academic/government ATS.',
  'modern-banner': 'Banner header is well-supported; body is single column with standard sections.',
  'executive-banner': 'Wide banner can reduce text-column space but remains single-column flow.',
  'elegant-divider': 'Divider lines are ATS-safe; avoid ornamental ligature characters.',
  'two-column-balanced': 'Most ATS systems read multi-column linearly; watch for content reordering.',
  'two-column-weighted': 'Weighted split can confuse parsers if sidebar precedes main content.',
  'sidebar-left': 'Left sidebar recognition varies by ATS; some parsers read sidebar last.',
  'sidebar-right': 'Right-side sidebar increases reordering risk on legacy ATS systems.',
  'corporate-grid': 'Grid cells may be read out of order; use standard heading tags in cells.',
  'modern-sidebar': 'Sidebar content may be displaced; main body content generally reads first.',
  'modern-sidebar-right': 'Right sidebar + grid increases reordering risk on older ATS.',
  'creative-timeline': 'Timeline connectors can be stripped; important content remains readable.',
  'timeline': 'Heavy graphical elements increase parsing complexity; test before submitting.',
  'grid-layout': 'Pure CSS grid has highest reordering risk; not recommended for strict ATS.',
};

function validateTemplate(template) {
  const issues = [];
  const warnings = [];
  const score = ARCHETYPE_ATS_SCORE[template.archetype] ?? 70;

  if (!template.styles) {
    issues.push('MISSING styles object');
    return { issues, warnings, score: 0, status: 'error' };
  }

  const s = template.styles;
  if (!s.headerColor) warnings.push('Missing header color');
  if (!s.accentColor) warnings.push('Missing accent color');
  if (!s.textColor) warnings.push('Missing text color');
  if (!s.layout) warnings.push('Missing layout type');
  if (!s.fontFamily) warnings.push('Missing primary font');
  if (!s.sectionOrder) warnings.push('Missing sectionOrder');

  if (['grid-layout', 'creative-timeline'].includes(template.archetype)) {
    warnings.push('Complex layout: test against Jobscan before submitting');
  }
  if (['sidebar-right', 'modern-sidebar-right'].includes(template.archetype)) {
    warnings.push('Right-side layout: verify sidebar content is not dropped by your target ATS');
  }
  if (s.spacingScale !== undefined && (s.spacingScale < 0.9 || s.spacingScale > 1.3)) {
    warnings.push('Unusual spacing scale may affect readability');
  }

  const criticalIssues = issues.filter(i => i.startsWith('MISSING'));
  const status = criticalIssues.length > 0 ? 'error' : issues.length > 0 ? 'warning' : warnings.length > 0 ? 'warning' : 'pass';

  return { issues, warnings, score, status };
}

const SAMPLE_PERSONAL = { name: 'Test User', role: 'Test Engineer', email: 'test@test.com', phone: '123-456-7890', location: 'City, ST', website: 'test.com', linkedin: 'linkedin.com/in/test' };
const SAMPLE_EXP = [{ id: 1, role: 'Software Engineer', company: 'TestCo', dates: '2020 – Present', location: 'City, ST', description: '- Built systems.\n- Led team of 3.\n- Improved performance by 40%.' }];
const SAMPLE_EDU = [{ id: 2, degree: 'B.S. Computer Science', school: 'Test University', dates: '2016 – 2020', honors: 'GPA: 3.8' }];
const SAMPLE_SKILLS = [{ id: 3, category: 'Languages', items: 'JavaScript, Python, Java' }];
const DEMO_DATA = { personal: SAMPLE_PERSONAL, summary: 'Experienced professional with strong technical skills.', experience: SAMPLE_EXP, education: SAMPLE_EDU, skills: SAMPLE_SKILLS, technicalSkills: [], softSkills: '', projects: [], certifications: [], achievements: [], awards: [], languages: [], publications: [], volunteerExperience: [], references: [], customSections: [], visibleSections: { summary: true, experience: true, education: true, skills: true }, template_id: null };

const TemplateValidator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [bulkTestResults, setBulkTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const filtered = useMemo(() => {
    let result = TEMPLATES;
    if (activeCategory !== 'all') {
      result = result.filter(t => t.categories?.includes(activeCategory) || t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q) || t.archetype.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery, activeCategory]);

  const runBulkTest = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setBulkTestResults(null);
    const results = [];
    const total = TEMPLATES.length;
    for (let i = 0; i < total; i++) {
      const template = TEMPLATES[i];
      await new Promise(r => setTimeout(r, 30));
      const validation = validateTemplate(template);
      const renderOk = !validation.issues.some(iss => iss.startsWith('MISSING') && !iss.includes('sectionOrder'));
      results.push({ template, validation, renderOk });
      setProgress(Math.round(((i + 1) / total) * 100));
    }
    setBulkTestResults(results);
    setIsRunning(false);
  }, []);

  const passCount = bulkTestResults?.filter(r => r.validation.status === 'pass').length ?? 0;
  const warnCount = bulkTestResults?.filter(r => r.validation.status === 'warning').length ?? 0;
  const errorCount = bulkTestResults?.filter(r => r.validation.status === 'error').length ?? 0;
  const avgScore = bulkTestResults ? Math.round(bulkTestResults.reduce((sum, r) => sum + r.validation.score, 0) / bulkTestResults.length) : 0;

  const AtsBadge = ({ score }) => {
    const pct = Math.min(100, Math.max(0, score));
    const color = pct >= 90 ? 'bg-green-100 text-green-800 border-green-200' : pct >= 75 ? 'bg-blue-100 text-blue-800 border-blue-200' : pct >= 60 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-red-100 text-red-800 border-red-200';
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${color}`}>
        <ShieldCheck className="w-2.5 h-2.5" />
        {pct}%
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-purple-600 text-xs font-bold mb-3 border border-purple-100">
          <FlaskConical className="w-3.5 h-3.5" />
          DEV: Template Validator
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Template Validation Report</h2>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
          Test all {TEMPLATES.length} templates for structural integrity and ATS compliance.
          <span className="text-slate-400"> For developer use only — hidden from regular users.</span>
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or archetype..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <select
          value={activeCategory}
          onChange={e => setActiveCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
        >
          {TEMPLATE_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={runBulkTest}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 shadow-md shadow-purple-200 whitespace-nowrap"
        >
          {isRunning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Testing...</> : <><Play className="w-3.5 h-3.5" />Bulk Test All</>}
        </button>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Running ATS compliance check...</span>
            <span className="text-xs font-bold text-purple-600">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%`, transition: 'width 0.3s ease-out' }}
            />
          </div>
        </div>
      )}

      {/* Bulk Test Results Summary */}
      {bulkTestResults && !isRunning && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-800">Bulk Test Summary</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-green-700">{passCount}</div>
              <div className="text-[10px] font-bold text-green-600 uppercase">Passed</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-amber-700">{warnCount}</div>
              <div className="text-[10px] font-bold text-amber-600 uppercase">Warnings</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-red-700">{errorCount}</div>
              <div className="text-[10px] font-bold text-red-600 uppercase">Errors</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-purple-700">{avgScore}%</div>
              <div className="text-[10px] font-bold text-purple-600 uppercase">Avg ATS Score</div>
            </div>
          </div>

          {errorCount > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Templates with Render Issues ({errorCount})
              </h4>
              {bulkTestResults.filter(r => r.validation.status === 'error').map(({ template, validation }) => (
                <div key={template.id} className="flex items-center gap-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-red-800">{template.name}</span>
                    <span className="text-[10px] text-red-600 ml-2">({template.id})</span>
                    <div className="text-[10px] text-red-600">{validation.issues.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {warnCount > 0 && (
            <details className="mt-3">
              <summary className="text-xs font-bold text-amber-700 cursor-pointer flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                View all warnings ({warnCount})
              </summary>
              <div className="mt-2 space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {bulkTestResults.filter(r => r.validation.status === 'warning').map(({ template, validation }) => (
                  <div key={template.id} className="flex items-center gap-3 p-2 bg-amber-50/60 rounded-lg border border-amber-100">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-slate-700">{template.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">ATS {validation.score}%</span>
                      <div className="text-[10px] text-slate-500">{validation.warnings.join('; ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Per-Archetype ATS Score Reference */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
        <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          ATS Compliance Scores by Archetype
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(ARCHETYPE_ATS_SCORE).map(([archetype, score]) => {
            const count = TEMPLATES.filter(t => t.archetype === archetype).length;
            const pct = Math.min(100, score);
            const color = pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-blue-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={archetype} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{archetype.replace(/-/g, ' ')}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${pct >= 90 ? 'bg-green-100 text-green-700' : pct >= 75 ? 'bg-blue-100 text-blue-700' : pct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {score}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[9px] text-slate-400">{count} templates · {ARCHETYPE_RATIONALE[archetype]?.split('—')[0]?.trim() || archetype}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Showing <strong>{filtered.length}</strong> of <strong>{TEMPLATES.length}</strong> templates</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map(tmpl => {
          const validation = bulkTestResults
            ? bulkTestResults.find(r => r.template.id === tmpl.id)?.validation
            : validateTemplate(tmpl);
          const score = validation?.score ?? ARCHETYPE_ATS_SCORE[tmpl.archetype] ?? 70;
          const status = validation?.status ?? 'pass';
          const isSelected = selectedTemplate?.id === tmpl.id;

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => setSelectedTemplate(isSelected ? null : tmpl)}
              className={`group relative rounded-2xl border-2 transition-all p-1.5 text-left ${
                isSelected ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100' : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm'
              }`}
            >
              <div className="relative">
                <div
                  className="aspect-[3/4] rounded-xl mb-1.5 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${tmpl.styles?.headerColor || '#1e293b'} 0%, ${tmpl.styles?.accentColor || '#3b82f6'} 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '6px 5px',
                    gap: '2px',
                  }}
                >
                  <div className="h-2 w-4/5 rounded-sm bg-white/90" />
                  <div className="h-0.5 w-full rounded-sm bg-white/40" />
                  <div className="h-0.5 w-11/12 rounded-sm bg-white/30" />
                  <div className="flex gap-1 mt-0.5">
                    <div className="flex-1 h-6 rounded-sm bg-white/25 flex flex-col gap-0.5 p-0.5">
                      <div className="h-0.5 w-full rounded-sm bg-white/40" />
                      <div className="h-0.5 w-4/5 rounded-sm bg-white/30" />
                      <div className="h-0.5 w-3/4 rounded-sm bg-white/25" />
                    </div>
                    <div className="flex-1 h-6 rounded-sm bg-white/20 flex flex-col gap-0.5 p-0.5">
                      <div className="h-0.5 w-full rounded-sm bg-white/35" />
                      <div className="h-0.5 w-3/4 rounded-sm bg-white/25" />
                      <div className="h-0.5 w-5/6 rounded-sm bg-white/20" />
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-0.5">
                    <div className="h-2 flex-1 rounded-sm" style={{ background: tmpl.styles?.accentColor || '#3b82f6', opacity: 0.6 }} />
                    <div className="h-2 flex-1 rounded-sm bg-white/20" />
                    <div className="h-2 flex-1 rounded-sm bg-white/15" />
                  </div>
                </div>
                <div className="absolute top-1 right-1">
                  {status === 'pass' ? (
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                  ) : status === 'warning' ? (
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </div>
              <div className="px-0.5 pb-0.5">
                <div className="text-[10px] font-bold text-slate-700 truncate">{tmpl.name}</div>
                <div className="text-[8px] text-slate-400 uppercase tracking-wider mb-1">{tmpl.archetype?.replace(/-/g, ' ')}</div>
                <AtsBadge score={score} />
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && !isRunning && (
        <div className="text-center py-16 text-slate-400 text-sm">
          No templates match your search. Try a different keyword or category.
        </div>
      )}

      {/* Selected Template Detail */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-800">{selectedTemplate.name}</h3>
              <button type="button" onClick={() => setSelectedTemplate(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><XCircle className="w-4 h-4" /></button>
            </div>
            <div
              className="aspect-[3/4] rounded-xl mb-4 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${selectedTemplate.styles?.headerColor || '#1e293b'} 0%, ${selectedTemplate.styles?.accentColor || '#3b82f6'} 100%)`,
              }}
            />
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="font-bold text-slate-500">ID</span><span className="font-mono text-slate-700">{selectedTemplate.id}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Archetype</span><span className="text-slate-700">{selectedTemplate.archetype}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Layout</span><span className="text-slate-700">{selectedTemplate.styles?.layout}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Header Type</span><span className="text-slate-700">{selectedTemplate.styles?.headerType}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Divider</span><span className="text-slate-700">{selectedTemplate.styles?.dividerStyle}</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">Spacing</span><span className="text-slate-700">{selectedTemplate.styles?.spacingScale}x</span></div>
              <div className="flex justify-between"><span className="font-bold text-slate-500">ATS Score</span><AtsBadge score={ARCHETYPE_ATS_SCORE[selectedTemplate.archetype] ?? 70} /></div>
            </div>
            <div className="mt-3 p-2 bg-slate-50 rounded-lg text-[10px] text-slate-500 leading-relaxed">
              {ARCHETYPE_RATIONALE[selectedTemplate.archetype] || 'No rationale available for this archetype.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateValidator;
