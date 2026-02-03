"use client";

import SpriteContainer from "@/components/Stage/SpriteContainer";
import Background from "@/components/Stage/Background";
import DialogueBox from "@/components/HUD/DialogueBox";
import XRayOverlay from "@/components/Stage/XRayOverlay";
import LiveTerminal from "@/components/Terminal/LiveTerminal";
import { useMockScript } from "@/hooks/useMockScript";

export default function Home() {
  useMockScript();

  return (
    <main className="flex h-screen w-screen bg-slate-950 overflow-hidden">
      
      {/* Visual Novel Stage (70%) */}
      <section className="relative w-[70%] h-full border-r border-slate-800">
        <Background />
        <SpriteContainer />
        <XRayOverlay />
        
        {/* HUD Layer within the Stage */}
        <div className="absolute inset-0 pointer-events-none z-50">
           <div className="pointer-events-auto h-full relative">
              <DialogueBox />
           </div>
        </div>
      </section>

      {/* Live Clinical Terminal (30%) */}
      <section className="w-[30%] h-full relative z-10">
         <LiveTerminal />
      </section>

      {/* Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none z-[200] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
    </main>
  );
}
