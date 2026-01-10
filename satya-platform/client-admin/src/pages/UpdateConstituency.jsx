import React, { useState } from 'react';
import { 
  MapPin, 
  RefreshCw, 
  CheckCircle, 
  ScanFace, 
  ShieldCheck, 
  User, 
  Activity,
  Loader2, 
  ChevronRight,
  Hash,
  Camera,
  Ghost,
  AlertCircle,
  Activity
} from 'lucide-react';

// ✅ Your custom camera component
import FaceLivenessCam from '../components/FaceLivenessCam'; 

// --- 🌐 API CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const UpdateConstituency = () => {
  // --- STATE ---
  const [activeStep, setActiveStep] = useState(1); 
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    voterId: '',
    currentLocation: 'Unknown', 
    newState: 'Delhi',
    constituencyId: '1'
  });
  
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: "Activate Camera Module to Start", type: "neutral" }
  ]);

  const addLog = (msg, type = "info") => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev]);
  };

  const CONSTITUENCY_LOOKUP = {
    'Delhi': { id: '1', region: 'Delhi ' },
    'Mumbai': { id: '2', region: 'Mumbai ' },
    'Bihar': { id: '3', region: 'Patna Sahib' }
  };

  // --- HANDLERS ---
  const startCamera = () => {
    setCameraActive(true);
    setIsProcessing(false); 
    addLog("Camera module activated.", "info");
  };

  const handleFaceDetected = async (imgSrc) => {
    setCameraActive(false); 
    setIsProcessing(true); 
    addLog("Biometric Data Acquired. Verifying...", "loading");
    
    try {
      addLog("Querying Distributed Ledger...", "process");
      
      // ✅ UPDATED URL
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/search-voter-by-face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: imgSrc })
      });

      const data = await response.json();

      if (response.ok && data.voterId) {
        // ✅ Sets Voter ID from API Response
        setFormData(prev => ({ ...prev, voterId: data.voterId }));
        addLog(`Identity Verified: ${data.voterId}`, "success");
        setIsProcessing(false);
        setActiveStep(2); 
      } else {
        throw new Error(data.error || "Identity not found in Global Ledger.");
      }

    } catch (error) {
      addLog(`Lookup Failed: ${error.message}`, "error");
      setIsProcessing(false); 
    } finally {
        if(activeStep === 1) setIsProcessing(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    addLog("Initiating Smart Contract Transaction...", "loading");
    
    try {
      // ✅ UPDATED URL
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            voterId: formData.voterId, 
            newState: formData.newState, 
            newConstituencyId: formData.constituencyId
        })
      });

      const data = await response.json();

      if (response.ok) {
        addLog(`Block Mined Successfully. Update Complete.`, "success");
        setActiveStep(3); 
      } else {
        throw new Error(data.error || "Update Failed");
      }
    } catch (error) {
       addLog(`Transaction Reverted: ${error.message}`, "error");
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const mapping = CONSTITUENCY_LOOKUP[selectedState];
    setFormData({ ...formData, newState: selectedState, constituencyId: mapping.id });
  };

  const resetSystem = () => {
    setActiveStep(1);
    setCameraActive(false);
    setIsProcessing(false);
    setFormData({ ...formData, voterId: '' });
    addLog("System reset. Ready for next applicant.", "neutral");
  };

  // ... (REST OF THE JSX REMAINS EXACTLY THE SAME - SKIPPING FOR BREVITY) ...
  // Paste the return (...) block from your original code here
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* ... KEEP YOUR ORIGINAL JSX HERE ... */}
      {/* Ensure you copy the JSX from your original file provided in the prompt */}
       <div className="w-[55%] flex flex-col justify-center p-12 relative border-r border-slate-200 bg-white">
             <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-br-full -z-10"></div>
             <div className="w-full max-w-xl mx-auto flex flex-col h-[90%]">
                <div className="flex-1 flex flex-col justify-center">
                    
                    {/* SCENE 1: INSTRUCTIONS */}
                    {activeStep === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold uppercase tracking-wider border border-sky-100">
                                <ScanFace size={14} /> Biometric Authentication
                            </div>
                            <div>
                                <h1 className="text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                                    Voter Authentication
                                </h1>
                                <p className="text-slate-500 text-lg leading-relaxed">
                                    Click "Start Authentication" to enable the biometric camera. Ensure the applicant is facing forward.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <span className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold shadow-sm transition-colors ${
                                    isProcessing ? 'bg-sky-50 border-sky-200 text-sky-700' :
                                    cameraActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                                    'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${
                                        isProcessing ? 'bg-sky-500 animate-bounce' :
                                        cameraActive ? 'bg-emerald-500 animate-pulse' : 
                                        'bg-slate-300'
                                    }`}></span> 
                                    {isProcessing ? 'PROCESSING...' : cameraActive ? 'CAMERA ACTIVE' : 'CAMERA STANDBY'}
                                </span>
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden animate-in slide-in-from-right duration-500">
                            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <MapPin className="text-sky-600" /> Update Constituency
                                </h2>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    <CheckCircle size={12} /> VERIFIED
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 shrink-0">
                                        <Hash size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">Voter ID</p>
                                        <p className="text-lg font-mono font-bold text-sky-900">{formData.voterId}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">New State</label>
                                        <select 
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none"
                                            value={formData.newState} onChange={handleStateChange}
                                        >
                                            {Object.keys(CONSTITUENCY_LOOKUP).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Code</label>
                                        <input type="text" readOnly className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono font-bold"
                                            value={formData.constituencyId} />
                                    </div>
                                </div>
                                <button onClick={handleUpdate} className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
                                    <RefreshCw size={18} /> Confirm Migration
                                </button>
                            </div>
                        </div>
                    )}

                    {activeStep === 3 && (
                        <div className="text-center animate-in zoom-in duration-300">
                             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-lg shadow-emerald-100">
                                 <CheckCircle size={48} />
                             </div>
                             <h2 className="text-3xl font-bold text-slate-800">Update Complete</h2>
                             <p className="text-slate-500 mt-2 mb-8">The blockchain ledger has been updated.</p>
                             <button onClick={resetSystem} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto shadow-lg shadow-slate-300">
                                 Process Next Applicant <ChevronRight size={16} />
                             </button>
                        </div>
                    )}
                </div>

                {/* 2. LOG SECTION */}
                <div className="mt-40 w-full max-w-xl mx-auto">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-2">
                            <Ghost size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"> LOG </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-300 font-bold">MR. BEAN</span>
                    </div>
                    
                    <div className="relative w-full rounded-xl bg-white border border-slate-200 shadow-sm p-4 flex items-center gap-4 overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${logStyle.bar}`}></div>
                        <div className="shrink-0 ml-2">
                            {logStyle.icon}
                        </div>
                        <div className="flex-1">
                            <p className={`text-base font-bold leading-tight ${logStyle.color}`}>
                                {currentLog.msg}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400 mt-1 font-medium">
                                {currentLog.time} <span className="mx-1 text-slate-300">•</span> AES-256
                            </p>
                        </div>
                    </div>
                </div>

             </div>
        </div>

        {/* --- RIGHT SIDE: CAMERA (45%) --- */}
        <div className="w-[45%] bg-slate-50 relative flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 ring-4 ring-white/5 grid place-items-center shadow-sky-900/10">
                <style>{`
                    .camera-wrapper {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        width: 100%;
                        height: 100%;
                    }
                    .camera-wrapper video {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                        transform: scaleX(-1);
                    }
                `}</style>

                <div className="col-start-1 row-start-1 w-full h-full z-0">
                     <div className="camera-wrapper">
                        {activeStep === 1 && cameraActive && !isProcessing && (
                            <FaceLivenessCam onCapture={handleFaceDetected} isProcessing={!cameraActive} />
                        )}
                        {(activeStep !== 1 || !cameraActive) && (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center"></div>
                        )}
                     </div>
                </div>

                <div className="col-start-1 row-start-1 w-full h-full z-10 pointer-events-none relative flex flex-col justify-between ">
                    <div className="w-full p-5 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex items-center gap-2 text-white/80">
                            <ScanFace size={16} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Biometric Feed</span>
                        </div>
                        {activeStep === 1 && (
                            <span className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded-full border backdrop-blur-md ${
                                isProcessing ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                                cameraActive ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                'bg-slate-500/20 text-slate-400 border-slate-500/30'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    isProcessing ? 'bg-sky-500 animate-bounce' :
                                    cameraActive ? 'bg-red-500 animate-pulse' : 
                                    'bg-slate-500'
                                }`}></span> 
                                {isProcessing ? 'FETCHING' : cameraActive ? 'LIVE' : 'OFFLINE'}
                            </span>
                        )}
                    </div>

                    {activeStep === 1 && !cameraActive && !isProcessing && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                            <button 
                                onClick={startCamera}
                                className="group relative flex flex-col items-center justify-center gap-4"
                            >
                                <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-sky-500/30 flex items-center justify-center hover:bg-sky-600 hover:border-sky-400 hover:scale-110 transition-all duration-300 group shadow-xl shadow-sky-900/20">
                                    <Camera size={32} className="text-sky-400 group-hover:text-white" />
                                </div>
                                <span className="text-white font-bold text-sm tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                                    Start Camera
                                </span>
                            </button>
                        </div>
                    )}

                    {activeStep === 1 && cameraActive && !isProcessing && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-72 h-72 rounded-full border border-white/20 shadow-[0_0_100px_rgba(56,189,248,0.2)] relative backdrop-contrast-125">
                                <div className="absolute inset-[-2px] rounded-full border-t-2 border-sky-500 animate-spin opacity-80"></div>
                            </div>
                            <div className="absolute inset-[-20px]">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sky-500/50 rounded-tl-xl"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sky-500/50 rounded-tr-xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sky-500/50 rounded-bl-xl"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-sky-500/50 rounded-br-xl"></div>
                            </div>
                        </div>
                    )}

                    {isProcessing && (
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                            <Loader2 size={48} className="text-sky-500 animate-spin mb-4" />
                            <p className="text-white font-bold text-lg tracking-wider">VERIFYING...</p>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm z-30">
                             <div className="animate-in zoom-in duration-500 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                    <User size={40} className="text-emerald-400" />
                                </div>
                                <p className="text-lg font-bold text-white">Identity Verified</p>
                                <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">Match found</p>
                            </div>
                        </div>
                    )}

                    <div className="w-full p-5 flex justify-between items-center text-[10px] font-mono text-slate-500 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> AES-256</span>
                        <span className="opacity-50">SATYA v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default UpdateConstituency;