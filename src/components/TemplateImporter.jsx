import React, { useState, useMemo } from 'react';
import { 
  Palette, CheckCircle2, AlertCircle, Copy, Check, 
  Upload, Layout, Save, FileCode, CheckCircle, Info
} from 'lucide-react';
import TemplateThumbnail from './TemplateThumbnail';

// Predefined Fonts
const FONTS = [
  { value: "'Inter', sans-serif", label: 'Inter (Sans-Serif)' },
  { value: "'Roboto', sans-serif", label: 'Roboto (Sans-Serif)' },
  { value: "'Crimson Text', serif", label: 'Crimson Text (Serif)' },
  { value: "'Playfair Display', serif", label: 'Playfair Display (Serif)' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans (Sans-Serif)' },
  { value: "Georgia, serif", label: 'Georgia (Serif)' },
  { value: "Garamond, serif", label: 'Garamond (Serif)' }
];

// Presets
const PRESETS = [
  {
    name: 'Silicon Emerald (Technical)',
    category: 'technical',
    styles: {
      layout: 'sidebar-left',
      headerType: 'classic',
      fontFamily: "'Inter', sans-serif",
      secondaryFont: "'Inter', sans-serif",
      headerColor: '#0f172a',
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      sidebarBg: '#f0fdf4',
      dividerStyle: 'accent-bar',
      spacingScale: 1.0,
      sectionOrder: 'standard'
    }
  },
  {
    name: 'Harvard Classic (ATS)',
    category: 'ats',
    styles: {
      layout: 'single-column',
      headerType: 'centered',
      fontFamily: "'Crimson Text', serif",
      secondaryFont: "'Inter', sans-serif",
      headerColor: '#1e293b',
      accentColor: '#1e40af',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      sidebarBg: '#f8fafc',
      dividerStyle: 'thin-line',
      spacingScale: 1.0,
      sectionOrder: 'standard'
    }
  },
  {
    name: 'Royal Executive (Professional)',
    category: 'professional',
    styles: {
      layout: 'two-column',
      headerType: 'modern-split',
      fontFamily: "'Playfair Display', serif",
      secondaryFont: "'Roboto', sans-serif",
      headerColor: '#1c1917',
      accentColor: '#0f766e',
      backgroundColor: '#ffffff',
      textColor: '#374151',
      sidebarBg: '#f0fdfa',
      dividerStyle: 'double-line',
      spacingScale: 1.1,
      sectionOrder: 'standard'
    }
  },
  {
    name: 'Midnight Creative (Modern)',
    category: 'creative',
    styles: {
      layout: 'grid-layout',
      headerType: 'modern-banner',
      fontFamily: "'Roboto', sans-serif",
      secondaryFont: "'Roboto', sans-serif",
      headerColor: '#1e1b4b',
      accentColor: '#4f46e5',
      backgroundColor: '#ffffff',
      textColor: '#312e81',
      sidebarBg: '#e0e7ff',
      dividerStyle: 'thick-line',
      spacingScale: 1.0,
      sectionOrder: 'standard'
    }
  },
  {
    name: 'Minimal Slate (Minimalist)',
    category: 'minimal',
    styles: {
      layout: 'timeline',
      headerType: 'centered',
      fontFamily: "'Inter', sans-serif",
      secondaryFont: "'Inter', sans-serif",
      headerColor: '#334155',
      accentColor: '#475569',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      sidebarBg: '#f8fafc',
      dividerStyle: 'none',
      spacingScale: 0.9,
      sectionOrder: 'standard'
    }
  }
];

// Helper to convert hex to RGB luminance
const getLuminance = (hex) => {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Heuristic WCAG contrast checker
const getContrastRatio = (color1, color2) => {
  try {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  } catch {
    return 1;
  }
};

export default function TemplateImporter({ onTemplateRegistered }) {
  const [templateName, setTemplateName] = useState('My Custom Template');
  const [category, setCategory] = useState('professional');
  
  // Style properties
  const [layout, setLayout] = useState('single-column');
  const [headerType, setHeaderType] = useState('classic');
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  const [secondaryFont, setSecondaryFont] = useState("'Inter', sans-serif");
  const [headerColor, setHeaderColor] = useState('#0f172a');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#1e293b');
  const [sidebarBg, setSidebarBg] = useState('#f8fafc');
  const [dividerStyle, setDividerStyle] = useState('thin-line');
  const [spacingScale, setSpacingScale] = useState(1.0);

  // States
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Loaded customized template
  const customTemplateObject = useMemo(() => {
    return {
      id: 'custom-' + templateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'custom-template',
      name: templateName,
      archetype: layout,
      categories: ['professional', category],
      category: category,
      styles: {
        layout,
        headerType,
        fontFamily,
        secondaryFont,
        headerColor,
        accentColor,
        backgroundColor,
        textColor,
        sidebarBg,
        dividerStyle,
        spacingScale: parseFloat(spacingScale) || 1.0,
        sectionOrder: 'standard'
      }
    };
  }, [
    templateName, category, layout, headerType, fontFamily, 
    secondaryFont, headerColor, accentColor, backgroundColor, 
    textColor, sidebarBg, dividerStyle, spacingScale
  ]);

  const [prevCustomTemplateObject, setPrevCustomTemplateObject] = useState(customTemplateObject);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(customTemplateObject, null, 2));

  if (customTemplateObject !== prevCustomTemplateObject) {
    setPrevCustomTemplateObject(customTemplateObject);
    setJsonText(JSON.stringify(customTemplateObject, null, 2));
  }

  // Accessibility & Guideline Validation
  const validations = useMemo(() => {
    const list = [];
    
    // Contrast check: text vs background
    const textContrast = getContrastRatio(textColor, backgroundColor);
    list.push({
      id: 'text-contrast',
      label: `Text to Background Contrast (${textContrast.toFixed(1)}:1)`,
      status: textContrast >= 4.5 ? 'pass' : textContrast >= 3.0 ? 'warn' : 'fail',
      desc: textContrast >= 4.5 ? 'WCAG AA Compliant.' : 'Contrast is low. Recruiter readability might suffer.'
    });

    // Contrast check: accent vs background
    const accentContrast = getContrastRatio(accentColor, backgroundColor);
    list.push({
      id: 'accent-contrast',
      label: `Accent to Background Contrast (${accentContrast.toFixed(1)}:1)`,
      status: accentContrast >= 3.0 ? 'pass' : 'warn',
      desc: accentContrast >= 3.0 ? 'Sufficient for structural headings.' : 'Accent color has low contrast against the background.'
    });

    // Font check
    const isStandardFont = FONTS.some(f => f.value === fontFamily);
    list.push({
      id: 'font-check',
      label: 'Recruiter-Approved Typography',
      status: isStandardFont ? 'pass' : 'warn',
      desc: isStandardFont ? 'Typography is clean and ATS-friendly.' : 'Non-standard font might fail parsing on older ATS software.'
    });

    // Spacing Check
    const spacing = parseFloat(spacingScale);
    list.push({
      id: 'spacing-check',
      label: `Layout Spacing (${spacing}x)`,
      status: spacing >= 0.8 && spacing <= 1.3 ? 'pass' : 'fail',
      desc: spacing >= 0.8 && spacing <= 1.3 ? 'Ideal spacing density.' : 'Spacing is too dense or too sparse. Could break page layouts.'
    });

    // Sidebar contrast if sidebar layout
    if (layout === 'sidebar-left' || layout === 'sidebar-right') {
      const sidebarContrast = getContrastRatio(textColor, sidebarBg);
      list.push({
        id: 'sidebar-contrast',
        label: `Sidebar Text Contrast (${sidebarContrast.toFixed(1)}:1)`,
        status: sidebarContrast >= 4.5 ? 'pass' : sidebarContrast >= 3.0 ? 'warn' : 'fail',
        desc: sidebarContrast >= 4.5 ? 'Excellent readability.' : 'Text on sidebar is hard to read.'
      });
    }

    return list;
  }, [textColor, backgroundColor, accentColor, fontFamily, spacingScale, layout, sidebarBg]);

  // Apply Preset
  const applyPreset = (preset) => {
    setCategory(preset.category);
    setLayout(preset.styles.layout);
    setHeaderType(preset.styles.headerType);
    setFontFamily(preset.styles.fontFamily);
    setSecondaryFont(preset.styles.secondaryFont);
    setHeaderColor(preset.styles.headerColor);
    setAccentColor(preset.styles.accentColor);
    setBackgroundColor(preset.styles.backgroundColor);
    setTextColor(preset.styles.textColor);
    setSidebarBg(preset.styles.sidebarBg);
    setDividerStyle(preset.styles.dividerStyle);
    setSpacingScale(preset.styles.spacingScale);
  };

  // Import from JSON text
  const handleImportJSON = () => {
    setErrorMessage('');
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.name || !parsed.styles) {
        throw new Error("Invalid format. Name and 'styles' properties are required.");
      }
      
      setTemplateName(parsed.name);
      if (parsed.category) setCategory(parsed.category);
      
      const st = parsed.styles;
      if (st.layout) setLayout(st.layout);
      if (st.headerType) setHeaderType(st.headerType);
      if (st.fontFamily) setFontFamily(st.fontFamily);
      if (st.secondaryFont) setSecondaryFont(st.secondaryFont);
      if (st.headerColor) setHeaderColor(st.headerColor);
      if (st.accentColor) setAccentColor(st.accentColor);
      if (st.backgroundColor) setBackgroundColor(st.backgroundColor);
      if (st.textColor) setTextColor(st.textColor);
      if (st.sidebarBg) setSidebarBg(st.sidebarBg);
      if (st.dividerStyle) setDividerStyle(st.dividerStyle);
      if (st.spacingScale) setSpacingScale(st.spacingScale);
      
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to parse JSON configuration.');
    }
  };

  // Save/Register template
  const handleRegisterTemplate = () => {
    setErrorMessage('');
    
    // Final check for failing critical validations
    const hasCriticalFail = validations.some(v => v.status === 'fail');
    if (hasCriticalFail) {
      setErrorMessage('Critical layout errors detected. Please fix text and layout spacing to meet standard recruiter quality.');
      return;
    }

    if (!templateName.trim()) {
      setErrorMessage('Please provide a unique, professional Template Name.');
      return;
    }

    try {
      // Fetch current customs
      const stored = localStorage.getItem('custom_resume_templates');
      let customTemplates = stored ? JSON.parse(stored) : [];
      
      // Remove any existing with same ID
      customTemplates = customTemplates.filter(t => t.id !== customTemplateObject.id);
      
      // Append new
      customTemplates.push(customTemplateObject);
      
      // Save back
      localStorage.setItem('custom_resume_templates', JSON.stringify(customTemplates));
      
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);

      // Trigger app refresh callback
      if (onTemplateRegistered) {
        onTemplateRegistered(customTemplateObject);
      }
    } catch (err) {
      setErrorMessage('Could not write template to localStorage: ' + err.message);
    }
  };

  // Copy JSON Text
  const copyJSON = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Template Design & Automation Workspace
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Craft custom recruiter-approved resume layouts, customize fonts and accessibility contrast ratios, and register them instantly into your local templates engine.
        </p>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Presets */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Palette className="w-4.5 h-4.5 text-blue-600" />
              Quick Design Archetype Presets
            </h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50/10 hover:text-blue-600 transition-all flex items-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.styles.accentColor }} />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Editor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Template Title</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-850 outline-none focus:border-blue-600 focus:bg-white transition-all"
                  placeholder="e.g. Sapphire Modern"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Primary Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-750 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="ats">ATS Friendly</option>
                  <option value="basic">Basic / Beginner</option>
                  <option value="expert">Expert / Senior Professional</option>
                  <option value="it">IT / Technical</option>
                  <option value="government">Government / Civil Service</option>
                  <option value="business">Business / Industrial</option>
                  <option value="professional">Professional General</option>
                  <option value="executive">Executive</option>
                  <option value="creative">Creative Modern</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Layout Options */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-blue-500" /> Structure & Typography
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Page Layout</label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="single-column">Single Column (Classic)</option>
                    <option value="sidebar-left">Left Sidebar Split</option>
                    <option value="sidebar-right">Right Sidebar Split</option>
                    <option value="two-column">Two Balanced Columns</option>
                    <option value="grid-layout">Creative Grid Blocks</option>
                    <option value="timeline">Vertical Timeline</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Header Type</label>
                  <select
                    value={headerType}
                    onChange={(e) => setHeaderType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="classic">Classic Top Left</option>
                    <option value="centered">Centered Formal</option>
                    <option value="modern-split">Modern Split Info</option>
                    <option value="modern-banner">Accent Banner Background</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Primary Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Secondary Font</label>
                  <select
                    value={secondaryFont}
                    onChange={(e) => setSecondaryFont(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase">Section Divider Line Style</label>
                  <select
                    value={dividerStyle}
                    onChange={(e) => setDividerStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="thin-line">Thin Subdued Line</option>
                    <option value="thick-line">Thick Bold Line</option>
                    <option value="double-line">Double Styled Lines</option>
                    <option value="accent-bar">Left Accent Bar</option>
                    <option value="colored-block">Colored Block Tab</option>
                    <option value="dotted">Dotted Recruiter Line</option>
                    <option value="gradient-line">Smooth Color Gradient Line</option>
                    <option value="ornament">Ornamental Divider</option>
                    <option value="none">No Divider Lines</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase">Spacing Scale (Density)</label>
                    <span className="text-xs font-extrabold text-blue-600">{spacingScale}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.05"
                    value={spacingScale}
                    onChange={(e) => setSpacingScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer focus:outline-none accent-blue-600 mt-2.5"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Colors */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-500" /> Color Palette Setup
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase block">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 outline-none"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 w-20 px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase block">Header Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 outline-none"
                    />
                    <input
                      type="text"
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="flex-1 w-20 px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase block">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 outline-none"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 w-20 px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase block">Background (Paper)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 outline-none"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 w-20 px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase block">Sidebar Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sidebarBg}
                      disabled={layout !== 'sidebar-left' && layout !== 'sidebar-right'}
                      onChange={(e) => setSidebarBg(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      value={sidebarBg}
                      disabled={layout !== 'sidebar-left' && layout !== 'sidebar-right'}
                      onChange={(e) => setSidebarBg(e.target.value)}
                      className="flex-1 w-20 px-2 py-1 border border-slate-200 rounded text-xs font-mono disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Save Buttons & Errors */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>{errorMessage}</div>
              </div>
            )}

            {savedSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3 text-green-700 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>Design saved & registered into the active template gallery!</div>
              </div>
            )}

            <button
              onClick={handleRegisterTemplate}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Register & Save Design</span>
            </button>

          </div>
        </div>

        {/* Right Side: Preview & JSON Workspaces (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time Flat Preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-4.5 h-4.5 text-blue-600" />
              Live Preview Thumbnail
            </h3>
            <div className="w-full max-w-[280px] mx-auto border border-slate-200/80 rounded-2xl overflow-hidden shadow-md">
              <TemplateThumbnail
                template={customTemplateObject}
                isSelected={false}
                flat={true}
              />
            </div>
            <div className="text-center text-[10px] text-slate-400 font-medium">
              Thumbnails simulate rendering layout with sample datasets in real-time.
            </div>
          </div>

          {/* Validation Guidelines Check */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
              Accessibility & Quality Audits
            </h3>
            <div className="space-y-3">
              {validations.map(valid => (
                <div key={valid.id} className="flex items-start gap-2.5 text-xs">
                  {valid.status === 'pass' && (
                    <div className="w-4 h-4 mt-0.5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <Check className="w-2.5 h-2.5 font-bold" />
                    </div>
                  )}
                  {valid.status === 'warn' && (
                    <div className="w-4 h-4 mt-0.5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <Info className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {valid.status === 'fail' && (
                    <div className="w-4 h-4 mt-0.5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <AlertCircle className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <div>
                    <div className="font-extrabold text-slate-800">{valid.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-normal">{valid.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Configuration Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4.5 h-4.5 text-slate-600" />
                Template JSON Structure
              </h3>
              <button
                onClick={copyJSON}
                className="p-1 px-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={10}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono text-emerald-400 outline-none leading-relaxed resize-none"
            />
            
            <button
              onClick={handleImportJSON}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Config JSON</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
