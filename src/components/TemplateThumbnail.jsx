import React, { memo, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PREMIUM_SAMPLE_DATA } from '../constants/templates';

// ─── ARCHETYPE-AWARE THUMBNAIL RENDERER ─────────────────────────────────────
// Renders miniature, high-fidelity previews using a CSS transform scale approach:
// content is rendered at normal-ish sizes inside a container that is
// scaled-down to fit A4 proportions, avoiding the unreadable <2px text issue.
// ─────────────────────────────────────────────────────────────────────────────

const normalizeBuilderDataForThumbnail = (data) => {
  const raw = data || PREMIUM_SAMPLE_DATA;
  const personalRaw = raw.personal || {};
  const experience = Array.isArray(raw.experience) ? raw.experience : [];
  const education = Array.isArray(raw.education) ? raw.education : [];
  const certifications = Array.isArray(raw.certifications) ? raw.certifications : [];
  const skills = [
    ...(Array.isArray(raw.skills) ? raw.skills : []),
    ...(Array.isArray(raw.technicalSkills) ? raw.technicalSkills : []),
  ].filter(skill => skill && (skill.category || skill.items));
  const visibleSections = raw.visibleSections || {};
  const summary = raw.summary || (experience[0] && experience[0].description ? experience[0].description.replace(/[-•*]\s*/g, ' ').slice(0, 240) : PREMIUM_SAMPLE_DATA.summary);

  return {
    personal: {
      name: personalRaw.name || raw.name || PREMIUM_SAMPLE_DATA.personal.name,
      role: personalRaw.role || experience[0]?.role || 'Professional',
      email: personalRaw.email || '',
      phone: personalRaw.phone || '',
      location: personalRaw.location || '',
      website: personalRaw.website || '',
      linkedin: personalRaw.linkedin || '',
    },
    summary,
    experience: experience.length ? experience : PREMIUM_SAMPLE_DATA.experience,
    education: education.length ? education : PREMIUM_SAMPLE_DATA.education,
    skills: skills.length ? skills : PREMIUM_SAMPLE_DATA.skills,
    certifications: certifications.length ? certifications : PREMIUM_SAMPLE_DATA.certifications,
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    visibleSections,
  };
};

