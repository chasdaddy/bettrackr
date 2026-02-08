import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'error', onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = type === 'error' ? XCircle : CheckCircle2;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] max-w-sm transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl ${type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
