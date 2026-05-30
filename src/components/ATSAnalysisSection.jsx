import React, { memo, useState, useEffect, useRef } from 'react';
import { 
  LayoutGrid, Search, Star, Grid3X3, Settings2, ArrowRight,
  CheckCircle2
} from 'lucide-react';

// Radar/Pentagon chart - SVG based
function ATSRadarChart({ scores, animated }) {
  // scores = { format: 0-100, keywords: 0-100, content: 0-100, sections: 0-100, technical: 0-100 }
  const size = 240;
  const center = size / 2;
  const maxRadius = 90;
  const levels = 4;

  // 5 axes at equal angles (72° apart), starting from top
  const angles = [0, 1, 2, 3, 4].map(i => (Math.PI * 2 * i) / 5 - Math.PI / 2);

  const getPoint = (angle, radius) => ({
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  });

  // Grid levels
  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const r = (maxRadius / levels) * (i + 1);
    const points = angles.map(a => getPoint(a, r));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Data polygon
  const scoreValues = [
    scores.format || 0,
    scores.keywords || 0,
    scores.content || 0,
    scores.sections || 0,
    scores.technical || 0,
  ];
  const dataPoints = scoreValues.map((s, i) => {
    const r = (s / 100) * maxRadius;
    return getPoint(angles[i], r);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Axis lines
  const axisEndpoints = angles.map(a => getPoint(a, maxRadius));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid */}
      {gridLevels.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={i === levels - 1 ? 1.5 : 0.8}
          opacity={0.6}
        />
      ))}

      {/* Axes */}
      {axisEndpoints.map((ep, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={ep.x}
          y2={ep.y}
          stroke="#e2e8f0"
          strokeWidth={0.8}
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(37,99,235,0.12)"
        stroke="#2563eb"
        strokeWidth={2.5}
        className={animated ? 'radar-polygon' : ''}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={5}
          fill="#2563eb"
          stroke="white"
          strokeWidth={2}
          className={animated ? 'radar-polygon' : ''}
        />
      ))}
    </svg>
  );
}

const AREAS = [
  {
    id: 'format',
    icon: LayoutGrid,
    title: 'Format & Structure',
    description: "We scan your resume's structure to ensure it follows ATS-readable patterns that won't confuse parsing algorithms.",
  },
  {
    id: 'keywords',
    icon: Search,
    title: 'Keywords & Relevance',
    description: 'We analyze keyword density and placement to maximize your match score against job descriptions.',
  },
  {
    id: 'content',
    icon: Star,
    title: 'Content Quality',
    description: 'We evaluate the strength of your bullet points, action verbs, and quantified achievements.',
  },
  {
    id: 'sections',
    icon: Grid3X3,
    title: 'Section Organization',
    description: 'We verify that your resume sections are properly ordered and formatted for maximum impact.',
  },
  {
    id: 'technical',
    icon: Settings2,
    title: 'Technical Elements',
    description: 'We check file format, encoding, fonts, and metadata to ensure technical ATS compatibility.',
  },
];

const ATSAnalysisSection = memo(function ATSAnalysisSection() {
  const [activeArea, setActiveArea] = useState('format');
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Demo scores
  const scores = {
    format: 85,
    keywords: 72,
    content: 90,
    sections: 78,
    technical: 95,
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const activeInfo = AREAS.find(a => a.id === activeArea);

  return (
    <section
      ref={sectionRef}
      id="analysis"
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Analysis Areas */}
          <div>
            <div className="section-divider" />
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">
              What Makes a Resume ATS-Friendly?
            </h2>
            <p className="text-slate-500 mb-8 text-base leading-relaxed">
              Our AI scans your resume across 5 critical areas to ensure maximum ATS compatibility and recruiter engagement.
            </p>

            <div className="space-y-1">
              {AREAS.map((area) => {
                const Icon = area.icon;
                const isActive = activeArea === area.id;
                return (
                  <div
                    key={area.id}
                    onClick={() => setActiveArea(area.id)}
                    className={`analysis-area ${isActive ? 'analysis-area-active' : ''}`}
                    id={`analysis-area-${area.id}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold transition-colors duration-200 ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                        Area {AREAS.indexOf(area) + 1}: {area.title}
                      </h4>
                      {isActive && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed animate-fade-in">
                          {area.description}
                        </p>
                      )}
                    </div>
                    {isActive && <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary-blue mt-8"
              id="ats-cta"
            >
              Get Your Resume Score
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Right Column - Radar Chart */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Tooltip box - shown for active area */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-xl shadow-xl text-xs font-medium whitespace-nowrap z-10">
                <span className="font-bold">{activeInfo?.title}</span>
                <span className="text-slate-300 ml-2">Is your layout readable by machines?</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 rounded-sm" />
              </div>

              <ATSRadarChart scores={scores} animated={animated} />

              {/* Corner Icons */}
              <div className="radar-icon-box -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div className="radar-icon-box top-1/3 -right-6 translate-x-full">
                <Search className="w-4 h-4" />
              </div>
              <div className="radar-icon-box bottom-4 -right-2 translate-x-full">
                <Star className="w-4 h-4" />
              </div>
              <div className="radar-icon-box bottom-4 -left-2 -translate-x-full">
                <Grid3X3 className="w-4 h-4" />
              </div>
              <div className="radar-icon-box top-1/3 -left-6 -translate-x-full">
                <Settings2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ATSAnalysisSection;
