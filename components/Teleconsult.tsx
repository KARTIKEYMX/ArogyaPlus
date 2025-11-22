import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Layout, Shield, Send, X } from 'lucide-react';
import { ChatMessage } from '../types';
import { audioService } from '../services/audioService';

interface TeleconsultProps {
  onEndCall: () => void;
}

export const Teleconsult: React.FC<TeleconsultProps> = ({ onEndCall }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'doctor', text: "Hi! I'm Dr. Anjali. I'm reviewing your vitals now.", timestamp: new Date() }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: chatMsg, timestamp: new Date() }]);
    setChatMsg('');
    audioService.triggerHaptic();
    
    // Simulated reply
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'doctor', text: "I see. Let me check your latest report.", timestamp: new Date() }]);
      audioService.triggerHaptic([50, 50]); // Double tap for notification
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-fade-in">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
            <Shield size={18} className="text-arogya-teal" />
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              Dr. Anjali Gupta 
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </h3>
            <p className="text-white/70 text-xs">Cardiologist • Apollo Hospital</p>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-full text-white/90 font-mono text-sm border border-white/10">
          {formatTime(duration)}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-800">
        <img 
          src="https://images.unsplash.com/photo-1559839734-2b71ea86065e?q=80&w=2070&auto=format&fit=crop" 
          alt="Doctor"
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Holographic Vitals Overlay */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-16 right-4 md:right-10 w-48 md:w-64 h-32 border border-arogya-teal/30 rounded-lg bg-arogya-teal/5 backdrop-blur-sm p-4">
              <p className="text-arogya-teal text-xs font-mono mb-2">LIVE VITALS STREAM</p>
              <div className="flex items-end gap-1 h-12 mb-2">
                 {[40, 60, 45, 70, 50, 80, 60, 55, 75, 50, 60, 70].map((h, i) => (
                   <div key={i} style={{height: `${h}%`}} className="flex-1 bg-arogya-teal/50 rounded-t-sm animate-pulse"></div>
                 ))}
              </div>
              <div className="flex justify-between text-white/80 text-xs font-mono">
                <span>HR: 72 bpm</span>
                <span>SpO2: 98%</span>
              </div>
           </div>
        </div>

        {/* Self View */}
        <div className="absolute bottom-24 right-6 w-24 h-36 md:w-32 md:h-48 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
           <img 
             src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
             alt="Me"
             className="w-full h-full object-cover transform scale-x-[-1]"
           />
           {isVideoOff && (
             <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white">
               <VideoOff size={24} />
             </div>
           )}
        </div>

        {/* Chat Overlay */}
        {showChat && (
          <div className="absolute inset-x-0 bottom-24 mx-4 md:right-auto md:left-4 md:w-80 h-[40vh] bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col">
            <div className="p-3 border-b border-white/10 flex justify-between items-center">
               <span className="text-white text-sm font-bold">Secure Chat</span>
               <button onClick={() => setShowChat(false)}><X size={16} className="text-white/70" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
               {messages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] ${m.role === 'user' ? 'bg-arogya-teal text-white' : 'bg-white/10 text-gray-200'}`}>
                      {m.text}
                    </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>
            <div className="p-3 flex gap-2">
               <input 
                 value={chatMsg}
                 onChange={e => setChatMsg(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && sendChat()}
                 className="flex-1 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-white text-sm outline-none focus:border-arogya-teal"
                 placeholder="Type message..."
               />
               <button onClick={sendChat} className="bg-arogya-teal p-1.5 rounded-full text-black"><Send size={14}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-24 bg-gray-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4 md:gap-6 pb-4 px-4">
        <button 
          onClick={() => { setIsMuted(!isMuted); audioService.triggerHaptic(); }}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700 border border-white/10'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        
        <button 
          onClick={() => { setIsVideoOff(!isVideoOff); audioService.triggerHaptic(); }}
          className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700 border border-white/10'}`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button 
          onClick={() => { onEndCall(); audioService.triggerHaptic(50); }}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all shadow-lg shadow-red-500/40"
        >
          <PhoneOff size={28} />
        </button>

        <button 
          onClick={() => { setShowChat(!showChat); audioService.triggerHaptic(); }}
          className={`p-4 rounded-full transition-all ${showChat ? 'bg-arogya-teal text-white' : 'bg-gray-800 text-white hover:bg-gray-700 border border-white/10'}`}
        >
          <MessageSquare size={24} />
          {messages.length > 0 && !showChat && (
             <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
          )}
        </button>
      </div>
    </div>
  );
};