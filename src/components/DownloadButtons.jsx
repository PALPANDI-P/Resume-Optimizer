import React, { useState, memo } from 'react';
import { Loader2, FileDown, Download, CheckCircle2 } from 'lucide-react';

const DownloadButtons = memo(function DownloadButtons({ content, filename, templateId, compact = false }) {
  const [downloading, setDownloading] = useState(null);
  const [downloaded, setDownloaded] = useState(null);

  const handleDownload = async (format) => {
    setDownloading(format);
    setDownloaded(null);
    try {
      const token = localStorage.getItem('resumeoptimizer_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ content, format, filename, template_id: templateId }),
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setDownloaded(format);
      setTimeout(() => setDownloaded(null), 3000);
    } catch (err) {
      alert('Error downloading file: ' + err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className={`flex gap-2.5 ${compact ? 'w-auto' : 'w-full'}`} id="download-buttons">
      <button
        onClick={() => handleDownload('pdf')}
        disabled={downloading !== null}
        className={`btn-secondary flex items-center gap-2 text-sm justify-center ${compact ? '!py-1.5 !px-3' : '!py-3 !px-5 flex-1'}`}
        id="download-pdf"
      >
        {downloading === 'pdf' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : downloaded === 'pdf' ? (
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
        ) : (
          <FileDown className="w-4 h-4 text-red-500" />
        )}
        {downloaded === 'pdf' ? 'Downloaded!' : 'PDF'}
      </button>
      <button
        onClick={() => handleDownload('docx')}
        disabled={downloading !== null}
        className={`btn-primary-blue flex items-center gap-2 text-sm justify-center ${compact ? '!py-1.5 !px-3' : '!py-3 !px-5 flex-1'}`}
        id="download-docx"
      >
        {downloading === 'docx' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : downloaded === 'docx' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {downloaded === 'docx' ? 'Downloaded!' : 'Word'}
      </button>
    </div>
  );
});

export default DownloadButtons;