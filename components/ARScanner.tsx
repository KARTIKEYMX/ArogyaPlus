import React, { useState, useEffect, useRef } from 'react';
import { X, Scan, Zap, AlertTriangle, Info } from 'lucide-react';
import { identifyMedicine } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { ARScanResult } from '../types';

interface ARScannerProps {
  onClose: () => void;
}

export const ARScanner: React.FC<ARScannerProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<ARScanResult | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setScanning(true);
      }
    };

    startCamera();

    const timer = setTimeout(async () => {
      audioService.triggerHaptic();
      const mockMeds = ['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Vitamin D'];
      const found = mockMeds[Math.floor(Math.random() * mockMeds.length)];
      const data = await identifyMedicine(found);
      setResult(data);
      setScanning(false);
      audioService.triggerHaptic([50, 100, 50]);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="absolute inset-0 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-arogya-teal/10 to-arogya-navy/20 pointer-events-none"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
           <div className="bg-black/40 backdrop-blur-md border border-arogya-accent/30 text-arogya-accent px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2">
             <div className="w-2 h-2 bg-arogya-accent rounded-full animate-pulse"></div>
             AR MED-SCANNER V2.0
           </div>
           <button onClick={onClose} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/10">
             <X size={24} />
           </button>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none">
          <div className="ar-corner ar-tl"></div>
          <div className="ar-corner ar-tr"></div>
          <div className="ar-corner ar-bl"></div>
          <div className="ar-corner ar-br"></div>
          
          {scanning && (
            <div className="absolute inset-0 bg-arogya-accent/5 animate-pulse flex items-center justify-center">
               <Scan className="text-arogya-accent w-12 h-12 animate-spin-slow opacity-50" />
            </div>
          )}
          
          {scanning && <div className="scan-line animate-scan top-0"></div>}
        </div>

        <div className={`transform transition-all duration-500 ${result ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          {result && (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-arogya-teal/50 rounded-2xl p-6 text-white shadow-[0_0_30px_rgba(0,191,166,0.3)]">
               <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-arogya-accent">{result.name}</h2>
                    <p className="text-xs text-gray-400 font-mono">CONFIDENCE: {(result.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-arogya-teal/20 p-2 rounded-lg">
                    <Zap className="text-arogya-teal" size={24} />
                  </div>
               </div>
               
               <div className="space-y-4">
                 <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <h4 className="text-xs text-gray-400 uppercase mb-1 flex items-center gap-1"><Info size={10}/> Usage</h4>
                    <p className="text-sm leading-relaxed">{result.usage}</p>
                 </div>
                 <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <h4 className="text-xs text-red-400 uppercase mb-1 flex items-center gap-1"><AlertTriangle size={10}/> Side Effects</h4>
                    <p className="text-sm leading-relaxed text-gray-200">{result.sideEffects}</p>
                 </div>
               </div>

               <button onClick={() => { setScanning(true); setResult(null); audioService.triggerHaptic(); }} className="w-full mt-4 py-3 bg-arogya-teal text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition">
                 Scan Another
               </button>
            </div>
          )}
          {!result && (
             <div className="text-center">
               <p className="text-white/70 font-mono text-sm bg-black/50 inline-block px-4 py-2 rounded-lg">Point camera at medicine packaging</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};