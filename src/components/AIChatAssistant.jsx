import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, Brain, Trash2, HelpCircle, 
  Loader2, FileText, ArrowRight, MessageSquare
} from 'lucide-react';
import { getLocalChatbotResponse } from '../utils/localChatbot';

const formatMessageText = (text, isUser) => {
  if (!text) return <span className="text-slate-400 italic">No response</span>;
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, bIdx) => {
    if (block.startsWith('```') && block.endsWith('```')) {
      const codeLines = block.slice(3, -3).trim().split('\n');
      const language = codeLines[0] && !codeLines[0].startsWith(' ') ? codeLines[0] : '';
      const codeContent = language ? codeLines.slice(1).join('\n') : codeLines.join('\n');
      return (
        <pre key={bIdx} className="bg-slate-900 text-slate-100 p-4 rounded-xl my-3 overflow-x-auto text-xs font-mono leading-relaxed select-text">
          {language && <div className="text-[10px] text-slate-500 uppercase font-black pb-1.5 border-b border-slate-800 mb-2">{language}</div>}
          <code>{codeContent}</code>
        </pre>
      );
    }
    const lines = block.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-2" />;
      const formatInline = (str) => {
        const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className={`font-black ${isUser ? 'text-white' : 'text-slate-950'}`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={pIdx} className="px-1.5 py-0.5 bg-slate-150 text-blue-600 font-mono text-[10px] rounded border border-slate-200">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });
      };
      if (line.trim().startsWith('###')) {
        const content = line.replace(/^###\s*/, '');
        return (
          <h4 key={idx} className="text-sm font-black text-slate-800 mt-3 mb-1">
            {formatInline(content)}
          </h4>
        );
      }
      if (line.trim().startsWith('##')) {
        const content = line.replace(/^##\s*/, '');
        return (
          <h3 key={idx} className="text-base font-black text-slate-800 mt-4 mb-1.5 border-b border-slate-100 pb-0.5">
            {formatInline(content)}
          </h3>
        );
      }
      if (line.trim().startsWith('#')) {
        const content = line.replace(/^#\s*/, '');
        return (
          <h2 key={idx} className="text-lg font-black text-slate-900 mt-5 mb-2">
            {formatInline(content)}
          </h2>
        );
      }
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const content = line.replace(/^[•\-*]\s*/, '');
        return (
          <li key={idx} className="ml-4 pl-1 list-disc mb-1 last:mb-0 text-slate-700 leading-relaxed">
            {formatInline(content)}
          </li>
        );
      }
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        const [_, num, content] = numMatch;
        return (
          <div key={idx} className="flex gap-2 mb-1 last:mb-0 ml-1 text-slate-700 leading-relaxed">
            <span className="font-extrabold text-blue-600">{num}.</span>
            <span className="flex-1">{formatInline(content)}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="mb-2 last:mb-0 text-slate-700 leading-relaxed">
          {formatInline(line)}
        </p>
      );
    });
  });
};

