import React, { memo, useEffect } from 'react';
import { ChevronLeft, Palette, Download } from 'lucide-react';
import { TEMPLATES } from '../constants/templates';
import DownloadButtons from './DownloadButtons';

// Parse resume text into structured sections
function parseResumeContent(text) {
  const lines = text.split('\n');
  const sections = [];
  let headerLines = [];
  let currentSection = null;
  let foundFirstSection = false;

  const SECTION_NAMES = new Set([
    'PROFESSIONAL SUMMARY','SUMMARY','OBJECTIVE','SKILLS','WORK EXPERIENCE',
    'EXPERIENCE','EDUCATION','PROJECTS','CERTIFICATIONS','AWARDS',
    'LANGUAGES','CONTACT','INTERESTS','VOLUNTEER','PUBLICATIONS',
    'REFERENCES','TECHNICAL SKILLS','SOFT SKILLS','CORE COMPETENCIES','CAREER SUMMARY',
    'PROFESSIONAL EXPERIENCE','EMPLOYMENT HISTORY','INTERNSHIP','INTERNSHIPS',
    'EDUCATION AND TRAINING','EXTRACURRICULAR','HONORS','ACTIVITIES',
    'LEADERSHIP','ACHIEVEMENTS','COURSEWORK','RELEVANT COURSEWORK','HOBBIES',
    'VOLUNTEER EXPERIENCE','CAREER OBJECTIVE'
  ]);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed && !foundFirstSection) continue;

    const upper = trimmed.toUpperCase().replace(/:$/, '');
    const isExactMatch = SECTION_NAMES.has(upper);
    const isHeuristicMatch = (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 40 &&
       !trimmed.includes('@') && !trimmed.includes('|') && !trimmed.includes('http') &&
       !trimmed.includes(',') && !/^\d/.test(trimmed) && /[A-Z]/.test(trimmed) &&
       trimmed.split(' ').length <= 4);

    const isSection = isExactMatch || (isHeuristicMatch && (foundFirstSection || headerLines.length > 2));

    if (isSection) {
      foundFirstSection = true;
      if (currentSection) sections.push(currentSection);
      currentSection = { title: upper, lines: [] };
    } else {
      if (!foundFirstSection) {
        headerLines.push(line);
      } else if (currentSection) {
        currentSection.lines.push(line);
      }
    }
  }
  if (currentSection) sections.push(currentSection);

  return { headerLines, sections };
}

// Classify sections for sidebar placement
const SIDEBAR_SECTIONS = new Set(['SKILLS','CONTACT','LANGUAGES','CERTIFICATIONS','AWARDS','EDUCATION','INTERESTS','TECHNICAL SKILLS','SOFT SKILLS','CORE COMPETENCIES']);

