import React, { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, Search, Calendar, FileText, Activity, 
  Stethoscope, Microscope, Menu, Bell, ShieldCheck, QrCode,
  Zap, Heart, Brain, Video, Pill, AlertCircle, X, ChevronRight, Upload,
  Music, Volume2, VolumeX, Eye, ScanLine, Clock, Plus, Download, AlertTriangle, CheckCircle
} from 'lucide-react';
import { UserProfile, Reminder, MedicalReport, HealthInsight, Appointment, AIReportAnalysis } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Teleconsult } from './Teleconsult';
import { analyzeMedicalReport, generatePredictiveInsights } from '../services/geminiService';
import { dataService, VitalData } from '../services/dataService';
import { audioService } from '../services/audioService';
import { ARScanner } from './ARScanner';
import { HolographicReport } from './HolographicReport';
import { DoctorFinder, ReportUploader, MedicineForm } from './ServiceViews';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const TiltCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    }
  };

  return (
    <div 
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-100 ease-out transform-style-3d ${className}`}
    >
      {children}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showTeleconsult, setShowTeleconsult] = useState(false);
  const [showARScanner, setShowARScanner] = useState(false);
  const [selectedHologram, setSelectedHologram] = useState<MedicalReport | null>(null);
  const [showMedForm, setShowMedForm] = useState(false);
  
  const [liveHeartRate, setLiveHeartRate] = useState(72);
  const [vitalsHistory, setVitalsHistory] = useState<VitalData[]>([]);
  const [scanActive, setScanActive] = useState(true);
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [sosActive, setSosActive] = useState(false);
  const [sosCount, setSosCount] = useState(3);

  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [zenMode, setZenMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Structured Analysis State
  const [analyzingReport, setAnalyzingReport] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIReportAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleZenMode = () => {
    audioService.triggerHaptic(50);
    const isPlaying = audioService.toggleZenMode();
    setZenMode(isPlaying);
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    refreshData();
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const data = await generatePredictiveInsights({ hr: 72, sleep: 6.5, steps: 8000 });
    setInsights(data);
  };

  const refreshData = () => {
    setReminders(dataService.getReminders());
    setReports(dataService.getReports());
    setAppointments(dataService.getAppointments());
    setVitalsHistory(dataService.getVitalsHistory());
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
  };

  useEffect(() => {
    if (!scanActive) return;
    const interval = setInterval(() => {
      const nextVal = Math.floor(60 + Math.random() * 40);
      setLiveHeartRate(nextVal);
      const newHistory = dataService.addVitalReading(nextVal);
      setVitalsHistory(newHistory);
    }, 2000);
    return () => clearInterval(interval);
  }, [scanActive]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosActive && sosCount > 0) {
      timer = setTimeout(() => {
        setSosCount(c => c - 1);
        audioService.triggerHaptic(100);
      }, 1000);
    } else if (sosActive && sosCount === 0) {
      alert("EMERGENCY CONTACTS NOTIFIED & AMBULANCE DISPATCHED TO LOCATION");
      setSosActive(false);
      setSosCount(3);
    }
    return () => clearTimeout(timer);
  }, [sosActive, sosCount]);

  const handleAnalyzeReport = async (report: MedicalReport) => {
    audioService.triggerHaptic();
    setAnalyzingReport(report.id);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeMedicalReport(report.content || "");
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleMedication = (id: string) => {
    dataService.toggleReminder(id);
    audioService.triggerHaptic(10);
    refreshData();
  };

  const services = [
    { id: 'nearby', title: 'Doctor Near Me', icon: <MapPin className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', desc: 'Find closest specialists' },
    { id: 'best', title: 'Best Doctor', icon: <Stethoscope className="w-6 h-6" />, color: 'bg-teal-100 text-teal-600', desc: 'Top rated by specialty' },
    { id: 'diagnosis', title: 'Diagnosis', icon: <Microscope className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', desc: 'Book lab tests & scans' },
    { id: 'scan', title: 'Scan & Book', icon: <QrCode className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600', desc: 'Instant queue booking' },
    { id: 'reports', title: 'Your Reports', icon: <FileText className="w-6 h-6" />, color: 'bg-green-100 text-green-600', desc: 'AI-Powered Analysis' },
    { id: 'tele', title: 'Teleconsult', icon: <Video className="w-6 h-6" />, color: 'bg-rose-100 text-rose-600', desc: 'Video call doctors' },
  ];

  if (showTeleconsult) {
    return <Teleconsult onEndCall={() => setShowTeleconsult(false)} />;
  }

  if (showARScanner) {
    return <ARScanner onClose={() => setShowARScanner(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden font-sans">
      
      {selectedHologram && (
        <HolographicReport report={selectedHologram} onClose={() => setSelectedHologram(null)} />
      )}

      {/* SOS Overlay */}
      {sosActive && (
        <div className="fixed inset-0 z-[100] bg-red-600/90 backdrop-blur-lg flex flex-col items-center justify-center text-white animate-pulse">
           <AlertCircle size={80} className="mb-4" />
           <h1 className="text-4xl font-bold">SENDING SOS</h1>
           <p className="text-lg mt-2">Notifying Emergency Contacts in...</p>
           <div className="text-9xl font-black mt-6">{sosCount}</div>
           <button 
             onClick={() => { setSosActive(false); setSosCount(3); }}
             className="mt-12 px-8 py-3 bg-white text-red-600 rounded-full font-bold text-lg hover:bg-gray-100"
           >
             CANCEL
           </button>
        </div>
      )}

      {/* AI Analysis Modal */}
      {analyzingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
            <div className="p-6 bg-arogya-navy text-white flex justify-between items-center">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Brain className="text-arogya-teal" /> AI Analysis Engine
               </h3>
               <button onClick={() => { setAnalyzingReport(null); setAnalysisResult(null); }} className="p-2 hover:bg-white/20 rounded-full">
                 <X size={20} />
               </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
               {isAnalyzing ? (
                 <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-16 h-16 border-4 border-arogya-teal border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-arogya-teal font-medium animate-pulse">Processing medical data...</p>
                 </div>
               ) : analysisResult ? (
                 <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Summary</h4>
                      <p className="text-gray-800 font-medium leading-relaxed">{analysisResult.summary}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Key Findings</h4>
                      <div className="grid gap-3">
                        {analysisResult.findings.map((find, i) => (
                          <div key={i} className={`p-3 rounded-lg border-l-4 flex items-start gap-3 ${find.severity === 'high' ? 'bg-red-50 border-red-500' : find.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'}`}>
                             {find.severity === 'high' && <AlertTriangle className="text-red-500 shrink-0" size={20} />}
                             {find.severity === 'medium' && <AlertCircle className="text-yellow-500 shrink-0" size={20} />}
                             {find.severity === 'low' && <CheckCircle className="text-green-500 shrink-0" size={20} />}
                             <span className="text-gray-700 text-sm">{find.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                         <h4 className="text-sm font-bold text-blue-600 uppercase mb-2">Recommendations</h4>
                         <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                           {analysisResult.recommendations.map((rec, i) => (
                             <li key={i}>{rec}</li>
                           ))}
                         </ul>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                         <h4 className="text-sm font-bold text-purple-600 uppercase mb-2">Medical Terms</h4>
                         <div className="space-y-2">
                           {analysisResult.medicalTerms.map((term, i) => (
                             <div key={i}>
                               <span className="font-bold text-xs text-gray-800">{term.term}:</span>
                               <span className="text-xs text-gray-600 ml-1">{term.definition}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="text-center text-red-500">Analysis Failed. Try again.</div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Service Modals */}
      {activeService && !analyzingReport && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 bg-arogya-navy text-white flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-xl font-bold">{services.find(s => s.id === activeService)?.title}</h3>
                <p className="text-blue-200 text-sm mt-1">Secure Access</p>
              </div>
              <button onClick={() => setActiveService(null)} className="p-1 bg-white/20 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
               {activeService === 'tele' && (
                 <div className="text-center py-8">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                      <Video size={40} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Instant Doctor Connect</h3>
                    <p className="mb-6 text-gray-600 text-sm">Start a secure video consultation with an available general physician immediately.</p>
                    <button 
                      onClick={() => { setActiveService(null); setShowTeleconsult(true); audioService.triggerHaptic(); }}
                      className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition shadow-lg shadow-rose-500/30 w-full"
                    >
                      Start Video Consultation
                    </button>
                 </div>
               )}

               {(activeService === 'nearby' || activeService === 'best') && (
                 <DoctorFinder onClose={() => setActiveService(null)} onBook={(appt) => { refreshData(); }} />
               )}

               {activeService === 'reports' && (
                 <div className="space-y-3">
                   {reports.map(report => (
                     <div key={report.id} className="p-4 rounded-xl border border-gray-100 hover:border-arogya-teal hover:shadow-md transition bg-white group">
                       <div className="flex items-start justify-between mb-2">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                             <FileText size={20} />
                           </div>
                           <div>
                             <p className="font-bold text-gray-800">{report.title}</p>
                             <p className="text-xs text-gray-500">{report.hospital} • {report.date}</p>
                           </div>
                         </div>
                         <button 
                           onClick={() => { setSelectedHologram(report); setActiveService(null); audioService.triggerHaptic(); }}
                           className="text-xs font-bold text-arogya-teal bg-teal-50 px-2 py-1 rounded border border-teal-100 flex items-center gap-1 hover:bg-teal-100"
                         >
                            <Eye size={12} /> 3D VIEW
                         </button>
                       </div>
                       <button 
                         onClick={() => handleAnalyzeReport(report)}
                         className="w-full mt-2 py-2 bg-gradient-to-r from-arogya-teal to-teal-600 text-white rounded-lg text-sm font-medium opacity-90 hover:opacity-100 flex items-center justify-center gap-2 transition-all"
                       >
                         <Brain size={14} /> Analyze with AI
                       </button>
                     </div>
                   ))}
                   <ReportUploader onUpload={refreshData} />
                 </div>
               )}
               
               {['diagnosis', 'scan'].includes(activeService) && (
                 <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                    <QrCode size={48} className="mb-4 opacity-30" />
                    <p>Digital queue system coming soon.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl p-6" onClick={e => e.stopPropagation()}>
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-gradient-to-br from-arogya-teal to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">AP</div>
               <span className="text-xl font-bold text-arogya-navy">ArogyaPlus</span>
            </div>
            <div className="space-y-4">
              {installPrompt && (
                <button onClick={handleInstallClick} className="w-full py-3 bg-arogya-teal text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg">
                  <Download size={20} /> Install App
                </button>
              )}
              <button onClick={() => { dataService.resetData(); window.location.reload(); }} className="w-full py-2 text-gray-600 font-medium bg-gray-50 hover:bg-gray-100 rounded-lg transition">Reset Demo Data</button>
              <button onClick={onLogout} className="w-full py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSidebarOpen(true); audioService.triggerHaptic(); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><Menu size={24} /></button>
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-gradient-to-br from-arogya-teal to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">AP</div>
               <span className="font-bold text-xl text-arogya-navy tracking-tight hidden sm:block">ArogyaPlus</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {installPrompt && (
                <button onClick={handleInstallClick} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-arogya-teal/10 text-arogya-teal rounded-full border border-arogya-teal/30 font-bold text-sm hover:bg-arogya-teal hover:text-white transition-colors">
                  <Download size={16} /> Install
                </button>
             )}
             <button onClick={toggleZenMode} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold text-sm transition-colors ${zenMode ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
               {zenMode ? <Volume2 size={16} /> : <Music size={16} />} 
               Zen Mode
             </button>
             <button onClick={() => setSosActive(true)} className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-200 font-bold text-sm hover:bg-red-600 hover:text-white transition-colors animate-pulse">
                <AlertCircle size={16} /> SOS
             </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user.firstName}</p>
                <p className="text-xs text-arogya-teal">ID: {user.arogyaId}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 p-0.5">
                <img src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=00BFA6&color=fff`} alt="Profile" className="w-full h-full object-cover rounded-full border-2 border-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 w-full space-y-6">
        {insights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {insights.map((insight, idx) => (
               <div key={idx} className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-1 shadow-lg text-white">
                 <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 h-full flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Brain size={16} className="text-purple-200" />
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-200">AI FORECAST</span>
                      </div>
                      <h3 className="font-bold text-lg">{insight.title}</h3>
                      <p className="text-sm text-purple-100">{insight.description}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Activity size={20} />
                    </div>
                 </div>
               </div>
             ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-arogya-dark rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-gray-800 text-white h-[400px]">
             <div className="absolute inset-0 hologram-grid opacity-20"></div>
             {scanActive && <div className="scan-line animate-scan"></div>}
             
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-lg font-bold text-arogya-teal flex items-center gap-2"><Activity size={18}/> Digital Twin</h3>
                     <p className="text-xs text-gray-400">Real-time Body Status</p>
                   </div>
                   <button onClick={() => setScanActive(!scanActive)} className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition">{scanActive ? 'Scanning...' : 'Pause'}</button>
                </div>

                <div className="flex-1 flex items-center justify-center relative mt-4">
                   <svg viewBox="0 0 200 400" className="h-full w-auto drop-shadow-[0_0_10px_rgba(0,191,166,0.5)]">
                      <path d="M100,30 C120,30 135,45 135,65 C135,80 125,95 100,95 C75,95 65,80 65,65 C65,45 80,30 100,30 Z M100,95 L100,110 M100,110 L150,125 L140,200 L100,200 L100,250 L120,380 M100,110 L50,125 L60,200 L100,200 L100,250 L80,380" 
                            fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="100" cy="60" r="4" fill="#00BFA6" className="animate-ping-slow" /> {/* Brain */}
                      <circle cx="110" cy="130" r="4" fill="#FF7043" className="animate-pulse" /> {/* Heart */}
                      <circle cx="100" cy="160" r="3" fill="#00E5FF" /> {/* Stomach */}
                      <circle cx="120" cy="300" r="3" fill="#FCD34D" /> {/* Knee */}
                   </svg>
                   
                   <div className="absolute top-10 left-0 bg-black/40 backdrop-blur px-3 py-1 rounded-lg border border-white/10 text-xs">
                      <span className="text-gray-400">Brain Activity</span>
                      <p className="font-mono text-arogya-teal">NORMAL</p>
                   </div>
                   <div className="absolute top-32 right-0 bg-black/40 backdrop-blur px-3 py-1 rounded-lg border border-white/10 text-xs">
                      <span className="text-gray-400">Heart Rate</span>
                      <p className="font-mono text-arogya-orange">{liveHeartRate} BPM</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[220px] flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-800">Live Heart Rhythm History</h3>
                   <div className="flex items-center gap-2 text-xs font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> LIVE TRACKING
                   </div>
                </div>
                <div className="flex-1 w-full -ml-2">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={vitalsHistory}>
                         <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#FF7043" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#FF7043" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <Area type="monotone" dataKey="value" stroke="#FF7043" strokeWidth={3} fill="url(#colorVal)" isAnimationActive={false} />
                         <YAxis hide domain={[40, 120]} />
                         <XAxis hide dataKey="timestamp" />
                         <Tooltip labelFormatter={() => ''} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 relative">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2"><Pill size={18} className="text-blue-500"/> Medication Schedule</h3>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => { setShowARScanner(true); audioService.triggerHaptic(); }}
                       className="text-xs bg-arogya-navy text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-900 transition shadow-md shadow-blue-900/20"
                     >
                       <ScanLine size={12} /> AR Scan
                     </button>
                   </div>
                </div>

                {showMedForm ? (
                   <MedicineForm onAdd={() => { setShowMedForm(false); refreshData(); }} onCancel={() => setShowMedForm(false)} />
                ) : (
                   <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                      {reminders.map(med => (
                        <div 
                           key={med.id} 
                           onClick={() => toggleMedication(med.id)}
                           className={`flex-shrink-0 w-32 p-3 rounded-2xl border transition-all cursor-pointer ${med.taken ? 'bg-green-50 border-green-200 opacity-60' : 'bg-white border-gray-200 hover:shadow-md'}`}
                        >
                           <div className="flex justify-between items-start mb-1">
                             <span className="text-xs font-bold text-gray-400">{med.time}</span>
                             {med.taken && <ShieldCheck size={14} className="text-green-600"/>}
                           </div>
                           <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                              <Pill size={20} />
                           </div>
                           <p className="font-bold text-gray-800 text-sm truncate">{med.title}</p>
                           <p className="text-xs text-gray-500">{med.dosage}</p>
                        </div>
                      ))}
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                         <button onClick={() => setShowMedForm(true)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-arogya-teal hover:text-white transition">
                           <Plus size={16} />
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-arogya-navy mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <TiltCard 
                key={service.id}
                onClick={() => { setActiveService(service.id); audioService.triggerHaptic(); }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-xl cursor-pointer group h-32 flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${service.color} transform group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-arogya-teal transition-colors">{service.title}</h3>
              </TiltCard>
            ))}
          </div>
        </div>
        
        <div className="h-12"></div>
      </main>

      <button 
        onClick={() => setSosActive(true)}
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg shadow-red-600/40 flex items-center justify-center z-40 animate-bounce"
      >
        <AlertCircle size={28} />
      </button>
      
      <button 
        onClick={toggleZenMode}
        className={`md:hidden fixed bottom-24 left-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-40 transition-colors ${zenMode ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}
      >
        {zenMode ? <Volume2 size={20} /> : <Music size={20} />}
      </button>

    </div>
  );
};