"use client";
import SystemLogStream from './SystemLogStream';
import LiveNoteDisplay from './LiveNoteDisplay';

export default function LiveTerminal() {
  return (
    <section className="w-full h-full flex flex-col p-4 gap-4 bg-slate-950 border-l border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-cyan-400 tracking-tight">CLINICAL OPS TERMINAL</h2>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500">ONLINE</span>
            </div>
        </div>

        <div className="flex-1 h-1/2 min-h-0">
            <LiveNoteDisplay />
        </div>

        <div className="h-1/3 min-h-0">
            <SystemLogStream />
        </div>
    </section>
  );
}
