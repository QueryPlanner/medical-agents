"use client";
import { useEffect, useRef } from 'react';
import { useDirectorStore, LogEntry } from '@/stores/useDirectorStore';
import { Terminal, ShieldAlert, CheckCircle, Activity } from 'lucide-react';

export default function SystemLogStream() {
  const { logs } = useDirectorStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-lg border border-slate-800 p-2 font-mono text-[10px] overflow-hidden">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700 text-slate-400 uppercase tracking-widest">
            <Terminal className="w-3 h-3" />
            <span>Reasoning Stream</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1">
            {logs.map((log) => (
                <div key={log.id} className="flex gap-2 animate-in slide-in-from-left-2 fade-in duration-300">
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <div className="flex-1 break-words">
                        <span className={`font-bold mr-1 ${
                            log.agent === 'ICD10Agent' ? 'text-purple-400' :
                            log.agent === 'MedicalRouter' ? 'text-blue-400' :
                            log.agent === 'ImageAnalyzer' ? 'text-emerald-400' :
                            'text-cyan-400'
                        }`}>
                            {log.agent}:
                        </span>
                        <span className={`
                            ${log.type === 'alert' ? 'text-red-400 font-bold' : ''}
                            ${log.type === 'success' ? 'text-green-400' : 'text-slate-300'}
                        `}>
                            {log.message}
                        </span>
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    </div>
  );
}
