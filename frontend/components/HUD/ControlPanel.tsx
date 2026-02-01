"use client";
import { FileText, Upload, Activity } from 'lucide-react';

interface ControlPanelProps {
  onRecord: () => void;
  isRecording: boolean;
}

export default function ControlPanel({ onRecord, isRecording }: ControlPanelProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-20 z-50 flex flex-col items-center py-8 bg-slate-950/50 backdrop-blur-md border-r border-slate-800/50">
      
      {/* Logo / Status */}
      <div className="mb-8 p-2 rounded-full bg-cyan-950/30 border border-cyan-500/20">
        <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
      </div>

      {/* Main Actions */}
      <div className="flex flex-col gap-6 flex-1 justify-center">
        {/* Mic Button Removed for Demo Mode */}

        <button className="p-3 rounded-xl bg-slate-800/40 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 transition-all border border-transparent hover:border-cyan-500/30" title="View Logs">
          <FileText className="w-6 h-6" />
        </button>

        <button className="p-3 rounded-xl bg-slate-800/40 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 transition-all border border-transparent hover:border-cyan-500/30" title="Upload Image">
          <Upload className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-auto text-[10px] text-slate-600 font-mono -rotate-90 whitespace-nowrap mb-4">
        v.0.9.0-BETA
      </div>
    </div>
  );
}
