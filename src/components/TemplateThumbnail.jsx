import React, { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PREMIUM_SAMPLE_DATA } from '../constants/templates';

// ─── ARCHETYPE-AWARE THUMBNAIL RENDERER ─────────────────────────────────────
// Renders miniature, high-fidelity previews of each template archetype.
// Uses tiny font sizes (3px–7px range) to simulate a full resume at thumbnail scale.

const TemplateThumbnail = memo(function TemplateThumbnail({ template, isSelected, data, flat = false }) {
  const { styles } = template;
  const accent = styles.accentColor || '#2563eb';
  const header = styles.headerColor || accent;
  const textColor = styles.textColor || '#1e293b';
  const sidebarBg = styles.sidebarBg || '#f8fafc';
  const bgColor = styles.backgroundColor || '#ffffff';

  const resumeData = data || PREMIUM_SAMPLE_DATA;
  const personal = resumeData.personal || PREMIUM_SAMPLE_DATA.personal;
  const expList = (resumeData.experience?.length ? resumeData.experience : PREMIUM_SAMPLE_DATA.experience).slice(0, 2);
  const eduList = (resumeData.education?.length ? resumeData.education : PREMIUM_SAMPLE_DATA.education).slice(0, 1);
  const skillsList = (resumeData.skills?.length ? resumeData.skills : PREMIUM_SAMPLE_DATA.skills).slice(0, 2);
  const certList = (resumeData.certifications?.length ? resumeData.certifications : PREMIUM_SAMPLE_DATA.certifications).slice(0, 1);
  const summary = resumeData.summary || PREMIUM_SAMPLE_DATA.summary;

  // ─── SECTION TITLE ──────────────────────────────────────────────────────
  const SectionTitle = ({ title, showDivider = true }) => {
    const divider = styles.dividerStyle;
    return (
      <div className="mb-[2px]">
        <div className="text-[3.5px] font-extrabold uppercase tracking-[0.08em] mb-[1px]" style={{ color: accent }}>
          {title}
        </div>
        {showDivider && divider !== 'none' && (
          <div style={getDividerStyle(divider, accent)} />
        )}
      </div>
    );
  };

  // ─── DIVIDER RENDERER ──────────────────────────────────────────────────
  function getDividerStyle(divider, color) {
    switch (divider) {
      case 'thin-line':
        return { height: '0.5px', backgroundColor: color + '30', marginTop: '1px', marginBottom: '1.5px' };
      case 'thick-line':
        return { height: '1px', backgroundColor: color + '40', marginTop: '1px', marginBottom: '1.5px', borderRadius: '1px' };
      case 'double-line':
        return { height: '0.5px', backgroundColor: color + '25', marginTop: '1px', marginBottom: '1.5px', boxShadow: `0 2px 0 ${color}25` };
      case 'accent-bar':
        return { height: '1px', width: '16px', backgroundColor: color, marginTop: '1px', marginBottom: '1.5px', borderRadius: '1px' };
      case 'colored-block':
        return { height: '1.5px', width: '12px', backgroundColor: color, marginTop: '1px', marginBottom: '1.5px', borderRadius: '1px' };
      case 'dotted':
        return { height: '0.5px', marginTop: '1px', marginBottom: '1.5px', backgroundImage: `repeating-linear-gradient(90deg, ${color}50 0px, ${color}50 1.5px, transparent 1.5px, transparent 3.5px)` };
      case 'gradient-line':
        return { height: '1px', marginTop: '1px', marginBottom: '1.5px', borderRadius: '1px', background: `linear-gradient(90deg, ${color}, ${color}30)` };
      case 'ornament':
        return { height: '0.5px', backgroundColor: color + '20', marginTop: '2px', marginBottom: '2px' };
      default:
        return { height: '0.5px', backgroundColor: color + '20', marginTop: '1px', marginBottom: '1.5px' };
    }
  }

  // ─── HEADER VARIANTS ────────────────────────────────────────────────────
  const renderClassicHeader = () => (
    <div className="px-2 pt-2 pb-1.5 border-b" style={{ borderColor: accent + '15' }}>
      <div className="text-[6px] font-black tracking-wide leading-tight truncate" style={{ color: header }}>
        {(personal.name || 'Jane Doe').toUpperCase()}
      </div>
      <div className="text-[3px] font-bold tracking-wider uppercase mt-[1px] truncate" style={{ color: accent + 'cc' }}>
        {(personal.role || 'Senior Professional')}
      </div>
      <div className="flex gap-1.5 mt-[2px] text-[2.5px] flex-wrap" style={{ color: textColor + '99' }}>
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean);
          return contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>•</span>}
              <span className="truncate">{part}</span>
            </React.Fragment>
          ));
        })()}
      </div>
    </div>
  );

  const renderCenteredHeader = () => (
    <div className="px-2 pt-2.5 pb-1.5 text-center border-b" style={{ borderColor: accent + '15' }}>
      <div className="text-[6.5px] font-black tracking-wide leading-tight" style={{ color: header }}>
        {(personal.name || 'Jane Doe').toUpperCase()}
      </div>
      <div className="text-[3px] font-bold tracking-wider uppercase mt-[1px]" style={{ color: accent + 'cc' }}>
        {(personal.role || 'Senior Professional')}
      </div>
      <div className="flex gap-1.5 mt-[2px] text-[2.5px] justify-center flex-wrap" style={{ color: textColor + '99' }}>
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean);
          return contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>•</span>}
              <span>{part}</span>
            </React.Fragment>
          ));
        })()}
      </div>
    </div>
  );

  const renderModernSplitHeader = () => (
    <div className="px-2 pt-2 pb-1.5 border-b flex justify-between items-end" style={{ borderColor: accent + '15' }}>
      <div>
        <div className="text-[6px] font-black tracking-wide leading-tight truncate" style={{ color: header }}>
          {(personal.name || 'Jane Doe').toUpperCase()}
        </div>
        <div className="text-[3px] font-bold tracking-wider uppercase mt-[1px] truncate" style={{ color: accent + 'cc' }}>
          {(personal.role || 'Senior Professional')}
        </div>
      </div>
      <div className="text-right text-[2.2px] leading-relaxed" style={{ color: textColor + '88' }}>
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean);
          return contactParts.map((part, i) => (
            <div key={i}>{part}</div>
          ));
        })()}
      </div>
    </div>
  );

  const renderBannerHeader = () => (
    <div className="px-2 py-1.5" style={{ backgroundColor: header }}>
      <div className="text-[6px] font-black text-white tracking-wide leading-tight truncate">
        {(personal.name || 'Jane Doe').toUpperCase()}
      </div>
      <div className="text-[3px] font-bold tracking-wider uppercase text-white/70 mt-[1px] truncate">
        {(personal.role || 'Senior Professional')}
      </div>
      <div className="flex gap-1.5 mt-[2px] text-[2.2px] text-white/55 flex-wrap">
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean);
          return contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>•</span>}
              <span>{part}</span>
            </React.Fragment>
          ));
        })()}
      </div>
    </div>
  );

  const renderHeader = () => {
    switch (styles.headerType) {
      case 'centered': return renderCenteredHeader();
      case 'modern-split': return renderModernSplitHeader();
      case 'modern-banner': return renderBannerHeader();
      default: return renderClassicHeader();
    }
  };

  // ─── CONTENT BLOCKS ─────────────────────────────────────────────────────
  const renderSummary = () => (
    <div className="mb-1.5">
      <SectionTitle title="PROFESSIONAL SUMMARY" />
      <p className="text-[2.5px] leading-[1.5] line-clamp-3" style={{ color: textColor + 'aa' }}>
        {summary}
      </p>
    </div>
  );

  const renderExperience = () => (
    <div className="mb-1.5">
      <SectionTitle title="EXPERIENCE" />
      <div className="space-y-1">
        {expList.map((exp, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline">
              <div className="text-[3px] font-bold truncate" style={{ color: textColor }}>{exp.role}</div>
              <div className="text-[2px] shrink-0 ml-1" style={{ color: textColor + '77' }}>{exp.dates}</div>
            </div>
            <div className="text-[2.5px] font-semibold truncate" style={{ color: accent + 'bb' }}>{exp.company}</div>
            <p className="text-[2.2px] line-clamp-2 mt-[0.5px]" style={{ color: textColor + '88' }}>
              {(exp.description || '').replace(/[-•*]\s*/g, '• ').substring(0, 120)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="mb-1.5">
      <SectionTitle title="EDUCATION" />
      {eduList.map((edu, i) => (
        <div key={i}>
          <div className="text-[3px] font-bold truncate" style={{ color: textColor }}>{edu.degree}</div>
          <div className="text-[2.5px] truncate" style={{ color: textColor + '88' }}>{edu.school}</div>
          <div className="text-[2px]" style={{ color: textColor + '66' }}>{edu.dates}</div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="mb-1.5">
      <SectionTitle title="SKILLS" />
      <div className="space-y-[1px]">
        {skillsList.map((skill, i) => (
          <div key={i} className="text-[2.5px] truncate" style={{ color: textColor + '99' }}>
            <span className="font-semibold" style={{ color: textColor + 'cc' }}>{skill.category}:</span> {skill.items}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="mb-1">
      <SectionTitle title="CERTIFICATIONS" />
      {certList.map((cert, i) => (
        <div key={i} className="text-[2.5px] truncate" style={{ color: textColor + '99' }}>
          • {cert.name} ({cert.year})
        </div>
      ))}
    </div>
  );

  const renderContact = () => (
    <div className="mb-1.5">
      <SectionTitle title="CONTACT" />
      <div className="space-y-[1px] text-[2.5px]" style={{ color: textColor + '99' }}>
        {personal.email && <div className="truncate">{personal.email}</div>}
        {personal.phone && <div className="truncate">{personal.phone}</div>}
        {personal.location && <div className="truncate">{personal.location}</div>}
        {personal.website && <div className="truncate">{personal.website}</div>}
      </div>
    </div>
  );

  // ─── LAYOUT RENDERERS (by archetype family) ────────────────────────────

  // Single-column layouts (classic-clean, executive-serif/banner, minimal-*, ats-optimized, elegant-divider, bold-header)
  const renderSingleColumn = () => (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: bgColor }}>
      {renderHeader()}
      <div className="px-2 py-1.5 flex-1">
        {renderSummary()}
        {renderExperience()}
        <div className="flex gap-2">
          <div className="flex-1">{renderSkills()}</div>
          <div className="flex-1">
            {renderEducation()}
            {renderCertifications()}
          </div>
        </div>
      </div>
    </div>
  );

  // Sidebar-left layout
  const renderSidebarLeft = () => (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: bgColor }}>
      {renderHeader()}
      <div className="flex flex-1">
        <div className="w-[34%] p-1.5 flex flex-col gap-1.5" style={{ backgroundColor: sidebarBg, borderRight: `0.5px solid ${accent}15` }}>
          {renderContact()}
          {renderSkills()}
          {renderEducation()}
          {renderCertifications()}
        </div>
        <div className="flex-1 p-1.5">
          {renderSummary()}
          {renderExperience()}
        </div>
      </div>
    </div>
  );

  // Sidebar-right layout
  const renderSidebarRight = () => (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: bgColor }}>
      {renderHeader()}
      <div className="flex flex-1">
        <div className="flex-1 p-1.5">
          {renderSummary()}
          {renderExperience()}
        </div>
        <div className="w-[34%] p-1.5 flex flex-col gap-1.5" style={{ backgroundColor: sidebarBg, borderLeft: `0.5px solid ${accent}15` }}>
          {renderContact()}
          {renderSkills()}
          {renderEducation()}
          {renderCertifications()}
        </div>
      </div>
    </div>
  );

  // Two-column layout
  const renderTwoColumn = () => (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: bgColor }}>
      {renderHeader()}
      <div className="flex flex-1 px-2 py-1.5 gap-2">
        <div className="flex-1 border-r pr-1.5" style={{ borderColor: accent + '12' }}>
          {renderSummary()}
          {renderExperience()}
        </div>
        <div className="flex-1 pl-0.5">
          {renderSkills()}
          {renderEducation()}
          {renderCertifications()}
        </div>
      </div>
    </div>
  );

  // Grid/Creative layout
  const renderGridLayout = () => (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: sidebarBg }}>
      {renderHeader()}
      <div className="px-1.5 py-1.5 flex-1">
        <div className="mb-1.5 p-1 rounded-[2px]" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
          <SectionTitle title="SUMMARY" />
          <p className="text-[2.5px] line-clamp-2" style={{ color: textColor + 'aa' }}>{summary}</p>
        </div>
        <div className="flex gap-1">
          <div className="flex-1 p-1 rounded-[2px]" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
            <SectionTitle title="EXPERIENCE" />
            {expList.slice(0, 1).map((exp, i) => (
              <div key={i}>
                <div className="text-[3px] font-bold truncate" style={{ color: textColor }}>{exp.role}</div>
                <div className="text-[2.2px] truncate" style={{ color: accent + 'bb' }}>{exp.company} • {exp.dates}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 p-1 rounded-[2px]" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
            {renderSkills()}
          </div>
        </div>
        <div className="flex gap-1 mt-1">
          <div className="flex-1 p-1 rounded-[2px]" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
            {renderEducation()}
          </div>
          <div className="flex-1 p-1 rounded-[2px]" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
            {renderCertifications()}
          </div>
        </div>
      </div>
    </div>
  );

  // Timeline layout
  const renderTimeline = () => (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: bgColor }}>
      {renderHeader()}
      <div className="px-2 py-1.5 flex-1">
        {renderSummary()}
        <div className="mb-1.5">
          <SectionTitle title="EXPERIENCE" />
          <div className="relative pl-2 border-l" style={{ borderColor: accent + '30' }}>
            {expList.map((exp, i) => (
              <div key={i} className="mb-1 relative">
                <div className="absolute -left-[5.5px] top-[1px] w-[3px] h-[3px] rounded-full border" style={{ borderColor: accent, backgroundColor: bgColor, borderWidth: '0.5px' }} />
                <div className="text-[3px] font-bold truncate" style={{ color: textColor }}>{exp.role}</div>
                <div className="text-[2.5px] truncate" style={{ color: accent + 'bb' }}>{exp.company} • {exp.dates}</div>
                <p className="text-[2.2px] line-clamp-1 mt-[0.5px]" style={{ color: textColor + '77' }}>
                  {(exp.description || '').replace(/[-•*]\s*/g, '').substring(0, 80)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">{renderSkills()}</div>
          <div className="flex-1">{renderEducation()}</div>
        </div>
      </div>
    </div>
  );

  // ─── ARCHETYPE DISPATCHER ──────────────────────────────────────────────
  const renderBody = () => {
    const layout = styles.layout;
    if (layout === 'sidebar-left') return renderSidebarLeft();
    if (layout === 'sidebar-right') return renderSidebarRight();
    if (layout === 'two-column') return renderTwoColumn();
    if (layout === 'grid-layout') return renderGridLayout();
    if (layout === 'timeline') return renderTimeline();
    return renderSingleColumn();
  };

  // ─── CATEGORY BADGE ────────────────────────────────────────────────────
  const categoryBadgeColors = {
    'ats': 'bg-green-600',
    'professional': 'bg-blue-600',
    'executive': 'bg-indigo-600',
    'technical': 'bg-purple-600',
    'beginner': 'bg-sky-600',
    'corporate': 'bg-slate-700',
    'creative': 'bg-pink-600',
    'minimal': 'bg-teal-600',
    'student': 'bg-violet-600',
    'modern': 'bg-emerald-600',
  };
  const badgeColor = categoryBadgeColors[template.category] || 'bg-slate-600';

  return (
    <div className={`aspect-[1/1.414] w-full rounded-xl overflow-hidden transition-all duration-300 group relative
      ${isSelected
        ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl scale-[1.02]'
        : 'border border-slate-200 hover:shadow-xl hover:border-slate-300 hover:scale-[1.01]'}
      bg-white flex flex-col`}
    >
      <div className="flex-1 flex flex-col w-full relative overflow-hidden">
        {renderBody()}
      </div>

      {/* Hover overlay */}
      {!flat && (
         <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent
          flex flex-col items-center justify-end p-2 pb-3.5 transition-all duration-300 pointer-events-none
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <span className="text-white font-bold text-[11px] text-center leading-tight mb-1 drop-shadow-md">{template.name}</span>
          <span className={`${badgeColor} text-white text-[8px] font-bold px-2 py-[2px] rounded-full uppercase tracking-wider shadow-sm`}>
            {(template.category || '').replace(/-/g, ' ')}
          </span>
          {isSelected && <CheckCircle2 className="w-4 h-4 text-white mt-1.5 drop-shadow-md" />}
        </div>
      )}
    </div>
  );
});

export default TemplateThumbnail;
