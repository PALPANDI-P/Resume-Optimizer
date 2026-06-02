import React, { useState, useMemo, useCallback } from 'react';
import { Search, CheckCircle2, Grid, Sparkles, Filter, X } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../constants/templates';
import { normalizeData } from '../utils/resumeSerializer';
import TemplateThumbnail from './TemplateThumbnail';

// ─── PREMIUM TEMPLATE GALLERY ──────────────────────────────────────────────
// Two-tier category navigation: Group dropdown → Category pills
// Large preview cards with instant template application

const TemplateGallery = ({ activeTemplateId, onSelectTemplate, currentBuilderData, setBuilderData, onViewChange, templatesList }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [limit, setLimit] = useState(18);

  const templates = templatesList || TEMPLATES;

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(t =>
        (t.categories && t.categories.includes(activeCategory)) || t.category === activeCategory
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.archetype.toLowerCase().includes(q) ||
        (t.categories && t.categories.some(c => c.replace(/-/g, ' ').includes(q)))
      );
    }

    return result;
  }, [search, activeCategory, templates]);

  const visibleTemplates = useMemo(() => {
    return filteredTemplates.slice(0, limit);
  }, [filteredTemplates, limit]);

  const handleCategoryChange = useCallback((catId) => {
    setActiveCategory(catId);
    setLimit(18);
  }, []);

  const handleApply = useCallback((templateId) => {
    onSelectTemplate(templateId);

     const isEmpty = !currentBuilderData ||
                     !currentBuilderData.personal ||
                     (!currentBuilderData.personal.name && !currentBuilderData.summary && (!currentBuilderData.experience || currentBuilderData.experience.length === 0));

     if (isEmpty) {
       setBuilderData({
         ...normalizeData(null),
         template_id: templateId
       });
     } else {
       setBuilderData(prev => ({
         ...prev,
         template_id: templateId
       }));
     }

    onViewChange('builder');
  }, [onSelectTemplate, currentBuilderData, setBuilderData, onViewChange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full text-blue-700 text-xs font-bold mb-4 border border-blue-100">
          <Sparkles className="w-3.5 h-3.5" />
          {templates.length} Premium Templates
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
          Professional Resume Templates
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
          Browse our library of {templates.length} professionally designed, ATS-friendly resume templates.
          Each template is crafted for specific careers, industries, and experience levels.
        </p>
      </div>

      {/* ─── CONTROLS BAR ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm mb-8 overflow-hidden">
        {/* Search + Stats Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border-b border-slate-100">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, style, or career..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLimit(18); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>{filteredTemplates.length} templates</span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="p-4 bg-slate-50/30 flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map(cat => {
            const count = TEMPLATES.filter(t =>
              cat.id === 'all'
                ? true
                : (t.categories && t.categories.includes(cat.id)) || t.category === cat.id
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 border flex items-center gap-2
                  ${activeCategory === cat.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/15'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                  activeCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TEMPLATE GRID ───────────────────────────────────────────────── */}
      {visibleTemplates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTemplates.map(t => {
              const isSelected = activeTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group duration-300 relative flex flex-col ${
                    isSelected ? 'border-blue-600 ring-4 ring-blue-500/10' : 'border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  {/* Template Preview */}
                  <div className="relative bg-slate-50/30 p-4 aspect-[1/1.414] overflow-hidden border-b border-slate-100 flex items-center justify-center">
                    <TemplateThumbnail template={t} isSelected={isSelected} data={currentBuilderData} />

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6">
                      <button
                        onClick={() => handleApply(t.id)}
                        className="w-full max-w-[200px] py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Apply Template
                      </button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{t.name}</h4>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 font-extrabold text-[9px] uppercase tracking-wider rounded border border-green-200">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {(t.categories || []).slice(0, 3).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-[2px] bg-slate-50 border border-slate-200/80 text-slate-500 rounded text-[9px] font-bold capitalize"
                          >
                            {cat.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border bg-blue-50/70 border-blue-200/50 text-blue-600">
                          {(t.styles.layout || '').replace(/-/g, ' ')}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold capitalize">
                          {(t.archetype || '').replace(/-/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {filteredTemplates.length > limit && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setLimit(prev => prev + 18)}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 text-sm font-bold rounded-xl shadow-sm transition-all hover:shadow-md"
              >
                Load More Templates ({filteredTemplates.length - limit} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl">
          <Grid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Templates Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Try refining your search or changing categories.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:border-slate-300 transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
