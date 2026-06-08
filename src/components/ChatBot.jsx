import React, { useState, useRef, useEffect, memo } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { getLocalChatbotResponse } from '../utils/localChatbot';

const QUICK_CHIPS = [
  "How to pass ATS checks?",
  "Rewrite my professional summary",
  "Prepare me for an interview",
  "How long should my resume be?",
  "Best resume format for career changers",
  "What skills am I missing?",
  "Help with action verbs",
  "Cover letter tips"
];

const formatMessageText = (text, isUser) => {
  if (!text) return null;
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, bIdx) => {
    if (block.startsWith('```') && block.endsWith('```')) {
      const codeLines = block.slice(3, -3).trim().split('\n');
      const language = codeLines[0] && !codeLines[0].startsWith(' ') ? codeLines[0] : '';
      const codeContent = language ? codeLines.slice(1).join('\n') : codeLines.join('\n');
      return (
        <pre key={bIdx} className="bg-slate-900 text-slate-100 p-3 rounded-xl my-2 overflow-x-auto text-[11px] font-mono leading-relaxed select-text">
          {language && <div className="text-[9px] text-slate-500 uppercase font-black pb-1 border-b border-slate-800 mb-1.5">{language}</div>}
          <code>{codeContent}</code>
        </pre>
      );
    }
    const lines = block.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-1.5" />;
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
              <code key={pIdx} className="px-1 py-0.5 bg-slate-100 text-blue-600 font-mono text-[10px] rounded border border-slate-200">
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
          <h4 key={idx} className="text-xs font-black text-slate-800 mt-3 mb-1">
            {formatInline(content)}
          </h4>
        );
      }
      if (line.trim().startsWith('##')) {
        const content = line.replace(/^##\s*/, '');
        return (
          <h3 key={idx} className="text-sm font-black text-slate-800 mt-4 mb-1.5 border-b border-slate-100 pb-0.5">
            {formatInline(content)}
          </h3>
        );
      }
      if (line.trim().startsWith('#')) {
        const content = line.replace(/^#\s*/, '');
        return (
          <h2 key={idx} className="text-base font-black text-slate-900 mt-5 mb-2">
            {formatInline(content)}
          </h2>
        );
      }
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const content = line.replace(/^[•\-*]\s*/, '');
        return (
          <li key={idx} className="ml-4 pl-0.5 list-disc mb-0.5 last:mb-0 leading-relaxed text-slate-700">
            {formatInline(content)}
          </li>
        );
      }
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const content = numMatch[2];
        return (
          <div key={idx} className="flex gap-1.5 mb-0.5 last:mb-0 ml-0.5 leading-relaxed text-slate-700">
            <span className="font-black text-blue-600">{num}.</span>
            <span className="flex-1">{formatInline(content)}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="mb-1 last:mb-0 leading-relaxed text-slate-700">
          {formatInline(line)}
        </p>
      );
    });
  });
};

const ChatBot = memo(function ChatBot({ resumeText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your Resume Optimizer assistant. I can help with building your resume, improving your content, and answering questions about the tools here. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  const sendUserMessage = async (userMsg) => {
    if (!userMsg.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    try {
      const token = localStorage.getItem('resumeoptimizer_token');
      const formattedHistory = messages.map(m => ({
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
          message: userMsg, 
          resume_text: resumeText,
          history: formattedHistory
        })
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (err) {
      console.warn("Chatbot API offline, using client-side fallback:", err);
      const fallbackResult = getLocalChatbotResponse(userMsg, { resume_text: resumeText });
      const offlineMsg = `*(Offline Mode: Displaying local career tips)*\n\n${fallbackResult.response}`;
      setMessages(prev => [...prev, { role: 'bot', text: offlineMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendUserMessage(input.trim());
    setInput('');
  };

  const handleQuickAction = (text) => {
    sendUserMessage(text);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
          aria-label="Open AI Assistant"
        >
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></span>
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 z-50 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '520px', maxHeight: 'calc(100vh - 100px)' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Career Advisor</h3>
              <p className="text-[10px] text-blue-100 opacity-90">Powered by Resume Optimizer AI</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resume Context Indicator */}
        {resumeText && (
          <div className="px-4 py-1.5 bg-blue-700/40 text-[10px] text-blue-100 font-semibold flex items-center gap-1.5 border-t border-blue-400/20">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Resume data loaded — answers are personalized
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                {formatMessageText(msg.text, msg.role === 'user')}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}

          {/* Quick Action Chips */}
          {!isTyping && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAction(chip)}
                  className="bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-[9px] font-extrabold text-slate-500 px-2 py-1 rounded-full transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about resume formatting, skills, interviews, career tips..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
            </button>
          </div>
        </form>
      </div>
    </>
  );
});

export default ChatBot;