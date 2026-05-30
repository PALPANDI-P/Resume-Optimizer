import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Star, ArrowRight, X, Sparkles, User, FileText } from 'lucide-react';
import { CATEGORIES, getResumeExamples } from '../constants/resumeExamples';
import { TEMPLATES } from '../constants/templates';
import ResumePreview from './ResumePreview';

export default function ExampleLibrary({ onSelectExample, onViewChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedExample, setSelectedExample] = useState(null);
  const [limit, setLimit] = useState(12);

  // Retrieve all 210 examples
  const allExamples = useMemo(() => getResumeExamples(), []);

  // Filter list
  const filteredExamples = useMemo(() => {
    return allExamples.filter(ex => {
      const matchesSearch = 
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || ex.experienceLevel.toLowerCase() === selectedLevel.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allExamples, searchQuery, selectedCategory, selectedLevel]);

  const visibleExamples = useMemo(() => {
    return filteredExamples.slice(0, limit);
  }, [filteredExamples, limit]);

  const handleStartWithExample = (example) => {
    // Inject mock custom sections visibility etc.
    const fullResumeData = {
      ...example.data,
      visibleSections: {
        summary: true,
        experience: true,
        internships: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        achievements: true,
        languages: true,
        customSections: true
      }
    };
    onSelectExample(fullResumeData);
    setSelectedExample(null);
    onViewChange('builder');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Professional Resume Examples
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
          Browse our collection of 210 recruiter-approved resume templates across 15 industries. Select any template to review writing guidelines and load it instantly into your workspace.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Filters Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Search Profiles
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search job title, skills..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setLimit(12); }}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Level Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Experience Level
            </h3>
            <div className="flex flex-col gap-2">
              {['all', 'Entry', 'Mid', 'Senior'].map(level => (
                <button
                  key={level}
                  onClick={() => { setSelectedLevel(level); setLimit(12); }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    (level === 'all' && selectedLevel === 'all') || (selectedLevel === level)
                      ? 'bg-blue-50 text-blue-600 font-bold border-l-2 border-blue-500 pl-4'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 pl-3'
                  }`}
                >
                  {level === 'all' ? 'All Experience Levels' : `${level} Level`}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Industry Categories
            </h3>
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              <button
                onClick={() => { setSelectedCategory('all'); setLimit(12); }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 text-blue-600 font-bold border-l-2 border-blue-500 pl-4'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 pl-3'
                }`}
              >
                All Industries
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setLimit(12); }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 text-blue-600 font-bold border-l-2 border-blue-500 pl-4'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 pl-3'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Grid Pane */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredExamples.length} matches in library
            </span>
          </div>

          {visibleExamples.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {visibleExamples.map(ex => (
                <div
                  key={ex.id}
                  className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold text-[9px] uppercase tracking-wider rounded">
                        {ex.experienceLevel} Level
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {CATEGORIES.find(c => c.id === ex.category)?.label || ex.category}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {ex.title}
                    </h3>
                    
                    <p className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed">
                      {ex.summary}
                    </p>

                    {/* Skill Pills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {ex.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-slate-100/80 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedExample(ex)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleStartWithExample(ex)}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all group-hover:translate-x-0.5"
                    >
                      Start Builder
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-600">No Examples Match</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting filters or checking your search text.</p>
            </div>
          )}

          {/* Load More button */}
          {filteredExamples.length > limit && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setLimit(prev => prev + 12)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Load More Examples
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Detail Modal */}
      {selectedExample && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center relative">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                  {selectedExample.experienceLevel} Level • {CATEGORIES.find(c => c.id === selectedExample.category)?.label}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">{selectedExample.title}</h2>
              </div>
              <button
                onClick={() => setSelectedExample(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side details */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Profile Summary */}
                  <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Professional Summary
                    </h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {selectedExample.summary}
                    </p>
                  </div>

                  {/* Skills Tags */}
                  <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Key Skills Showcase
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedExample.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-lg border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Best Writing Practices */}
                  <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      Recruiter Guidelines &amp; Best Practices
                    </h4>
                    <ul className="space-y-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-emerald-800">
                      {selectedExample.bestPractices.map((bp, idx) => (
                        <li key={idx} className="text-xs flex gap-2 items-start font-medium">
                          <span className="mt-0.5 text-emerald-500 font-bold">✓</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right side full-page scrollable paper preview */}
                <div className="lg:col-span-5 flex flex-col h-[50vh] lg:h-auto min-h-[400px]">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2 mb-3 px-1 shrink-0">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Full Resume Preview
                  </h4>
                  <div className="flex-1 min-h-0 bg-slate-900 rounded-2xl shadow-lg border border-slate-700 overflow-hidden flex flex-col">
                    <ResumePreview
                      version={{
                        content: selectedExample.textContent,
                        title: selectedExample.title
                      }}
                      templateId={TEMPLATES[0].id}
                      hideBackBtn={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/60 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setSelectedExample(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 rounded-xl hover:bg-slate-100 bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartWithExample(selectedExample)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                Load into Resume Builder
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
