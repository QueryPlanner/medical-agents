"use client";
import Image from 'next/image';

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden bg-slate-950">
      <div className="absolute inset-0 opacity-40 blur-[2px]">
         {/* Using generic <img> for now as placeholder is SVG */}
        <Image 
           src="/medical-agent/background.png" 
           alt="Clinic Background" 
           fill
           className="object-cover"
        />
      </div>
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/20 to-slate-950/80" />
      
      {/* Grid Overlay for Sci-Fi feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
