import React, { memo } from 'react';
import { FileText, Shield, ExternalLink, Heart } from 'lucide-react';

const Footer = memo(function Footer({ onViewChange, onDevClick }) {
  const year = new Date().getFullYear();

  const productLinks = [
    { label: 'Resume Builder', view: 'builder' },
    { label: 'Resume Templates', view: 'templates' },
    { label: 'Resume Analysis', view: 'optimization' },
    { label: 'Cover Letter Builder', view: 'coverletter' },
    { label: 'Resume Examples', view: 'examples' }
  ];

  return (
    <footer className="mt-auto bg-slate-900 text-white" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-1">
            <button 
              onClick={() => onViewChange?.('home')} 
              className="flex items-center gap-2.5 mb-5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight">
                Resume<span className="text-blue-400">Optimizer</span>
              </span>
            </button>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Build professional, ATS-optimized resumes in minutes. Free tools for job seekers everywhere.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Your data stays private & secure</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => onViewChange?.(item.view)}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 text-left font-medium focus:outline-none"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Resources</h4>
            <ul className="space-y-3">
              {['Career Blog', 'Resume Guide', 'How to Write a CV', 'ATS Optimization Tips', 'Salary Calculator'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onViewChange?.('home')}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 text-left font-medium focus:outline-none"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Follow Us</h5>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white transition-all duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-slate-500">
            © {year} Resume Optimizer. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for job seekers everywhere
          </p>
        </div>
        {onDevClick && (
          <div className="pb-3 text-center">
            <button
              onClick={onDevClick}
              className="text-[9px] text-slate-700 hover:text-purple-400 font-mono tracking-widest uppercase opacity-0 hover:opacity-100 transition-opacity"
              title="Template Validator (Dev)"
            >
              [template_validator]
            </button>
          </div>
        )}
      </div>
    </footer>
  );
});

export default Footer;
