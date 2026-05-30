import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Download, LogOut, Clock, Edit2, Loader2, 
  PlusCircle, Trash2, Copy, Award, FileDown 
} from 'lucide-react';
import { serializeResume } from '../utils/resumeSerializer';

export default function DashboardModal({ user, onClose, onLogout, onEdit }) {
  const [activeTab, setActiveTab] = useState('resumes');
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async (showLoading = true) => {
    const token = localStorage.getItem('resumeoptimizer_token');
    if (!token) {
      setLoading(false);
      return;
    }
    if (showLoading) {
      setLoading(true);
    }
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resumesRes, analysesRes, downloadsRes] = await Promise.all([
        fetch('/api/resumes', { headers }),
        fetch('/api/analyses', { headers }),
        fetch('/api/downloads', { headers })
      ]);
      
      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        setResumes(resumesData);
      }
      if (analysesRes.ok) {
        const analysesData = await analysesRes.json();
        setAnalyses(analysesData);
      }
      if (downloadsRes.ok) {
        const downloadsData = await downloadsRes.json();
        setDownloads(downloadsData);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDuplicate = async (resumeId) => {
    const token = localStorage.getItem('resumeoptimizer_token');
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Duplication failed');
      await fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    const token = localStorage.getItem('resumeoptimizer_token');
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Deletion failed');
      await fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (resume, format) => {
    const token = localStorage.getItem('resumeoptimizer_token');
    setActionLoading(true);
    try {
      let content = resume.content;
      try {
        const parsed = JSON.parse(resume.content);
        if (parsed && (parsed.personal || parsed.experience)) {
          content = serializeResume(parsed);
        }
      } catch {
        /* ignore */
      }

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          content, 
          format, 
          filename: resume.title || 'Resume', 
          template_id: resume.template_id || 'cc-001' 
        }),
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title || 'Resume'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      await fetchDashboardData();
    } catch (err) {
      alert('Error downloading file: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-slide-down flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none mb-1">{user?.name + "'s Dashboard"}</h2>
              <p className="text-xs font-medium text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogout} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-100 shadow-sm rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 px-8 bg-slate-50/20">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`py-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'resumes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Saved Resumes
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`py-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'scores' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            Score History
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`py-4 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'downloads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            Download History
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto bg-white flex-1">
          {actionLoading && (
            <div className="absolute inset-0 bg-white/70 z-[110] flex items-center justify-center backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-2.5">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-xs font-bold text-slate-600">Processing action...</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-bold">Loading your workspace...</p>
            </div>
          ) : (
            <>
              {activeTab === 'resumes' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Your Resumes</h3>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
                    </span>
                  </div>

                  {resumes.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                       <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                         <FileText className="w-8 h-8" />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 mb-1">No resumes found</h4>
                       <p className="text-sm text-slate-500 mb-6">Start building your first resume to see it here.</p>
                       <button 
                        onClick={() => { onClose(); }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                       >
                         <PlusCircle className="w-4 h-4" />
                         Build Now
                       </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {resumes.map(resume => (
                        <div key={resume.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group bg-white gap-4">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border border-transparent group-hover:border-blue-100 shrink-0">
                              <FileText className="w-7 h-7" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors truncate">
                                {resume.title || 'Untitled Resume'}
                              </h4>
                              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                                  <Clock className="w-3.5 h-3.5" /> 
                                  {new Date(resume.updated_at || resume.created_at).toLocaleDateString()}
                                </span>
                                <span className="uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md text-[9px]">
                                  {resume.template_id || 'cc-001'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1.5 self-end sm:self-center">
                            <button 
                              onClick={() => onEdit && onEdit(resume)}
                              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100" 
                              title="Edit Resume"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDuplicate(resume.id)}
                              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100" 
                              title="Duplicate Resume"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownload(resume, 'pdf')}
                              className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100" 
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(resume.id)}
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100" 
                              title="Delete Resume"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'scores' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Score History</h3>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {analyses.length} {analyses.length === 1 ? 'Analysis' : 'Analyses'}
                    </span>
                  </div>

                  {analyses.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                       <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                         <Award className="w-8 h-8" />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 mb-1">No analysis records yet</h4>
                       <p className="text-sm text-slate-500">Run a Job Match optimization to log scores here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {analyses.map(analysis => {
                        let report = {};
                        try {
                          report = JSON.parse(analysis.report_json) || {};
                        } catch {
                          /* ignore */
                        }
                        const missing = report.missing_keywords || report.skills_to_emphasize || report.missing_skills || [];
                        
                        return (
                          <div key={analysis.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:shadow-xl hover:shadow-slate-100 transition-all flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border
                              ${analysis.match_score >= 85 ? 'bg-green-50 text-green-600 border-green-200' :
                                analysis.match_score >= 60 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                'bg-red-50 text-red-600 border-red-200'}`}>
                              {analysis.match_score}%
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <h4 className="font-bold text-slate-800 text-sm truncate">
                                  Job Fit Analysis
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(analysis.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {analysis.jd_text && (
                                <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 mb-2 font-mono whitespace-pre-line">
                                  {analysis.jd_text}
                                </p>
                              )}
                              {missing && missing.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Missing:</span>
                                  {missing.slice(0, 5).map((kw, idx) => (
                                    <span key={idx} className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                      {kw}
                                    </span>
                                  ))}
                                  {missing.length > 5 && (
                                    <span className="text-[9px] font-bold text-slate-400">+{missing.length - 5} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'downloads' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Download History</h3>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {downloads.length} {downloads.length === 1 ? 'Download' : 'Downloads'}
                    </span>
                  </div>

                  {downloads.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                       <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                         <FileDown className="w-8 h-8" />
                       </div>
                       <h4 className="text-lg font-bold text-slate-800 mb-1">No downloads logged yet</h4>
                       <p className="text-sm text-slate-500">Export your resumes as PDF or DOCX to see them here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {downloads.map(download => (
                        <div key={download.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:shadow-xl hover:shadow-slate-100 transition-all flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/50 shrink-0">
                              <FileDown className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-base">
                                {download.resume_title || 'Resume'}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                                <span className="uppercase font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[9px]">
                                  {download.format}
                                </span>
                                <span className="bg-slate-50 px-2 py-0.5 rounded-md text-[9px] font-bold">
                                  Template: {download.template_id || 'default'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" /> {new Date(download.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Premium Cloud Sync Enabled • Secure Data Storage
            </p>
        </div>
      </div>
    </div>
  );
}
