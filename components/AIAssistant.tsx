import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, ChevronDown, Cpu, Volume2, VolumeX } from 'lucide-react';
import { streamGeminiResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { audioService } from '../services/audioService';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "ArogyaPlus AI Online. How can I assist you?", timestamp: new Date() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1;
    utterance.rate = 1.1;
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    audioService.triggerHaptic(10);
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = await streamGeminiResponse(userMsg.text, history);
      
      let fullResponse = "";
      const modelMsg: ChatMessage = { role: 'model', text: "", timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);

      for await (const chunk of stream) {
        const chunkText = chunk.text || "";
        fullResponse += chunkText;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = fullResponse;
          return newMsgs;
        });
      }
      speakText(fullResponse);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection interrupted. Check vitals link.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed left-0 right-0 z-[60] flex justify-center transition-all duration-500 ${isOpen ? 'bottom-0' : 'bottom-6'}`}>
      <div 
        className={`
          relative flex flex-col overflow-hidden transition-all duration-500 ease-spring shadow-[0_10px_40px_-10px_rgba(0,191,166,0.5)]
          ${isOpen 
            ? 'w-full md:w-[500px] h-[80vh] md:h-[600px] rounded-t-3xl bg-slate-900/95 backdrop-blur-xl border border-arogya-teal/30' 
            : 'w-[90%] md:w-[400px] h-16 rounded-full bg-white/90 backdrop-blur-xl border border-white/50 hover:scale-105 cursor-pointer'}
        `}
        onClick={(e) => !isOpen && (setIsOpen(true), audioService.triggerHaptic())}
      >
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-arogya-teal to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,191,166,0.6)] animate-pulse-slow">
                <Sparkles size={20} />
              </div>
              <span className="text-arogya-navy font-semibold text-sm">Ask Arogya AI...</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-arogya-teal">
              <Mic size={20} />
            </div>
          </div>
        )}

        {isOpen && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-arogya-teal/20 bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                   <div className="w-2 h-2 rounded-full bg-arogya-teal absolute -top-0.5 -right-0.5 animate-ping"></div>
                   <Cpu size={20} className="text-arogya-teal" />
                </div>
                <div>
                  <span className="font-bold text-white tracking-wide">AROGYA CORE</span>
                  <p className="text-[10px] text-arogya-teal/80 font-mono">SYSTEM ONLINE</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setVoiceEnabled(!voiceEnabled); }} className="p-2 text-gray-400 hover:text-white">
                  {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                >
                  <ChevronDown size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" onClick={(e) => e.stopPropagation()}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-4 text-sm shadow-lg backdrop-blur-sm
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-br from-arogya-teal to-teal-700 text-white rounded-2xl rounded-br-none border border-teal-400/30' 
                      : 'bg-slate-800/50 text-gray-200 rounded-2xl rounded-bl-none border border-white/10'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 p-4 rounded-2xl rounded-bl-none border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-arogya-teal rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-arogya-teal rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-arogya-teal rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-white/10 shrink-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 bg-slate-800/80 rounded-full px-2 py-1 border border-white/10 focus-within:border-arogya-teal focus-within:shadow-[0_0_15px_rgba(0,191,166,0.3)] transition-all duration-300">
                <button 
                  onClick={() => { setIsRecording(!isRecording); audioService.triggerHaptic(); }}
                  className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                >
                  <Mic size={20} />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter health query..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-white placeholder-gray-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`p-2 rounded-full transition-all ${input.trim() ? 'bg-arogya-teal text-slate-900 shadow-md hover:scale-110' : 'text-gray-600'}`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};