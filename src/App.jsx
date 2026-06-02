import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ATSAnalysisSection from './components/ATSAnalysisSection';
import TemplateShowcase from './components/TemplateShowcase';
import SmartToolsSection from './components/SmartToolsSection';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import FeatureModal from './components/FeatureModal';
import AuthModal from './components/AuthModal';
import DashboardModal from './components/DashboardModal';

// New Workspaces & Views
import ResumeBuilder from './components/ResumeBuilder';
import { normalizeData } from './utils/resumeSerializer';
import ResumePreviewPage from './components/ResumePreviewPage';
import ResumeOptimizer from './components/ResumeOptimizer';
import TemplateGallery from './components/TemplateGallery';
import ExampleLibrary from './components/ExampleLibrary';
import CoverLetterWorkspace from './components/CoverLetterWorkspace';
import AIChatAssistant from './components/AIChatAssistant';
import TemplateImporter from './components/TemplateImporter';

import { serializeResume } from './utils/resumeSerializer';
import { TEMPLATES } from './constants/templates';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, builder, preview, optimization, templates, examples, coverletter, aiassistant, importer
  
  // Auth & Modals
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resumeoptimizer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeModal, setActiveModal] = useState(null);

  const loadTemplates = () => {
    try {
      const custom = localStorage.getItem('custom_resume_templates');
      const parsedCustom = custom ? JSON.parse(custom) : [];
      const combined = [...parsedCustom, ...TEMPLATES.filter(t => !parsedCustom.some(c => c.id === t.id))];
      setAllTemplates(combined);
    } catch {
      setAllTemplates(TEMPLATES);
    }
  };

  // Load standard and custom templates
  const [allTemplates, setAllTemplates] = useState(() => {
    try {
      const custom = localStorage.getItem('custom_resume_templates');
      const parsedCustom = custom ? JSON.parse(custom) : [];
      return [...parsedCustom, ...TEMPLATES.filter(t => !parsedCustom.some(c => c.id === t.id))];
    } catch {
      return TEMPLATES;
    }
  });
  
  // Active Resume Data
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0]?.id || '');
  const [builderData, setBuilderData] = useState(() => {
    try {
      const saved = localStorage.getItem('resumeoptimizer_anonymous_draft');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Auto-save draft
  useEffect(() => {
    if (builderData) {
      localStorage.setItem('resumeoptimizer_anonymous_draft', JSON.stringify(builderData));
    }
  }, [builderData]);

  // View Router Helpers
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleToolClick = (actionId) => {
    const actionToViewMap = {
      'workspace': 'builder',
      'premium': 'optimization',
      'templates': 'templates',
      'examples': 'examples',
      'cover-letter': 'coverletter'
    };
    if (actionToViewMap[actionId]) {
      setCurrentView(actionToViewMap[actionId]);
    } else {
      setActiveModal(actionId);
    }
  };

  const handleEditResume = (resume) => {
    try {
      const data = JSON.parse(resume.content);
      setBuilderData(data);
      if (data.template_id) {
        setSelectedTemplateId(data.template_id);
      }
    } catch {
      setBuilderData(null);
    }
    setCurrentView('builder');
    setActiveModal(null);
  };

  const handleBuilderSave = async (data) => {
    setBuilderData(data);
    const token = localStorage.getItem('resumeoptimizer_token');
    if (!token) return;

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: data.db_id,
          title: data.personal?.name ? `${data.personal.name}'s Resume` : 'Untitled Resume',
          content: JSON.stringify(data),
          template_id: data.template_id || selectedTemplateId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (!data.db_id) {
           setBuilderData(prev => ({ ...prev, db_id: result.id }));
        }
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const activeResumeText = builderData ? serializeResume(builderData) : '';

  const renderActiveView = () => {
    switch (currentView) {
      case 'builder':
        return (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
            <ResumeBuilder 
              initialData={builderData}
              onPreview={(data) => {
                setBuilderData(data);
                if (data.template_id) {
                  setSelectedTemplateId(data.template_id);
                }
                setCurrentView('preview');
              }}
              onSave={handleBuilderSave}
              onChange={setBuilderData}
              templatesList={allTemplates}
            />
          </div>
        );
      case 'preview':
        return (
          <ResumePreviewPage 
            data={builderData}
            onBackToEdit={() => setCurrentView('builder')}
            onTemplateChange={(templateId) => {
              setSelectedTemplateId(templateId);
              setBuilderData(prev => ({ ...prev, template_id: templateId }));
            }}
          />
        );
      case 'optimization':
        return (
          <ResumeOptimizer 
            activeResumeText={activeResumeText}
            activeTemplateId={selectedTemplateId}
            onLoadResumeToBuilder={(data) => {
              setBuilderData(data);
              setCurrentView('builder');
            }}
            onViewChange={handleViewChange}
          />
        );
      case 'templates':
        return (
          <TemplateGallery 
            activeTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            currentBuilderData={builderData}
            setBuilderData={setBuilderData}
            onViewChange={handleViewChange}
            templatesList={allTemplates}
          />
        );
      case 'examples':
        return (
          <ExampleLibrary 
            onSelectExample={setBuilderData}
            onViewChange={handleViewChange}
          />
        );
      case 'coverletter':
        return (
          <CoverLetterWorkspace 
            activeResumeText={activeResumeText}
            activeResumeData={builderData}
            activeTemplateId={selectedTemplateId}
            onViewChange={handleViewChange}
          />
        );
      case 'aiassistant':
        return (
          <AIChatAssistant 
            activeResumeText={activeResumeText}
            activeResumeData={builderData}
            onViewChange={handleViewChange}
          />
        );
      case 'importer':
        return (
          <TemplateImporter 
            onTemplateRegistered={(newTemplate) => {
              loadTemplates();
              setSelectedTemplateId(newTemplate.id);
              setBuilderData(prev => {
                const base = prev ? prev : normalizeData(null);
                return { ...base, template_id: newTemplate.id };
              });
              setCurrentView('templates');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar 
        user={user} 
        onAuthClick={() => setActiveModal(user ? 'dashboard' : 'auth')}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="flex-grow bg-slate-50/50">
        {currentView === 'home' ? (
          <>
<HeroSection 
               onGetStarted={() => {
        setBuilderData(null);
        localStorage.removeItem('resumeoptimizer_anonymous_draft');
        setCurrentView('builder');
     }} 
               onAnalyzeResume={() => setCurrentView('optimization')}
             />
            <ATSAnalysisSection />
            <TemplateShowcase />
            <SmartToolsSection onToolClick={handleToolClick} />
          </>
        ) : (
          renderActiveView()
        )}
      </main>

      <Footer onViewChange={handleViewChange} />
      
      <ChatBot resumeText={activeResumeText} />

      <FeatureModal featureId={activeModal} onClose={() => setActiveModal(null)} />
      {activeModal === 'auth' && (
        <AuthModal
          onClose={() => setActiveModal(null)}
          onLoginSuccess={(u) => { setUser(u); setActiveModal('dashboard'); }}
        />
      )}
      {activeModal === 'dashboard' && (
        <DashboardModal
          user={user}
          onClose={() => setActiveModal(null)}
          onEdit={handleEditResume}
          onLogout={() => { 
            setUser(null); 
            localStorage.removeItem('resumeoptimizer_user'); 
            localStorage.removeItem('resumeoptimizer_token');
            setActiveModal(null); 
          }}
        />
      )}
    </div>
  );
}

export default App;