function ResumePreview({ version, templateId, photoFile, onBack, onTemplateChange: _onTemplateChange, hideBackBtn = false }) {
  const [prevVersionContent, setPrevVersionContent] = React.useState(version.content);
  const [editedContent, setEditedContent] = React.useState(version.content);

  if (version.content !== prevVersionContent) {
    setPrevVersionContent(version.content);
    setEditedContent(version.content);
  }

  const [prevPhotoFile, setPrevPhotoFile] = React.useState(photoFile);
  const [photoUrl, setPhotoUrl] = React.useState(null);

  if (photoFile !== prevPhotoFile) {
    setPrevPhotoFile(photoFile);
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
    setPhotoUrl(photoFile ? URL.createObjectURL(photoFile) : null);
  }

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  const [isEditing, setIsEditing] = React.useState(false);
  const [customColor, setCustomColor] = React.useState('');
  const [customFont, setCustomFont] = React.useState('');
  const [lineSpacing, setLineSpacing] = React.useState('1.5');
  const [margins, setMargins] = React.useState('0px');
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const styles = {
    ...template.styles,
    accentColor: customColor || template.styles.accentColor,
    fontFamily: customFont || template.styles.fontFamily,
  };
  const { headerLines, sections } = parseResumeContent(editedContent);



  const highlightText = (text, color) => {
    const regex = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\b\d{4}\s*-\s*(?:\d{4}|Present)\b|\b\d{4}\b|\b\d+%\b|\b\d+x\b|\$[0-9,]+(?:[KMB])?\b)/gi;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} style={{ color: color, fontWeight: 700 }}>{part}</strong>;
      }
      return part;
    });
  };

  const renderLine = (line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-2" />;
    
    const bulletMatch = trimmed.match(/^[-•*]\s*(.*)/);
    if (bulletMatch) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginLeft: 4, marginBottom: 4 }}>
          <span style={{ color: styles.accentColor, flexShrink: 0, marginTop: 2 }}>•</span>
          <span style={{ fontSize: 13, lineHeight: 1.6, color: styles.textColor }}>{highlightText(bulletMatch[1], styles.headerColor)}</span>
        </div>
      );
    }
    if ((trimmed.includes('|') || trimmed.includes(' at ') || (trimmed.includes(' - ') && trimmed.length < 50)) && trimmed.length < 100) {
      return <p key={i} style={{ fontWeight: 700, fontSize: 13.5, color: styles.textColor, marginBottom: 3 }}>{highlightText(trimmed, styles.accentColor)}</p>;
    }
    return <p key={i} style={{ fontSize: 13, lineHeight: 1.6, color: styles.textColor, marginBottom: 4 }}>{highlightText(trimmed, styles.textColor)}</p>;
  };

  const renderDivider = () => {
    const d = styles.dividerStyle;
    const c = styles.accentColor;
    if (d === 'none') return null;
    if (d === 'thin-line') return <div style={{ height: 1, background: c + '30', marginTop: 4 }} />;
    if (d === 'thick-line') return <div style={{ height: 2, background: c + '40', marginTop: 4, borderRadius: 2 }} />;
    if (d === 'double-line') return <div style={{ marginTop: 4 }}><div style={{ height: 1, background: c + '25' }} /><div style={{ height: 1, background: c + '25', marginTop: 2 }} /></div>;
    if (d === 'dotted') return <div style={{ height: 1, marginTop: 4, backgroundImage: `repeating-linear-gradient(90deg, ${c}50 0px, ${c}50 3px, transparent 3px, transparent 7px)` }} />;
    if (d === 'gradient-line') return <div style={{ height: 2, marginTop: 4, borderRadius: 2, background: `linear-gradient(90deg, ${styles.headerColor}, ${c})` }} />;
    if (d === 'colored-block') return <div style={{ height: 3, width: 40, marginTop: 4, borderRadius: 2, background: c }} />;
    if (d === 'accent-bar') return <div style={{ height: 2, width: 50, marginTop: 4, borderRadius: 2, background: c }} />;
    if (d === 'ornament') return <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}><div style={{ flex: 1, height: 1, background: c + '25' }} /><div style={{ width: 5, height: 5, borderRadius: '50%', background: c + '40' }} /><div style={{ flex: 1, height: 1, background: c + '25' }} /></div>;
    return <div style={{ height: 1, background: c + '20', marginTop: 4 }} />;
  };

  const renderSectionBlock = (s, idx, isSidebar = false) => {
    const isCreative = styles.layout === 'grid-layout';
    const isTimeline = styles.layout === 'timeline';
    const sectionBg = isCreative && !isSidebar ? '#ffffff' : 'transparent';
    const sectionPadding = isCreative && !isSidebar ? '20px' : '0';
    const sectionRadius = isCreative && !isSidebar ? '12px' : '0';
    const sectionShadow = isCreative && !isSidebar ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none';
    const sectionBorder = isCreative && !isSidebar ? `1px solid ${styles.accentColor}20` : 'none';

    return (
      <div key={idx} style={{ 
        marginBottom: styles.spacingScale ? 28 * styles.spacingScale : 28,
        backgroundColor: sectionBg,
        padding: sectionPadding,
        borderRadius: sectionRadius,
        boxShadow: sectionShadow,
        border: sectionBorder
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isCreative && <div style={{ width: '8px', height: '24px', backgroundColor: styles.accentColor, borderRadius: '4px' }}></div>}
          <h3 style={{ 
            color: isTimeline ? styles.headerColor : styles.accentColor, 
            fontWeight: isTimeline ? 800 : 700, 
            fontSize: isTimeline ? 16 : 14, 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            marginBottom: isCreative ? 10 : 4, 
            fontFamily: styles.fontFamily,
            borderBottom: isTimeline ? `2px solid ${styles.accentColor}` : 'none',
            paddingBottom: isTimeline ? '4px' : '0'
          }}>
            {s.title}
          </h3>
        </div>
        {!isTimeline && !isCreative && renderDivider()}
        <div style={{ marginTop: 10, position: 'relative' }}>
          {isTimeline && (s.title.includes('EXPERIENCE') || s.title.includes('PROJECT')) && (
            <div style={{ position: 'absolute', left: '6px', top: '5px', bottom: '5px', width: '2px', backgroundColor: styles.accentColor + '30' }}></div>
          )}
          {s.lines.map((line, i) => (
             <div key={i} style={{ 
               paddingLeft: isTimeline && (s.title.includes('EXPERIENCE') || s.title.includes('PROJECT')) ? '24px' : '0',
               position: 'relative'
             }}>
               {isTimeline && (s.title.includes('EXPERIENCE') || s.title.includes('PROJECT')) && line.trim().length > 10 && !line.trim().startsWith('-') && !line.trim().startsWith('•') && (
                 <div style={{ position: 'absolute', left: '0px', top: '6px', width: '14px', height: '14px', borderRadius: '50%', border: `3px solid ${styles.accentColor}`, backgroundColor: '#fff' }}></div>
               )}
               {renderLine(line, i)}
             </div>
          ))}
        </div>
      </div>
    );
  };

  const name = headerLines[0] || 'Your Name';
  const contactInfo = headerLines.slice(1).filter(l => l.trim());

  const renderContactItem = (text, key, isBlock = false, isLight = false) => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    let href = '';
    let display = trimmed;
    let isLink = false;

    // Check email
    if (trimmed.includes('@') && !trimmed.includes('http') && !trimmed.includes('/')) {
      href = `mailto:${trimmed}`;
      isLink = true;
    }
    // Check LinkedIn
    else if (trimmed.toLowerCase().includes('linkedin.com') || trimmed.toLowerCase().startsWith('linkedin:')) {
      let cleanUrl = trimmed.replace(/^linkedin:\s*/i, '');
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      href = cleanUrl;
      isLink = true;
      if (trimmed.toLowerCase().startsWith('linkedin:')) {
        display = trimmed;
      }
    }
    // Check Website/Portfolio
    else if (trimmed.toLowerCase().includes('github.com') || trimmed.toLowerCase().includes('portfolio') || trimmed.toLowerCase().startsWith('http') || trimmed.match(/[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i)) {
      let cleanUrl = trimmed;
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      href = cleanUrl;
      isLink = true;
    }
    // Check Phone
    else if (trimmed.match(/^\+?[0-9\s().-]{7,20}$/)) {
      const cleanPhone = trimmed.replace(/[^\d+]/g, '');
      href = `tel:${cleanPhone}`;
      isLink = true;
    }

    const itemStyles = {
      color: isLink 
        ? (isLight ? '#ffffff' : (styles.accentColor || '#2563eb'))
        : (isLight ? '#ffffff' : (styles.textColor + 'bb')),
      textDecoration: isLink ? 'underline' : 'none',
      transition: 'opacity 0.2s ease-in-out',
      fontWeight: isLink ? '600' : 'normal',
      opacity: isLight ? 0.9 : 1,
    };

    if (isLink) {
      return (
        <a
          key={key}
          href={href}
          target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
          style={itemStyles}
          className="hover:opacity-75 hover:underline"
        >
          {display}
        </a>
      );
    }

    return isBlock ? (
      <div key={key} style={{ color: isLight ? 'white' : (styles.textColor + 'aa'), opacity: isLight ? 0.85 : 1 }}>{display}</div>
    ) : (
      <span key={key} style={{ color: isLight ? 'white' : (styles.textColor + 'bb'), opacity: isLight ? 0.85 : 1 }}>{display}</span>
    );
  };

  const renderClassicHeader = () => (
    <header style={{ padding: '36px 40px 24px', borderBottom: `2px solid ${styles.accentColor}15` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {photoFile && photoUrl && (
          <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: styles.headerColor, letterSpacing: '-0.02em', marginBottom: 6, fontFamily: styles.fontFamily }}>{name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: styles.textColor + 'bb' }}>
            {contactInfo.map((l, i) => renderContactItem(l, i, false, false))}
          </div>
        </div>
      </div>
    </header>
  );

  const renderCenteredHeader = () => (
    <header style={{ padding: '40px 40px 28px', textAlign: 'center', borderBottom: `2px solid ${styles.accentColor}15` }}>
      {photoFile && photoUrl && (
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <h1 style={{ fontSize: 30, fontWeight: 800, color: styles.headerColor, letterSpacing: '-0.02em', marginBottom: 6, fontFamily: styles.fontFamily }}>{name}</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: styles.textColor + 'bb', justifyContent: 'center' }}>
        {contactInfo.map((l, i) => renderContactItem(l, i, false, false))}
      </div>
    </header>
  );

  const renderModernSplitHeader = () => (
    <header style={{ padding: '36px 40px 24px', borderBottom: `2px solid ${styles.accentColor}15` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {photoFile && photoUrl && (
            <div style={{ width: 70, height: 70, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
               <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <h1 style={{ fontSize: 28, fontWeight: 800, color: styles.headerColor, fontFamily: styles.fontFamily }}>{name}</h1>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: styles.textColor + 'aa', lineHeight: 1.7 }}>
          {contactInfo.map((l, i) => renderContactItem(l, i, true, false))}
        </div>
      </div>
    </header>
  );

  const renderBannerHeader = () => (
    <header style={{ padding: '32px 36px 24px', backgroundColor: styles.headerColor, color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {photoFile && photoUrl && (
          <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '3px solid rgba(255,255,255,0.3)' }}>
            <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 4, fontFamily: styles.fontFamily }}>{name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', fontSize: 11, opacity: 0.85 }}>
            {contactInfo.map((l, i) => renderContactItem(l, i, false, true))}
          </div>
        </div>
      </div>
    </header>
  );

  const renderHeader = () => {
    const ht = styles.headerType;
    if (ht === 'centered') return renderCenteredHeader();
    if (ht === 'modern-split') return renderModernSplitHeader();
    if (ht === 'modern-banner' || ht === 'creative-header') return renderBannerHeader();
    return renderClassicHeader();
  };

  const renderSingleColumn = () => (
    <div style={{ fontFamily: styles.secondaryFont || styles.fontFamily, color: styles.textColor, backgroundColor: styles.backgroundColor, minHeight: 'auto' }}>
      {renderHeader()}
      <div style={{ padding: '28px 40px 40px' }}>
        {sections.map((s, i) => renderSectionBlock(s, i))}
      </div>
    </div>
  );

  const renderSidebarLayout = () => {
    const sidebarSecs = sections.filter(s => SIDEBAR_SECTIONS.has(s.title));
    const mainSecs = sections.filter(s => !SIDEBAR_SECTIONS.has(s.title));
    const isRight = styles.layout === 'sidebar-right';

    const sidebar = (
      <aside style={{ width: '32%', padding: '28px 20px', backgroundColor: styles.sidebarBg || styles.accentColor + '08', borderLeft: isRight ? `1px solid ${styles.accentColor}12` : 'none', borderRight: !isRight ? `1px solid ${styles.accentColor}12` : 'none' }}>
        {sidebarSecs.map((s, i) => renderSectionBlock(s, i, true))}
      </aside>
    );
    const main = (
      <div style={{ width: '68%', padding: '28px 32px' }}>
        {mainSecs.map((s, i) => renderSectionBlock(s, i, false))}
      </div>
    );

    return (
      <div style={{ fontFamily: styles.secondaryFont || styles.fontFamily, color: styles.textColor, backgroundColor: styles.backgroundColor, minHeight: 'auto' }}>
        {renderHeader()}
        <div style={{ display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row', minHeight: 'auto' }}>
          {sidebar}{main}
        </div>
      </div>
    );
  };

  const renderTwoColumn = () => {
    const half = Math.ceil(sections.length / 2);
    const left = sections.slice(0, half);
    const right = sections.slice(half);

    return (
      <div style={{ fontFamily: styles.secondaryFont || styles.fontFamily, color: styles.textColor, backgroundColor: styles.backgroundColor, minHeight: 'auto' }}>
        {renderHeader()}
        <div style={{ display: 'flex', gap: 24, padding: '28px 36px 40px' }}>
          <div style={{ flex: 1 }}>{left.map((s, i) => renderSectionBlock(s, i))}</div>
          <div style={{ width: 1, backgroundColor: styles.accentColor + '15' }} />
          <div style={{ flex: 1 }}>{right.map((s, i) => renderSectionBlock(s, i))}</div>
        </div>
      </div>
    );
  };

  const renderTimelineLayout = () => {
    return (
      <div style={{ fontFamily: styles.secondaryFont || styles.fontFamily, color: styles.textColor, backgroundColor: styles.backgroundColor, minHeight: 'auto' }}>
        {renderHeader()}
        <div style={{ padding: '36px 48px' }}>
          {sections.map((s, i) => renderSectionBlock(s, i))}
        </div>
      </div>
    );
  };

  const renderGridLayout = () => {
    const topSecs = sections.filter(s => s.title === 'PROFESSIONAL SUMMARY' || s.title === 'SUMMARY' || s.title === 'OBJECTIVE');
    const midLeftSecs = sections.filter(s => !topSecs.includes(s) && SIDEBAR_SECTIONS.has(s.title));
    const midRightSecs = sections.filter(s => !topSecs.includes(s) && !SIDEBAR_SECTIONS.has(s.title));

    return (
      <div style={{ fontFamily: styles.secondaryFont || styles.fontFamily, color: styles.textColor, backgroundColor: styles.sidebarBg || '#f8fafc', minHeight: 'auto' }}>
        {renderHeader()}
        <div style={{ padding: '24px 32px' }}>
          {topSecs.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
               {topSecs.map((s, i) => renderSectionBlock(s, i))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div>
              {midLeftSecs.map((s, i) => renderSectionBlock(s, i, true))}
            </div>
            <div>
              {midRightSecs.map((s, i) => renderSectionBlock(s, i))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResumeContent = () => {
    if (styles.layout === 'timeline') return renderTimelineLayout();
    if (styles.layout === 'grid-layout') return renderGridLayout();
    if (styles.layout?.includes('sidebar')) return renderSidebarLayout();
    if (styles.layout === 'two-column') return renderTwoColumn();
    return renderSingleColumn();
  };

  if (hideBackBtn) {
    return (
      <div className="animate-fade-in flex flex-col h-full bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        {/* Compact controls above the paper */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 text-white border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Layout Style:</span>
            <span className="px-3 py-1 bg-slate-800 text-blue-400 rounded-lg text-xs font-bold border border-slate-700">
              {template.name} ({(template.archetype || template.category || '').replace(/-/g, ' ')})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DownloadButtons
              content={editedContent}
              filename={`${name.replace(/[^a-zA-Z0-9]/g, '_')}_${version.title.replace(/\s+/g, '_')}`}
              templateId={templateId}
              compact={true}
            />
          </div>
        </div>
        {/* Paper Preview */}
        <div className="flex-1 bg-slate-800/40 p-4 sm:p-8 overflow-y-auto max-h-[75vh]">
          <div className="mx-auto bg-white shadow-2xl min-h-[1056px] w-full max-w-[794px] origin-top transition-all duration-500 overflow-hidden box-border"
            style={{ fontFamily: styles.fontFamily, lineHeight: lineSpacing, padding: margins }}>
            {renderResumeContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Sidebar Controls */}
        <div className="lg:w-80 space-y-5 shrink-0">
          <button onClick={onBack} className="btn-secondary w-full flex items-center justify-center gap-2 !py-3">
            <ChevronLeft className="w-5 h-5" />
            Back to Versions
          </button>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setIsEditing(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!isEditing ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Design
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${isEditing ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Edit Content
            </button>
          </div>

          {!isEditing ? (
            <div className="glass-card p-5 animate-fade-in">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-blue-500" />
                Active Layout: {template.name}
              </h3>
              <p className="text-[10px] text-slate-400 mb-4">You can switch layouts in the <strong>ATS Templates Showcase</strong> tab.</p>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Custom Color</h4>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['#1e3a8a', '#2563eb', '#1d4ed8', '#4f46e5', '#1e40af', '#6366f1'].map(color => (
                    <button 
                      key={color} 
                      onClick={() => setCustomColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${styles.accentColor === color ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={styles.accentColor} 
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-6 h-6 rounded border-0 cursor-pointer p-0"
                  />
                </div>
                
                <h4 className="text-xs font-bold text-slate-800 mb-2">Typography</h4>
                <select 
                  value={styles.fontFamily}
                  onChange={(e) => setCustomFont(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="Inter, sans-serif">Inter (Modern)</option>
                  <option value="Roboto, sans-serif">Roboto (Clean)</option>
                  <option value="'Merriweather', serif">Merriweather (Classic)</option>
                  <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                  <option value="'Open Sans', sans-serif">Open Sans (Standard)</option>
                </select>

                <h4 className="text-xs font-bold text-slate-800 mt-4 mb-2">Line Spacing</h4>
                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                  {['1.2', '1.5', '1.8'].map(val => (
                    <button key={val} onClick={() => setLineSpacing(val)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${lineSpacing === val ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                      {val === '1.2' ? 'Compact' : val === '1.5' ? 'Normal' : 'Relaxed'}
                    </button>
                  ))}
                </div>
                
                <h4 className="text-xs font-bold text-slate-800 mt-4 mb-2">Page Margins</h4>
                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                  {['0px', '24px', '48px'].map(val => (
                    <button key={val} onClick={() => setMargins(val)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${margins === val ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                      {val === '0px' ? 'Default' : val === '24px' ? 'Wide' : 'Extra'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 animate-fade-in flex flex-col h-[600px]">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                Edit Resume Text
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Edit the resume content directly. The live preview updates as you type.
              </p>
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                className="w-full flex-1 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Resume content..."
                spellCheck={false}
              />
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-500" />
              Export Options
            </h3>
            <DownloadButtons
              content={editedContent}
              filename={`${name.replace(/[^a-zA-Z0-9]/g, '_')}_${version.title.replace(/\s+/g, '_')}`}
              templateId={templateId}
            />
          </div>
        </div>

        {/* Paper Preview */}
        <div className="flex-1 bg-blue-50/40 rounded-2xl p-4 sm:p-8 overflow-x-auto border border-blue-100/50">
          <div className="mx-auto bg-white shadow-2xl shadow-slate-900/10 min-h-[1056px] w-full max-w-[794px] origin-top transition-all duration-500 overflow-hidden box-border"
            style={{ fontFamily: styles.fontFamily, lineHeight: lineSpacing, padding: margins }}>
            {renderResumeContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ResumePreview);