export default function AIChatAssistant({ activeResumeText, activeResumeData, onViewChange }) {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: "Hello! I'm your Resume Optimizer Career Assistant. 🚀\n\nI can analyze your active resume draft, suggest high-impact keywords, write custom bullets, or prepare you for interviews. What would you like to focus on today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    {
      title: "Scan for Missing Skills",
      prompt: "What key skills or competencies are missing from my resume?",
      description: "Get recommendations for typical skills in your domain."
    },
    {
      title: "Improve Summary",
      prompt: "Can you rewrite my professional summary to make it more compelling and results-oriented?",
      description: "Rewrite your bio for recruiters."
    },
    {
      title: "Suggest Action Verbs",
      prompt: "Give me 10 powerful action verbs to describe my professional experience instead of 'responsible for' or 'managed'.",
      description: "Replace weak descriptions."
    },
    {
      title: "Write Cold Email",
      prompt: "Draft a cold outreach email template matching my resume that I can send to a hiring manager on LinkedIn.",
      description: "Create a template for networking."
    },
    {
      title: "Career Guidance",
      prompt: "Suggest potential career paths and roles that align with my current background and experience.",
      description: "Explore suitable growth fields."
    },
    {
      title: "Interview Tips",
      prompt: "What are the most common behavioral interview questions for my role, and how should I structure my answers?",
      description: "Prepare structured STAR answers."
    },
    {
      title: "ATS Guidance",
      prompt: "Analyze my resume structure and recommend changes to make it fully readable by applicant tracking systems (ATS).",
      description: "Optimize layout and parser rates."
    },
    {
      title: "Job Search Strategy",
      prompt: "How should I structure my job search, and what is the best strategy to find and apply for hidden job opportunities?",
      description: "Optimize application flows."
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (userMsgText) => {
    if (!userMsgText.trim() || isTyping) return;
    
    const userMsg = { role: 'user', text: userMsgText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('resumeoptimizer_token');
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          message: userMsgText, 
          resume_text: activeResumeText,
          history: historyPayload
        })
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (err) {
      console.warn("Chatbot API offline, using client-side fallback:", err);
      const fallbackResult = getLocalChatbotResponse(userMsgText, { resume_text: activeResumeText });
      const offlineMsg = `*(Offline Mode: Displaying local career tips)*\n\n${fallbackResult.response}`;
      setMessages(prev => [...prev, { role: 'bot', text: offlineMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    handleSend(msg);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation history?")) {
      setMessages([
        { 
          role: 'bot', 
          text: "Chat history cleared. How else can I assist you with your career or resume optimization?" 
        }
      ]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-120px)] min-h-[600px] flex flex-col">
      {/* Upper header summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            AI Career Advisor
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Get personalized advice, formatting tips, and recruiter-approved revisions powered by LLM context.
          </p>
        </div>

        {/* Active Resume Card Badge */}
        <div className="flex items-center gap-3">
          {activeResumeData?.personal?.name ? (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-2 text-xs text-blue-700 font-bold max-w-xs shadow-sm">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-blue-500 uppercase block font-extrabold">Active Resume Draft</span>
                {activeResumeData.personal.name}
              </div>
              <button 
                onClick={() => onViewChange('builder')} 
                className="ml-2 hover:text-blue-900 bg-white border border-blue-200 hover:border-blue-400 p-1 rounded-lg transition-colors"
                title="Edit Resume Draft"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs text-slate-500 font-bold max-w-xs">
              <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-extrabold">No Resume Loaded</span>
                Generic Advice Mode
              </div>
              <button 
                onClick={() => onViewChange('builder')}
                className="ml-2 bg-blue-600 text-white hover:bg-blue-700 py-1 px-2.5 rounded-lg transition-colors font-extrabold text-[10px] flex items-center gap-1"
              >
                Create Draft
              </button>
            </div>
          )}
          
          <button
            onClick={handleClearChat}
            disabled={messages.length <= 1}
            className="p-2.5 bg-white border border-slate-200 hover:border-red-200 rounded-xl hover:text-red-600 text-slate-400 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all shadow-sm"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 grid lg:grid-cols-12 gap-6 mt-6 overflow-hidden">
        
        {/* Quick Prompts Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-start overflow-y-auto pr-2 pb-4 max-h-[40vh] lg:max-h-none">
          <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick-Start Coaching
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Select one of the topics below to instantly analyze your profile and generate actionable suggestions.
            </p>

            <div className="space-y-3">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isTyping}
                  className="w-full text-left p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl transition-all shadow-sm group hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:border-slate-200"
                >
                  <div className="text-xs font-black text-slate-800 group-hover:text-blue-600 flex items-center justify-between">
                    {item.title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition-all transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Helpful Tips Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white p-5 rounded-3xl shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Advisor Tip
            </h4>
            <p className="text-[11px] opacity-90 leading-relaxed">
              You can paste specific paragraphs of a job description and ask: <br />
              <strong className="text-white block mt-1">&quot;How can I tailor my work experience to match this description?&quot;</strong>
            </p>
          </div>
        </div>

        {/* Message Window (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col overflow-hidden h-full">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 min-h-[100px] flex flex-col justify-end">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-blue-50 border-blue-100 text-blue-600' 
                    : 'bg-white border-slate-100 text-slate-700'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-600" />}
                </div>

                {/* Message Bubble */}
                <div className={`px-4 py-3.5 rounded-2xl max-w-[85%] text-xs shadow-sm leading-relaxed break-words animate-fade-in ${
                  msg.role === 'user' 
                     ? 'bg-blue-600 text-white rounded-tr-none font-medium' 
                     : 'bg-white text-slate-800 border border-slate-200/50 rounded-tl-none font-normal'
                }`}>
                  {formatMessageText(msg.text, msg.role === 'user')}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="px-4 py-3 bg-white border border-slate-200/50 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input field */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-150">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                aria-label="Chat message input"
                placeholder={
                  activeResumeData?.personal?.name 
                    ? "Ask me to edit a bullet point, scan for keywords, or check formatting..." 
                    : "Ask a general career question, or load a resume draft to unlock contextual advice..."
                }
                className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-sans placeholder:text-slate-400"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-md"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
