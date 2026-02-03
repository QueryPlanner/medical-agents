"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useDirectorStore } from "@/stores/useDirectorStore";

// Config: Map IDs to your image files
const AGENTS: Record<string, { src: string; position: string }> = {
  MedicalRouter: { src: '/medical-agent/coordinator-bg-rm.png', position: 'justify-center z-10' }, // Center back
  SOAPGenerator: { src: '/medical-agent/scribe-bg-rm.png', position: 'left-10 z-20' },          // Left front
  ICD10Agent: { src: '/medical-agent/coder-bg-rm.png', position: 'left-10 z-30' },           // Left front (Replaces Scribe)
  ImageAnalyzer: { src: '/medical-agent/scribe-bg-rm.png', position: 'right-52 z-30' },       // Overlays ICD sometimes
};

export default function SpriteContainer() {
  const { visibleAgents, currentSpeaker, isProcessing } = useDirectorStore();

  return (
    <div className="fixed inset-0 pointer-events-none flex items-end justify-center pb-0 overflow-hidden">
      <AnimatePresence>
        {visibleAgents.map((id) => {
          const config = AGENTS[id];
          if (!config) return null;
          
          const isActive = currentSpeaker === id;

          return (
            <motion.div
              key={id}
              className={`absolute -bottom-12 transition-all duration-500 ${config.position}`}
              // Entrance/Exit Animation
              initial={{ y: 200, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                scale: isActive ? 1.15 : 0.9, // Active speaker grows
                filter: isActive ? 'grayscale(0%) brightness(1.1)' : 'grayscale(60%) brightness(0.8)',
              }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              {/* Using img tag for now as requested, could be optimized with Next/Image later */}
              <img 
                src={config.src} 
                alt={id} 
                className="h-[60vh] w-auto object-contain drop-shadow-2xl"
              />
              
              {/* Optional: Thinking Pulse */}
              {isActive && isProcessing && (
                 <motion.div 
                   className="absolute top-10 right-10 w-4 h-4 bg-cyan-400 rounded-full"
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ repeat: Infinity, duration: 1 }}
                 />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
