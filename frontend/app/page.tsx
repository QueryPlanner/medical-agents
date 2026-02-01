"use client";

import SpriteContainer from "@/components/Stage/SpriteContainer";
import Background from "@/components/Stage/Background";
import DialogueBox from "@/components/HUD/DialogueBox";
import ControlPanel from "@/components/HUD/ControlPanel";
import { useMockScript } from "@/hooks/useMockScript";

export default function Home() {
  const { runScript, isPlaying } = useMockScript();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Background Layer (Z-0) */}
      <Background />

      {/* 2. Stage Layer (Z-10) */}
      <SpriteContainer />

      {/* 3. HUD Layer (Z-50) */}
      <div className="relative z-50 pointer-events-none w-full h-full">
         <div className="pointer-events-auto">
            <ControlPanel onRecord={runScript} isRecording={isPlaying} />
            <DialogueBox />
         </div>
      </div>
      
      {/* Overlay Scanlines (Optional Visual Polish) */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
    </main>
  );
}