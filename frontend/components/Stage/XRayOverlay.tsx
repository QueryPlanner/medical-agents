"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useDirectorStore } from '@/stores/useDirectorStore';
import { ScanEye, AlertTriangle } from 'lucide-react';

export default function XRayOverlay() {
  const { xrayActive } = useDirectorStore();

  return (
    <AnimatePresence>
      {xrayActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-20 left-20 z-40 p-4"
        >
          <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-black w-[400px] h-[500px]">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full bg-cyan-950/80 backdrop-blur text-cyan-400 text-xs p-2 flex justify-between items-center z-10">
                <span className="flex items-center gap-2 font-bold"><ScanEye className="w-4 h-4" /> IMG-2026-XR-L-HAND</span>
                <span className="animate-pulse text-red-400 font-bold">DETECTED: FRACTURE</span>
            </div>

            {/* X-Ray Placeholder - Since we don't have a real image yet, we style a div to look like one */}
            <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
               {/* Grayscale gradient to simulate x-ray structure */}
               <div className="w-32 h-64 bg-gradient-to-b from-slate-800 to-slate-600 rounded-full blur-sm opacity-50 transform -rotate-12 translate-y-10" />
               <div className="w-64 h-32 bg-gradient-to-r from-slate-800 to-slate-600 rounded-full blur-md opacity-30 absolute top-1/3" />
               
               {/* Fracture Highlight Box */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1, duration: 0.5 }}
                 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-red-500 bg-red-500/10 rounded-lg flex items-start justify-end p-1"
               >
                  <div className="bg-red-500 text-white text-[10px] px-1 font-bold">98% CONFIDENCE</div>
               </motion.div>
            </div>

            {/* Scanning Line */}
            <motion.div 
               className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-20"
               animate={{ top: ["0%", "100%", "0%"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
