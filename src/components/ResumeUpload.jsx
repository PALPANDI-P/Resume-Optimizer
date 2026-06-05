import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { Upload, FileText, CheckCircle2, Users, Sparkles, File, X } from 'lucide-react';

const MAX_UPLOAD_SIZE_BYTES = 4.5 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

const ResumeUpload = memo(function ResumeUpload({ resumeFile, setResumeFile, photoFile, setPhotoFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const photoUrlRef = useRef(null);

  useEffect(() => {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    if (photoFile) photoUrlRef.current = URL.createObjectURL(photoFile);
    else photoUrlRef.current = null;
    return () => { if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current); };
  }, [photoFile]);

  const validateFileSize = useCallback((file) => {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setUploadError(`File too large (${formatFileSize(file.size)}). Maximum allowed size is 4.5 MB.`);
      return false;
    }
    setUploadError('');
    return true;
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFileSize(file)) {
        setResumeFile(file);
      }
    }
  }, [setResumeFile, validateFileSize]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFileSize(file)) {
        setResumeFile(file);
      }
    }
  }, [setResumeFile, validateFileSize]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="glass-card p-6 sm:p-8" id="resume-upload-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Upload Your Existing Resume</h2>
          <p className="text-sm text-slate-400">PDF, DOCX, or plain text format</p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group
          ${isDragging
            ? 'border-blue-400 bg-blue-50/80 scale-[1.02]'
            : resumeFile
              ? 'border-emerald-300 bg-emerald-50/30'
              : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/20'
          }`}
        id="resume-dropzone"
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id="resume-file-input"
        />
        {resumeFile ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <File className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-emerald-700 text-sm truncate">{resumeFile.name}</p>
              <p className="text-xs text-emerald-500 mt-0.5">{formatFileSize(resumeFile.size)}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">Ready to process</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
              className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-all z-20 relative"
              id="remove-resume"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">
                Drag & drop your resume here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                or click to browse files
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {['PDF', 'DOCX', 'TXT'].map(fmt => (
                <span key={fmt} className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-lg">
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
        <span className="w-8 h-px bg-slate-200"></span>
        <span className="font-medium">OR</span>
        <span className="w-8 h-px bg-slate-200"></span>
      </div>

      {uploadError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium text-center">
          {uploadError}
        </div>
      )}

      <button 
        onClick={() => alert("LinkedIn import is coming in a future update. Upload your resume above for the best results.")}
        className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 hover:border-blue-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
        Import from LinkedIn
      </button>

      {/* Profile Photo */}
      <div className="mt-7 border-t border-slate-100 pt-6 text-left">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Profile Photo (Optional)
        </h3>
        <div className="flex items-center gap-4">
           {photoFile ? (
             <div className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-100 shrink-0 shadow-sm">
               <img src={photoUrlRef.current} alt="Profile" className="w-full h-full object-cover" />
               <button 
                 onClick={() => setPhotoFile(null)}
                 className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                 id="remove-photo"
               >
                 Remove
               </button>
             </div>
           ) : (
             <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50/50 hover:border-blue-300 transition-colors cursor-pointer shrink-0">
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={(e) => setPhotoFile(e.target.files[0])}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 id="photo-file-input"
               />
               <Users className="w-6 h-6 text-slate-300" />
             </div>
           )}
           <div className="flex-1">
             <p className="text-xs text-slate-500 mb-1">Add a photo to match premium layouts.</p>
             <p className="text-[10px] text-slate-400">JPG, PNG supported. Max 2MB.</p>
           </div>
        </div>
      </div>
    </div>
  );
});

export default ResumeUpload;
