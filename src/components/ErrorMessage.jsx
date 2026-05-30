import React, { memo } from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = memo(function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-slide-down mb-6" id="error-message">
      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
      <p className="text-sm font-medium text-red-700 flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

export default ErrorMessage;
