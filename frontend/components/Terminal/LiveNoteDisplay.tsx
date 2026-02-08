"use client";
import { useDirectorStore } from '@/stores/useDirectorStore';
import { FileText, User } from 'lucide-react';

export default function LiveNoteDisplay() {
  const { soapNote, transcript } = useDirectorStore();

  return (
    <div className="flex flex-col h-full gap-4">
        {/* Transcript Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex flex-col h-1/3">
             <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 uppercase tracking-wider">
                <User className="w-3 h-3" />
                Live Transcript
             </div>
             <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed opacity-80">
                {transcript || <span className="text-slate-600 italic">Listening...</span>}
             </div>
        </div>

        {/* SOAP Note Section */}
        <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 flex-1 flex flex-col shadow-inner">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs text-cyan-500 font-bold uppercase tracking-wider">
                <FileText className="w-3 h-3" />
                Live Documentation
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                {soapNote.subjective && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <span className="text-slate-500 font-bold block mb-1">SUBJECTIVE</span>
                        <div className="text-slate-300 pl-2 border-l-2 border-slate-800">{soapNote.subjective}</div>
                    </div>
                )}
                {soapNote.objective && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <span className="text-slate-500 font-bold block mb-1">OBJECTIVE</span>
                        <div className="text-slate-300 pl-2 border-l-2 border-slate-800">{soapNote.objective}</div>
                    </div>
                )}
                {soapNote.assessment && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <span className="text-slate-500 font-bold block mb-1">ASSESSMENT & PLAN</span>
                         <div className="text-slate-300 pl-2 border-l-2 border-slate-800">{soapNote.assessment}</div>
                         <div className="text-slate-300 pl-2 border-l-2 border-slate-800 mt-1">{soapNote.plan}</div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
