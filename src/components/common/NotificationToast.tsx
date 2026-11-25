import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-stone-900 border-emerald-500/50 text-white',
    error: 'bg-rose-950 border-rose-500/50 text-rose-100',
    info: 'bg-stone-900 border-amber-500/50 text-white',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md ${bgStyles[toast.type]}`}
      >
        {icons[toast.type]}
        <p className="text-sm font-medium tracking-wide flex-1">{toast.message}</p>
        <button
          onClick={hideToast}
          className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
