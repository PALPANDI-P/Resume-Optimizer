import React, { memo, useState, useEffect } from 'react';
import { FileText, Menu, X } from 'lucide-react';

const Navbar = memo(function Navbar({ user, onAuthClick, currentView, onViewChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { view: 'builder', label: 'Resume Builder' },
    { view: 'optimization', label: 'ATS Optimizer' },
    { view: 'templates', label: 'Template Gallery' },
    { view: 'examples', label: 'Resume Examples' },
    { view: 'coverletter', label: 'Cover Letter' },
    { view: 'importer', label: 'Template Importer' }
  ];

  return (
    <nav
      id="main-nav"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100'
          : 'bg-white border-b border-slate-100/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => { onViewChange('home'); }} 
            className="flex items-center gap-2.5 group focus:outline-none" 
            id="logo"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-800">
              Resume<span className="text-blue-600">Optimizer</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => onViewChange(link.view)}
                className={`text-xs font-bold transition-all ${
                  currentView === link.view
                    ? 'text-blue-600 font-extrabold border-b-2 border-blue-600 pb-1'
                    : 'text-slate-500 hover:text-slate-900 pb-1 border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onAuthClick}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 px-4 py-2 transition-colors flex items-center gap-2"
            >
              {user ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  Dashboard
                </>
              ) : (
                'Log In'
              )}
            </button>
            <button
              onClick={() => onViewChange('builder')}
              className="btn-primary-blue !py-2 !px-5 !text-xs font-bold"
              id="nav-cta"
            >
              Build Resume →
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 space-y-2 animate-slide-down">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => { setMobileOpen(false); onViewChange(link.view); }}
                className={`block w-full text-left px-3 py-2 text-xs font-extrabold rounded-lg transition-colors ${
                  currentView === link.view
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <button
                onClick={() => { setMobileOpen(false); onAuthClick(); }}
                className="text-left px-3 py-2 text-xs font-extrabold text-slate-600 hover:text-slate-900"
              >
                {user ? `Dashboard (${user.name})` : 'Log In / Register'}
              </button>
              <button
                onClick={() => { setMobileOpen(false); onViewChange('builder'); }}
                className="btn-primary-blue w-full !text-xs font-bold text-center py-2.5"
              >
                Build Resume →
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navbar;
