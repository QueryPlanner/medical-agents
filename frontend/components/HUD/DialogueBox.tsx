"use client";
import Typewriter from 'typewriter-effect';
import { useDirectorStore } from '@/stores/useDirectorStore';
import { ArrowRight } from 'lucide-react';

export default function DialogueBox() {
  const { currentSpeaker, dialogueText, isProcessing } = useDirectorStore();

  if (!currentSpeaker && !dialogueText) return null;

  return (
    <div className="absolute bottom-8 left-8 right-8 z-50 px-4">
      {/* Speaker Name Badge */}
      <div className="absolute -top-4 left-8 z-10">
         <div className="text-cyan-400 px-4 py-1 font-mono text-sm tracking-widest uppercase font-bold">
            {currentSpeaker || 'System'}
         </div>
      </div>

      {/* Main Glass Panel */}
      <div className="relative bg-slate-950/40 backdrop-blur-sm border-none rounded-lg p-6 min-h-[140px]">
        {/* Decorative Corner Accents - Keep these or remove? Assuming user wants just text */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50" />

        {/* Text Container */}
        <div className="font-mono text-lg text-slate-100 leading-relaxed tracking-wide shadow-black drop-shadow-md font-bold">
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
