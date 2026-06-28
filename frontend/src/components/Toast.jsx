import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'bg-emerald-950 border-emerald-500/30 text-emerald-300 shadow-emerald-900/10',
    error: 'bg-rose-950 border-rose-500/30 text-rose-300 shadow-rose-900/10',
    info: 'bg-sky-950 border-sky-500/30 text-sky-300 shadow-sky-900/10',
    warning: 'bg-amber-950 border-amber-500/30 text-amber-300 shadow-amber-900/10'
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    error: <AlertTriangle className="h-5 w-5 text-rose-400" />,
    info: <Info className="h-5 w-5 text-sky-400" />,
    warning: <Info className="h-5 w-5 text-amber-400" />
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl animate-bounce-short transition-all duration-300 ${styles[type] || styles.success}`}>
      <div className="flex-shrink-0">{icons[type] || icons.success}</div>
      <div className="text-sm font-medium pr-2 max-w-xs">{message}</div>
      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-slate-100 transition-colors ml-auto flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
