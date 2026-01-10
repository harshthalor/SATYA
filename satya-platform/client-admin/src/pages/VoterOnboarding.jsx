import React, { useState } from 'react';
import { 
  Save, 
  UserPlus, 
  CheckCircle, 
  Camera, 
  Citrus,
  Ghost,
  AlertCircle,
  Calculator,
  ScanFace,
  MapPin,
  Activity
} from 'lucide-react';

// IMPORT YOUR CAMERA COMPONENT
import FaceLivenessCam from '../components/FaceLivenessCam'; 

<<<<<<< HEAD
// --- 🌐 API CONFIGURATION (From your reference code) ---
=======
// --- 🌐 API CONFIGURATION ---
>>>>>>> aeb110139ab39c6025245c37203d6ce525049c93
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const VoterOnboarding = () => {
  // --- STATE ---
  const [mode, setMode] = useState('idle'); // idle, captured
  const [imgSrc, setImgSrc] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Log state
  const [logState, setLogState] = useState({ message: "Activate Camera Module to Start", type: "neutral" });
  
  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    epicId: '',
    homeState: 'Delhi',
    constituencyId: '1'
  });

  const CONSTITUENCY_LOOKUP = {
    'Delhi': { id: '1', region: 'North Delhi Central' },
    'Mumbai': { id: '2', region: 'Mumbai South' },
    'Bihar': { id: '3', region: 'Patna Sahib' }
  };

  // --- HANDLERS ---
  const startCamera = () => {
    setCameraActive(true);
    setLogState({ message: "Camera Module Activated. Waiting for face...", type: "loading" });
  };

  const handleLivenessVerified = (imageSrc) => {
    setImgSrc(imageSrc);
    setMode('captured');
    setCameraActive(false); 
    setLogState({ message: "Biometric Data Acquired. Liveness Verified.", type: "success" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (mode !== 'captured' || !imgSrc) return;

    setLogState({ message: "Encrypting & Uploading Identity Block...", type: "loading" });

    try {
      const payload = {
        fullName: formData.fullName,
        epicId: formData.epicId,
        homeState: formData.homeState,
        constituencyId: formData.constituencyId,
        base64Image: imgSrc 
      };

<<<<<<< HEAD
      // ✅ FIX: Use the configured API URL
=======
      // ✅ UPDATED URL
>>>>>>> aeb110139ab39c6025245c37203d6ce525049c93
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/register-voter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setLogState({ 
<<<<<<< HEAD
          message: `Voter Registered! Hash: ${String(data.voterId).substring(0, 12)}...`, 
=======
          message: `Voter Registered Successfully! ID: ${String(data.voterId).substring(0, 12)}...`, 
>>>>>>> aeb110139ab39c6025245c37203d6ce525049c93
          type: "success" 
        });
      } else {
        // ✅ FIX: Specific Error Handling for Server Issues
        if (response.status === 409) {
           setLogState({ message: `Duplicate Entity: ${data.message}`, type: "error" });
        } else if (response.status === 403) {
           setLogState({ message: `Security Risk: ${data.message}`, type: "error" });
        } else if (response.status === 413) {
           // This handles the "Payload Too Large" error
           setLogState({ message: `Image Too Large. Backend Rejected Payload.`, type: "error" });
        } else if (response.status === 500) {
           setLogState({ message: `Server Error (500). Check Backend Console.`, type: "error" });
        } else {
           throw new Error(data.message || "Registration Failed");
        }
      }
    } catch (error) {
      setLogState({ message: `Network/API Error: ${error.message}`, type: "error" });
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const mapping = CONSTITUENCY_LOOKUP[selectedState];
    setFormData({ ...formData, homeState: selectedState, constituencyId: mapping.id });
  };

  const reset = () => {
    setImgSrc(null);
    setMode('idle');
    setCameraActive(false); 
    setLogState({ message: "Reset Complete. Ready for next applicant.", type: "neutral" });
  };

  // ... (REST OF THE JSX REMAINS EXACTLY THE SAME) ...
  return (
    <div className="w-full relative pb-12">
      
      {/* --- SOFT BACKGROUND ACCENT --- */}
      <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl -z-10"></div>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Voter Onboarding</h1>
        <p className="text-slate-600 mt-2">
          Register new citizens and their biometric data to the blockchain.
        </p>
      </div>

      {/* MAIN CARD CONTAINER */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* ================= LEFT: FORM SECTION ================= */}
        <div className="w-full lg:w-5/12 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 relative flex flex-col justify-center">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 to-blue-600"></div>

            <form onSubmit={handleRegister} className="space-y-6 w-full">
              
              <div className="space-y-5">
                {/* Full Name */}
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Full Name As Per Government Records
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input required type="text" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none transition-all placeholder-slate-400"
                      placeholder="Name"
                      value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} 
                    />
                  </div>
                </div>

                {/* EPIC ID */}
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    EPIC ID Number
                  </label>
                  <div className="relative">
                    <Calculator className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                    <input required type="text" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-700 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none transition-all placeholder-slate-400 uppercase tracking-wide"
                      placeholder="ABC676767"
                      value={formData.epicId} onChange={e => setFormData({...formData, epicId: e.target.value})} 
                    />
                  </div>
                </div>
                
                {/* State & Zone */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2">State / Region</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
                        <select className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-700 appearance-none focus:ring-2 focus:ring-sky-200 outline-none cursor-pointer"
                          value={formData.homeState} onChange={handleStateChange}>
                          {Object.keys(CONSTITUENCY_LOOKUP).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2">Zone Code</label>
                      <div className="w-full py-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 font-mono text-center font-bold">
                        {formData.constituencyId}
                      </div>
                   </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  onClick={handleRegister}
                  disabled={mode !== 'captured'}
                  className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                      mode === 'captured' 
                      ? 'bg-sky-600 text-white hover:bg-sky-700 hover:-translate-y-1 ' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {mode === 'captured' ? <><Save size={20}/> Submit</> : <><ScanFace size={20}/> Scan Face To Register</>}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-semibold mt-3 tracking-widest uppercase">
                  Secured by Hyperledger Fabric
                </p>
              </div>
            </form>
        </div>

        {/* ================= RIGHT: CAMERA & BIOMETRICS ================= */}
        <div className="w-full lg:w-7/12 bg-slate-50/50 p-8 flex flex-col items-center justify-between relative">
            
            {/* 1. Status Pill (Top) */}
            <div className={`mt-2 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 border shadow-sm transition-all duration-300 ${
                mode === 'captured' 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : cameraActive
                  ? 'bg-sky-100 text-sky-700 border-sky-200 animate-pulse'
                  : 'bg-white text-slate-500 border-slate-200'
            }`}>
                <Citrus size={14} className={cameraActive ? 'animate-spin' : ''} />
                {mode === 'captured' ? "BIOMETRIC CAPTURE COMPLETE" : cameraActive ? "LIVENESS DETECTION ACTIVE" : "CAMERA STANDBY"}
            </div>

            {/* 2. CAMERA FRAME (Center - Squared) */}
            <div className="relative group z-0 flex-grow flex items-center justify-center w-full max-w-[420px]">
                {/* Decorative corners */}
                <div className={`absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl transition-colors duration-300 z-10 ${mode==='captured'?'border-emerald-500':'border-sky-300'}`}></div>
                <div className={`absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl transition-colors duration-300 z-10 ${mode==='captured'?'border-emerald-500':'border-sky-300'}`}></div>
                <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl transition-colors duration-300 z-10 ${mode==='captured'?'border-emerald-500':'border-sky-300'}`}></div>
                <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 rounded-br-xl transition-colors duration-300 z-10 ${mode==='captured'?'border-emerald-500':'border-sky-300'}`}></div>

                {/* Main Viewport - FORCED SQUARE ASPECT RATIO */}
                <div className="w-full aspect-square bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-sky-900/10 relative flex items-center justify-center mx-auto">
                    
                    {/* SCENARIO 1: IMAGE CAPTURED */}
                    {imgSrc ? (
                        <>
                            <img src={imgSrc} className="w-full h-full object-cover" alt="Captured" />
                            <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay"></div>
                            
                            {/* Retake Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={reset} className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition flex items-center gap-2">
                                  <Camera size={16} /> Retake
                                </button>
                            </div>

                            <div className="absolute bottom-6 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm bg-opacity-90">
                                <CheckCircle size={14} className="text-white" /> Liveness Verified
                            </div>
                        </>
                    ) : (
                        // SCENARIO 2: CAMERA / STANDBY
                        <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                            {cameraActive ? (
                                <div className="absolute inset-0 z-0">
                                    <div className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover">
                                      <FaceLivenessCam onCapture={handleLivenessVerified} />
                                    </div>
                                </div>
                            ) : (
                              <div className="absolute left-1/2 top-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="pointer-events-auto text-center flex flex-col items-center gap-3">
                                  <button 
                                    onClick={startCamera}
                                    className="w-24 h-24 rounded-full bg-slate-800 border-4 border-sky-500/30 flex items-center justify-center hover:bg-sky-600 hover:border-sky-400 hover:scale-110 transition-all duration-300 group shadow-xl shadow-sky-900/20"
                                  >
                                    <Camera size={40} className="text-sky-400 group-hover:text-white" />
                                  </button>
                                  <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">
                                    Start Camera
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. SYSTEM LOG (Bottom) */}
            <div className="w-full max-w-[420px] mt-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <Ghost size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"> LOG </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">MR. BEAN</span>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm min-h-[60px] flex items-center relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        logState.type === 'error' ? 'bg-red-500' : 
                        logState.type === 'success' ? 'bg-emerald-500' : 
                        logState.type === 'loading' ? 'bg-sky-500' :
                        'bg-slate-300'
                    }`}></div>

                    <div className="pl-3 flex items-start gap-3 w-full">
                        {logState.type === 'error' ? <AlertCircle size={18} className="text-red-500 mt-0.5" /> : 
                         logState.type === 'success' ? <CheckCircle size={18} className="text-emerald-500 mt-0.5" /> :
                         <div className="w-4 h-4 mt-1 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />}
                        
                        <div>
                           <p className={`text-sm font-semibold leading-tight ${
                                logState.type === 'error' ? 'text-red-600' : 
                                logState.type === 'success' ? 'text-emerald-700' : 
                                'text-slate-700'
                            }`}>
                                {logState.message}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1">
                                {new Date().toLocaleTimeString()} • AES-256
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default VoterOnboarding;