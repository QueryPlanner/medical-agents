"use client";
import { motion } from 'framer-motion';
import { Check, Clock, ShieldCheck, Zap } from 'lucide-react';
import { useDirectorStore } from '@/stores/useDirectorStore';

export default function ImpactScoreboard() {
  const { impactScoreboardActive } = useDirectorStore();

  if (!impactScoreboardActive) return null;

  const stats = [
    { label: "Documentation Time", value: "12s", sub: "vs 14m avg", icon: Clock, color: "text-emerald-400" },
    { label: "Billing Accuracy", value: "99.8%", sub: "Code G43.109", icon: Check, color: "text-blue-400" },
    { label: "Compliance", value: "100%", sub: "HIPAA Local", icon: ShieldCheck, color: "text-purple-400" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                Session Impact Report
            </h2>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                OPTIMIZED
            </div>
        </div>
        
        <div className="p-8 grid grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
                <motion.div 
                    key={stat.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="flex flex-col items-center text-center p-4 bg-slate-950 rounded-xl border border-slate-800"
                >
                    <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                    <div className="text-xs text-slate-600 mt-2">{stat.sub}</div>
                </motion.div>
            ))}
        </div>

        <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
             <p className="text-slate-500 text-xs font-mono">
                System ID: MED-AGENT-09 • Audit Log #99283-A • Date: 2026-02-01
             </p>
        </div>
      </motion.div>
    </div>
  );
}
