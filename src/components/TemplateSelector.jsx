import React, { useState, useMemo, memo } from 'react';
import { Palette, Search, LayoutGrid, X } from 'lucide-react';
import TemplateThumbnail from './TemplateThumbnail';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../constants/templates';
import { PREMIUM_SAMPLE_DATA } from '../constants/templates';

const TemplateSelector = memo(function TemplateSelector({ selectedTemplateId, onSelect, templatesList }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(24);

  // Use provided sample data or fall back to the built-in premium sample data
  const previewData = PREMIUM_SAMPLE_DATA;

  const templates = templatesList || TEMPLATES;

  const filtered = useMemo(() => {
    let result = templates;

    if (activeCategory !== 'all') {
      result = result.filter(t =>
        (t.categories && t.categories.includes(activeCategory)) || t.category === activeCategory
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.archetype.toLowerCase().includes(q) ||
        (t.categories && t.categories.some(c => (c || '').replace(/-/g, ' ').includes(q)))
      );
    }

    return result;
  }, [searchQuery, activeCategory, templates]);

  const visibleTemplates = filtered.slice(0, limit);

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-1.5 flex items-center justify-center gap-2">
          <Palette className="w-5 h-5 text-blue-400" />
          Choose a Template
        </h2>
        <p className="text-slate-400 text-sm">{templates.length} professional designs across {TEMPLATE_CATEGORIES.length - 1} categories</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-6 animate-fade-in">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setLimit(24); }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border
              ${activeCategory === cat.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      {visibleTemplates.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {visibleTemplates.map(template => (
              <div key={template.id} onClick={() => onSelect(template.id)} className="cursor-pointer">
                <TemplateThumbnail
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  data={previewData}
                />
              </div>
            ))}
          </div>
          {filtered.length > limit && (
            <div className="flex justify-center">
              <button
                onClick={() => setLimit(prev => prev + 24)}
                className="px-6 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all hover:bg-slate-750"
              >
                Load More ({filtered.length - limit} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-medium text-slate-400">No templates match your search</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="mt-3 px-4 py-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
});

export default TemplateSelector;
