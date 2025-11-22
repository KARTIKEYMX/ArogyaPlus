import React from 'react';
import { Activity } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
  isExiting: boolean;
}

export const Splash: React.FC<SplashProps> = ({ onComplete, isExiting }) => {
  return (
    <div 
      className={`fixed inset-0 z-50 bg-gradient-to-br from-teal-50 to-white flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out transform origin-left preserve-3d ${isExiting ? '-rotate-y-180 opacity-0 pointer-events-none' : 'rotate-y-0'}`}
    >
      {/* 3D Logo Composition */}
      <div className="relative w-40 h-40 mb-8 preserve-3d animate-float">
        {/* Back layer (Depth) */}
        <div className="absolute inset-0 bg-blue-900 rounded-2xl transform translate-x-2 translate-y-2 opacity-20"></div>
        {/* Main Cross Shape - Horizontal */}
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-arogya-teal to-teal-400 rounded-xl shadow-lg z-10"></div>
        {/* Main Cross Shape - Vertical */}
        <div className="absolute left-1/3 top-0 w-1/3 h-full bg-gradient-to-b from-arogya-teal to-teal-500 rounded-xl shadow-lg z-20 flex items-center justify-center">
           <Activity className="text-white w-12 h-12 drop-shadow-md" />
        </div>
        {/* Heart Accent */}
        <div className="absolute -top-2 -right-2 bg-arogya-orange text-white p-2 rounded-full shadow-lg z-30 animate-pulse">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
           </svg>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-arogya-navy tracking-tight mb-2">
        Arogya<span className="text-arogya-teal">Plus</span>
      </h1>
      <p className="text-lg text-gray-500 font-medium tracking-wide mb-8">Your Trusted Health Companion</p>

      <p className="text-sm text-gray-400 max-w-xs text-center mb-12 leading-relaxed">
        Secure access to doctors, diagnostics, and your complete digital health history.
      </p>

      <button 
        onClick={onComplete}
        className="px-8 py-3 bg-arogya-navy text-white rounded-full font-semibold hover:bg-blue-900 hover:scale-105 transition-all shadow-xl shadow-blue-900/20"
      >
        Get Started
      </button>

      {/* Background Decor */}
      <div className="absolute top-10 left-10 text-arogya-teal/10">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.5 12H9v-2.5H6.5v-2H9V8h1.5v2.5h2.5v2H10.5V15z"/></svg>
      </div>
      <div className="absolute bottom-10 right-10 text-arogya-orange/10">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </div>
    </div>
  );
};
