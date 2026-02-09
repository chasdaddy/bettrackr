import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const FALLBACK_MESSAGES = [
  { text: 'Lakers -3.5 moved to -4.5 at DraftKings', tag: 'NBA' },
  { text: 'Mahomes O285.5 yards seeing heavy action', tag: 'NFL' },
  { text: 'Djokovic ML dropped from -180 to -155', tag: 'Tennis' },
  { text: 'Yankees/Red Sox total shifted O8.5 to O9', tag: 'MLB' },
  { text: 'UFC 312 main event line reversing sharply', tag: 'UFC' },
];

export default function LiveWire({ messages }) {
  const items = messages && messages.length > 0 ? messages : FALLBACK_MESSAGES;
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % items.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  const msg = items[index % items.length];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-glowPulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <Radio className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Wire</span>
      </div>
      <div className={`transition-all duration-300 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mr-2">{msg.tag}</span>
        <span className="text-xs text-slate-300">{msg.text}</span>
      </div>
    </div>
  );
}