const TemplateThumbnail = memo(function TemplateThumbnail({ template, isSelected, data, flat = false }) {
  const { styles } = template;
  const accent = styles.accentColor || '#2563eb';
  const header = styles.headerColor || accent;
  const textColor = styles.textColor || '#1e293b';
  const sidebarBg = styles.sidebarBg || '#f8fafc';
  const bgColor = styles.backgroundColor || '#ffffff';

  const resumeData = useMemo(() => normalizeBuilderDataForThumbnail(data), [data]);
  const personal = resumeData.personal || PREMIUM_SAMPLE_DATA.personal;
  const expList = (resumeData.experience?.length ? resumeData.experience : PREMIUM_SAMPLE_DATA.experience).slice(0, 2);
  const eduList = (resumeData.education?.length ? resumeData.education : PREMIUM_SAMPLE_DATA.education).slice(0, 1);
  const skillsList = (resumeData.skills?.length ? resumeData.skills : PREMIUM_SAMPLE_DATA.skills).slice(0, 2);
  const certList = (resumeData.certifications?.length ? resumeData.certifications : PREMIUM_SAMPLE_DATA.certifications).slice(0, 1);
  const summary = resumeData.summary || PREMIUM_SAMPLE_DATA.summary;

  const metadataBadges = useMemo(() => {
    const badges = [];
    if (summary) badges.push('Summary');
    if (expList.length) badges.push('Experience');
    if (skillsList.length) badges.push('Skills');
    if (eduList.length) badges.push('Education');
    if (certList.length) badges.push('Certifications');
    if (resumeData.projects?.length) badges.push('Projects');
    if (resumeData.languages?.length) badges.push('Languages');
    return badges.length ? badges : ['ATS', 'Readable'];
  }, [summary, expList, skillsList, eduList, certList, resumeData.projects, resumeData.languages]);

  // ─── SECTION TITLE ──────────────────────────────────────────────────────
  const SectionTitle = ({ title, showDivider = true }) => {
    const divider = styles.dividerStyle;
    return (
      <div className="mb-[2px]">
        <div
          className="text-[5px] font-extrabold uppercase tracking-[0.08em] mb-[1px] overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: accent }}
        >
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

  // ─── TRUNCATED TEXT HELPER ──────────────────────────────────────────────
  const truncStyle = { overflow: 'hidden', textOverflow: 'ellipsis' };

  // ─── HEADER VARIANTS ────────────────────────────────────────────────────
  const renderClassicHeader = () => (
    <div className="px-2 pt-2 pb-1.5 border-b" style={{ borderColor: accent + '15' }}>
      <div
        className="text-[8px] font-black tracking-wide leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: header }}
      >
        {(personal.name || 'Jane Doe').toUpperCase()}
      </div>
      <div
        className="text-[4px] font-bold tracking-wider uppercase mt-[1px] overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: accent + 'cc' }}
      >
        {(personal.role || 'Senior Professional')}
      </div>
      <div className="flex gap-1.5 mt-[2px] text-[3px] flex-wrap overflow-hidden" style={{ color: textColor + '99' }}>
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location, personal.website, personal.linkedin].filter(Boolean);
          return contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>•</span>}
              <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">{part}</span>
            </React.Fragment>
          ));
        })()}
      </div>
    </div>
  );

  const renderCenteredHeader = () => (
    <div className="px-2 pt-2.5 pb-1.5 text-center border-b" style={{ borderColor: accent + '15' }}>
      <div
        className="text-[8px] font-black tracking-wide leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: header }}
      >
        {(personal.name || 'Jane Doe').toUpperCase()}
      </div>
      <div
        className="text-[4px] font-bold tracking-wider uppercase mt-[1px] overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: accent + 'cc' }}
      >
        {(personal.role || 'Senior Professional')}
      </div>
      <div className="flex gap-1.5 mt-[2px] text-[3px] justify-center flex-wrap overflow-hidden" style={{ color: textColor + '99' }}>
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location, personal.website, personal.linkedin].filter(Boolean);
          return contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>•</span>}
              <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">{part}</span>
            </React.Fragment>
          ));
        })()}
      </div>
    </div>
  );

  const renderModernSplitHeader = () => (
    <div className="px-2 pt-2 pb-1.5 border-b flex justify-between items-start gap-1" style={{ borderColor: accent + '15' }}>
      <div className="min-w-0 flex-1">
        <div
          className="text-[7px] font-black tracking-wide leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: header }}
        >
          {(personal.name || 'Jane Doe').toUpperCase()}
        </div>
        <div
          className="text-[3.5px] font-bold tracking-wider uppercase mt-[1px] overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: accent + 'cc' }}
        >
          {(personal.role || 'Senior Professional')}
        </div>
      </div>
      <div className="text-right text-[3px] leading-relaxed shrink-0 overflow-hidden" style={{ color: textColor + '88', maxWidth: '40%' }}>
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location, personal.website, personal.linkedin].filter(Boolean);
          return contactParts.map((part, i) => (
            <div key={i} className="overflow-hidden text-ellipsis whitespace-nowrap">{part}</div>
          ));
        })()}
      </div>
    </div>
  );

  const renderBannerHeader = () => (
    <div className="px-2 py-1.5" style={{ backgroundColor: header }}>
      <div
        className="text-[7px] font-black text-white tracking-wide leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {(personal.name || 'Jane Doe').toUpperCase()}
      </div>
      <div
        className="text-[3.5px] font-bold tracking-wider uppercase text-white/70 mt-[1px] overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {(personal.role || 'Senior Professional')}
      </div>
      <div className="flex gap-1.5 mt-[2px] text-[3px] text-white/55 flex-wrap overflow-hidden">
        {(() => {
          const contactParts = [personal.email, personal.phone, personal.location, personal.website, personal.linkedin].filter(Boolean);
          return contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>•</span>}
              <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px]">{part}</span>
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
    <div className="mb-2">
      <SectionTitle title="PROFESSIONAL SUMMARY" />
      <p
        className="text-[3.5px] leading-[1.5] line-clamp-3 overflow-hidden"
        style={{ color: textColor + 'aa' }}
      >
        {summary}
      </p>
    </div>
  );

  const renderExperience = () => (
    <div className="mb-2">
      <SectionTitle title="EXPERIENCE" />
      <div className="space-y-1">
        {expList.map((exp, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline gap-1">
              <div className="text-[4px] font-bold overflow-hidden text-ellipsis whitespace-nowrap min-w-0" style={{ color: textColor }}>{exp.role}</div>
              <div className="text-[3px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor + '77' }}>{exp.dates}</div>
            </div>
            <div className="text-[3.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: accent + 'bb' }}>{exp.company}</div>
            <p className="text-[3px] line-clamp-2 mt-[0.5px] overflow-hidden" style={{ color: textColor + '88' }}>
              {(exp.description || '').replace(/[-•*]\s*/g, '• ').substring(0, 150)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="mb-2">
      <SectionTitle title="EDUCATION" />
      {eduList.map((edu, i) => (
        <div key={i}>
          <div className="text-[4px] font-bold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor }}>{edu.degree}</div>
          <div className="text-[3.5px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor + '88' }}>{edu.school}</div>
          <div className="text-[3px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor + '66' }}>{edu.dates}</div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="mb-2">
      <SectionTitle title="SKILLS" />
      <div className="space-y-[1px]">
        {skillsList.map((skill, i) => (
          <div key={i} className="text-[3.5px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor + '99' }}>
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
        <div key={i} className="text-[3.5px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor + '99' }}>
          • {cert.name} ({cert.year})
        </div>
      ))}
    </div>
  );

  const renderContact = () => (
    <div className="mb-2">
      <SectionTitle title="CONTACT" />
      <div className="space-y-[1px] text-[3.5px]" style={{ color: textColor + '99' }}>
        {personal.email && <div className="overflow-hidden text-ellipsis whitespace-nowrap">{personal.email}</div>}
        {personal.phone && <div className="overflow-hidden text-ellipsis whitespace-nowrap">{personal.phone}</div>}
        {personal.location && <div className="overflow-hidden text-ellipsis whitespace-nowrap">{personal.location}</div>}
        {personal.website && <div className="overflow-hidden text-ellipsis whitespace-nowrap">{personal.website}</div>}
      </div>
    </div>
  );

  // ─── LAYOUT RENDERERS (by archetype family) ────────────────────────────

  // Single-column layouts
  const renderSingleColumn = () => (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: bgColor }}>
      {renderHeader()}
      <div className="px-2 py-2 flex-1 overflow-hidden">
        {renderSummary()}
        {renderExperience()}
        <div className="flex gap-3">
          <div className="flex-1 overflow-hidden">{renderSkills()}</div>
          <div className="flex-1 overflow-hidden">
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
      <div className="flex flex-1 overflow-hidden">
        <div
          className="w-[35%] p-2 flex flex-col gap-2 overflow-hidden"
          style={{ backgroundColor: sidebarBg, borderRight: `0.5px solid ${accent}15` }}
        >
          {renderContact()}
          {renderSkills()}
          {renderEducation()}
          {renderCertifications()}
        </div>
        <div className="flex-1 p-2 overflow-hidden">
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
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-2 overflow-hidden">
          {renderSummary()}
          {renderExperience()}
        </div>
        <div
          className="w-[35%] p-2 flex flex-col gap-2 overflow-hidden"
          style={{ backgroundColor: sidebarBg, borderLeft: `0.5px solid ${accent}15` }}
        >
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
      <div className="flex flex-1 px-2 py-2 gap-2 overflow-hidden">
        <div className="flex-1 border-r pr-2 overflow-hidden" style={{ borderColor: accent + '12' }}>
          {renderSummary()}
          {renderExperience()}
        </div>
        <div className="flex-1 pl-1 overflow-hidden">
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
      <div className="px-2 py-2 flex-1 overflow-hidden">
        <div className="mb-2 p-1.5 rounded-[2px] overflow-hidden" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
          <SectionTitle title="SUMMARY" />
          <p className="text-[3.5px] line-clamp-2 overflow-hidden" style={{ color: textColor + 'aa' }}>{summary}</p>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 p-1.5 rounded-[2px] overflow-hidden" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
            <SectionTitle title="EXPERIENCE" />
            {expList.slice(0, 1).map((exp, i) => (
              <div key={i}>
                <div className="text-[4px] font-bold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor }}>{exp.role}</div>
                <div className="text-[3px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: accent + 'bb' }}>{exp.company} • {exp.dates}</div>
              </div>
            ))}
          </div>
          <div className="flex-1 p-1.5 rounded-[2px] overflow-hidden" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
            {renderSkills()}
          </div>
        </div>
        <div className="flex gap-1.5 mt-1.5">
          <div className="flex-1 p-1.5 rounded-[2px] overflow-hidden" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
            {renderEducation()}
          </div>
          <div className="flex-1 p-1.5 rounded-[2px] overflow-hidden" style={{ backgroundColor: bgColor, border: `0.3px solid ${accent}15` }}>
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
      <div className="px-2 py-2 flex-1 overflow-hidden">
        {renderSummary()}
        <div className="mb-2">
          <SectionTitle title="EXPERIENCE" />
          <div className="relative pl-3 border-l" style={{ borderColor: accent + '30' }}>
            {expList.map((exp, i) => (
              <div key={i} className="mb-1.5 relative">
                <div
                  className="absolute -left-[5px] top-[2px] w-[5px] h-[5px] rounded-full border"
                  style={{ borderColor: accent, backgroundColor: bgColor, borderWidth: '0.5px' }}
                />
                <div className="text-[4px] font-bold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: textColor }}>{exp.role}</div>
                <div className="text-[3.5px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: accent + 'bb' }}>{exp.company} • {exp.dates}</div>
                <p className="text-[3px] line-clamp-2 mt-[0.5px] overflow-hidden" style={{ color: textColor + '77' }}>
                  {(exp.description || '').replace(/[-•*]\s*/g, '• ').substring(0, 120)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 overflow-hidden">{renderSkills()}</div>
          <div className="flex-1 overflow-hidden">{renderEducation()}</div>
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
    <div
      className={`aspect-[1/1.414] w-full rounded-xl overflow-hidden transition-all duration-300 group relative
        ${isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl scale-[1.02]'
          : 'border border-slate-200 hover:shadow-xl hover:border-slate-300 hover:scale-[1.01]'}
        bg-white flex flex-col`}
    >
      <div className="flex-1 flex flex-col w-full relative overflow-hidden">
        {/* Scale-down the inner content to simulate a real page at thumbnail size */}
        <div
          className="origin-top-left"
          style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: '238%', height: '238%' }}
        >
          {renderBody()}
        </div>
        <div className="absolute top-1 right-1 z-10 flex gap-[2px] opacity-90">
          <span className="bg-green-600/90 text-white text-[5px] font-extrabold px-1.5 py-[1px] rounded-full tracking-wider">ATS</span>
          {metadataBadges.slice(0, 2).map((badge, idx) => (
            <span key={idx} className="bg-white/90 text-slate-700 text-[5px] font-bold px-1.5 py-[1px] rounded-full shadow-sm">{badge}</span>
          ))}
        </div>
      </div>

      {/* Hover overlay */}
      {!flat && (
         <div
           className={`absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent
           flex flex-col items-center justify-end p-2 pb-3.5 transition-all duration-300 pointer-events-none
           ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
         >
          <span className="text-white font-bold text-[11px] text-center leading-tight mb-1 drop-shadow-md">{template.name}</span>
          <span className={`${badgeColor} text-white text-[8px] font-bold px-2 py-[2px] rounded-full uppercase tracking-wider shadow-sm`}>
            {(template.category || '').replace(/-/g, ' ')}
          </span>
          <span className="bg-white/15 text-white text-[8px] font-bold px-2 py-[2px] rounded-full tracking-wider">Readable</span>
          {isSelected && <CheckCircle2 className="w-4 h-4 text-white mt-1.5 drop-shadow-md" />}
        </div>
      )}
    </div>
  );
});

export default TemplateThumbnail;
