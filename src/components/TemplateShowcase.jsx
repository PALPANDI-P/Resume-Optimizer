import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { TEMPLATES } from '../constants/templates';
import TemplateThumbnail from './TemplateThumbnail';

// Curated showcase: pick 1 template from each archetype to show diversity
const SHOWCASE_ARCHETYPES = [
  'classic-clean', 'modern-sidebar', 'executive-serif', 'executive-banner',
  'minimal-mono', 'minimal-accent', 'creative-blocks', 'creative-timeline',
  'two-column-balanced', 'academic-classic', 'ats-optimized', 'bold-header',
];

const FILTER_PILLS = [
  { id: 'all', label: 'All Styles' },
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'executive', label: 'Executive' },
  { id: 'ats', label: 'ATS-Friendly' },
  { id: 'academic', label: 'Academic' },
];

const TemplateShowcase = memo(function TemplateShowcase() {
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const showcaseTemplates = useMemo(() => {
    // Pick hero templates from diverse archetypes
    const heroes = [];
    for (const arch of SHOWCASE_ARCHETYPES) {
      const match = TEMPLATES.find(t => t.archetype === arch);
      if (match) heroes.push(match);
    }

    if (activeFilter === 'all') return heroes;

    const filterMap = {
      'modern': ['modern-sidebar', 'modern-sidebar-right', 'bold-header'],
      'classic': ['classic-clean', 'two-column-weighted', 'corporate-grid'],
      'creative': ['creative-blocks', 'creative-timeline', 'bold-header'],
      'minimal': ['minimal-mono', 'minimal-accent'],
      'executive': ['executive-serif', 'executive-banner', 'elegant-divider'],
      'ats': ['ats-optimized', 'classic-clean', 'compact-dense'],
      'academic': ['academic-classic', 'academic-modern'],
    };

    const archetypes = filterMap[activeFilter] || [];
    return heroes.filter(t => archetypes.includes(t.archetype));
  }, [activeFilter]);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
      updateScrollButtons();
    }
    return () => el?.removeEventListener('scroll', updateScrollButtons);
  }, [showcaseTemplates]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = dir === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section id="templates" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-xs font-bold mb-4 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            {TEMPLATES.length}+ Premium Templates
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 leading-tight">
            Professional Resume Templates for Every Career Path
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">
            Choose from our library of ATS-friendly, recruiter-approved resume templates.
            Designed to look stunning and, most importantly, get you hired.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className={`template-pill ${
                activeFilter === pill.id
                  ? 'template-pill-active'
                  : 'template-pill-inactive'
              }`}
              id={`template-filter-${pill.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Templates Carousel */}
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:shadow-xl transition-all"
              id="carousel-left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:shadow-xl transition-all"
              id="carousel-right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {showcaseTemplates.map((template) => (
              <div
                key={template.id}
                className="flex-shrink-0 w-[220px] snap-start relative group"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-400 rounded-full border-2 border-white shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <TemplateThumbnail template={template} isSelected={false} />
                <div className="mt-3 text-center">
                  <h4 className="text-sm font-bold text-slate-800">{template.name}</h4>
                  <p className="text-xs text-slate-400 capitalize">{template.archetype.replace(/-/g, ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default TemplateShowcase;
