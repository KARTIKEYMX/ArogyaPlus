import React, { useRef, useState } from 'react';
import { MedicalReport } from '../types';
import { Activity, Dna, FileText, Share2, X } from 'lucide-react';

interface HolographicReportProps {
  report: MedicalReport;
  onClose: () => void;
}

export const HolographicReport: React.FC<HolographicReportProps> = ({ report, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20;
    const y = (e.clientY - top - height / 2) / 20;
    
    containerRef.current.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md perspective-2000 overflow-hidden">
      <div className="absolute top-6 right-6 z-50">
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition">
          <X size={24} />
        </button>
      </div>

      <div 
        className="relative w-[90%] max-w-2xl aspect-[4/5] md:aspect-[16/9] preserve-3d transition-transform duration-100 ease-out"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (containerRef.current) containerRef.current.style.transform = 'rotateX(0) rotateY(0)'; }}
      >
        {/* Base Layer - The Glass Pane */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-arogya-teal/30 rounded-3xl shadow-[0_0_50px_rgba(0,191,166,0.2)] backdrop-blur-xl overflow-hidden">
           <div className="hologram-grid absolute inset-0 opacity-20"></div>
           
           {/* Header Content - Flat */}
           <div className="p-8 border-b border-white/10 relative z-10 flex justify-between items-start">
              <div>
                <div className="text-arogya-accent font-mono text-xs mb-2 tracking-widest">SECURE MEDICAL RECORD</div>
                <h1 className="text-3xl font-bold text-white mb-1">{report.title}</h1>
                <p className="text-gray-400">{report.hospital} • {report.date}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-arogya-teal/20 flex items-center justify-center border border-arogya-teal/50">
                 <Activity className="text-arogya-teal" />
              </div>
           </div>

           {/* Body Content - Scrolling */}
           <div className="p-8 relative z-10 text-gray-300 leading-relaxed h-[60%] overflow-y-auto">
             <p>{report.content}</p>
             <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-xs text-gray-500 uppercase">Status</span>
                  <p className="text-arogya-accent font-bold">Analyzed by AI</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-xs text-gray-500 uppercase">Security</span>
                  <p className="text-green-400 font-bold flex items-center gap-2">Encrypted <Dna size={14}/></p>
                </div>
             </div>
           </div>
        </div>

        {/* Floating Layer 1 - Data Points */}
        <div className="absolute top-20 right-10 w-32 h-32 holo-layer pointer-events-none">
           <div className="w-full h-full bg-arogya-teal/10 rounded-full border border-arogya-teal/30 flex items-center justify-center animate-spin-slow">
              <div className="w-24 h-24 border border-dashed border-arogya-teal/50 rounded-full"></div>
           </div>
        </div>

        {/* Floating Layer 2 - Text Outline */}
        <div className="absolute bottom-20 left-10 holo-layer-2 pointer-events-none">
           <div className="text-[100px] font-bold text-white/5 leading-none select-none">
              AP+
           </div>
        </div>

        {/* Floating Layer 3 - Actions */}
        <div className="absolute -right-6 bottom-10 flex flex-col gap-4 holo-layer">
           <button className="w-12 h-12 rounded-full bg-arogya-navy border border-arogya-teal text-arogya-teal flex items-center justify-center shadow-lg hover:scale-110 transition">
             <Share2 size={20} />
           </button>
           <button className="w-12 h-12 rounded-full bg-arogya-navy border border-arogya-teal text-arogya-teal flex items-center justify-center shadow-lg hover:scale-110 transition">
             <FileText size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};