"use client";
import Typewriter from 'typewriter-effect';
import { useDirectorStore } from '@/stores/useDirectorStore';
import { ArrowRight } from 'lucide-react';

export default function DialogueBox() {
  const { currentSpeaker, dialogueText, isProcessing } = useDirectorStore();

  if (!currentSpeaker && !dialogueText) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50 px-4">
      {/* Speaker Name Badge */}
      <div className="absolute -top-4 left-8 z-10">
         <div className="bg-cyan-950/90 border border-cyan-500/30 text-cyan-400 px-4 py-1 rounded-t-lg font-mono text-sm tracking-widest uppercase backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            {currentSpeaker || 'System'}
         </div>
      </div>

      {/* Main Glass Panel */}
      <div className="relative bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6 min-h-[140px] shadow-2xl">
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500" />

        {/* Text Container */}
        <div className="font-mono text-lg text-slate-100 leading-relaxed tracking-wide">
            <Typewriter
              options={{
                strings: [dialogueText],
                autoStart: true,
                delay: 30,
                cursor: '█',
                deleteSpeed: 9999999, // Don't delete
              }}
              key={dialogueText} // Force re-render on text change
            />
        </div>

        {/* Next/Skip Indicator */}
        {!isProcessing && (
           <div className="absolute bottom-4 right-4 animate-pulse text-cyan-400">
             <ArrowRight className="w-6 h-6" />
           </div>
        )}
      </div>
    </div>
  );
}
