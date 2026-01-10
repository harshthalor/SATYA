import React, { useState } from 'react';
import { 
  Save, 
  UserPlus, 
  CheckCircle, 
  Camera, 
  Activity,
  ScanFace,
  Fingerprint
} from 'lucide-react';

// IMPORT YOUR CAMERA COMPONENT
import FaceLivenessCam from '../components/FaceLivenessCam'; 

const VoterOnboarding = () => {
  // --- STATE ---
  const [mode, setMode] = useState('idle'); // idle, captured
  const [imgSrc, setImgSrc] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Log state
  const [logState, setLogState] = useState({ message: "System Initialized. Waiting for user...", type: "info" });
  
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
    setLogState({ message: "Camera Module Activated. Waiting for face...", type: "info" });
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

      const response = await fetch('http://localhost:8080/api/v1/admin/register-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setLogState({ message: `Voter Registered Successfully! Hash: ${data.voterId?.substring(0, 12)}...`, type: "success" });
      } else {
        if (response.status === 409) {
           setLogState({ message: `Duplicate Entity Detected: ${data.message}`, type: "error" });
        } else if (response.status === 403) {
           setLogState({ message: `Security Risk: ${data.message}`, type: "error" });
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
    setLogState({ message: "Reset Complete. Ready for next applicant.", type: "info" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 flex items-center justify-center font-sans text-slate-800">
      
      {/* MAIN CARD CONTAINER */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-700/50">
        
        {/* LEFT: FORM SECTION */}
        <div className="w-full md:w-5/12 p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0"></div>

          <div>
            <div className="mb-8 relative z-10">
              <h1 className="text-4xl font-extrabold text-slate-900 leading-none tracking-tight">
                Voter<br/>Registration
              </h1>
              <p className="text-slate-500 mt-3 text-sm font-medium">Enter applicant details before biometric verification.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6 relative z-10">
              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block group-focus-within:text-indigo-600 transition-colors">
                  Full Legal Name
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                  <input required type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-300"
                    placeholder="e.g. Aditi Sharma"
                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block group-focus-within:text-indigo-600 transition-colors">
                  EPIC ID Number
                </label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                  <input required type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-300 uppercase"
                    placeholder="ABC1234567"
                    value={formData.epicId} onChange={e => setFormData({...formData, epicId: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">State / Region</label>
                    <div className="relative">
                      <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                        value={formData.homeState} onChange={handleStateChange}>
                        {Object.keys(CONSTITUENCY_LOOKUP).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="absolute right-3 top-4 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0.5L5 5.5L10 0.5H0Z"/></svg>
                      </div>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Zone Code</label>
                    <input type="text" readOnly 
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-center"
                      value={formData.constituencyId} />
                 </div>
              </div>
            </form>
          </div>

          <div className="mt-8 relative z-10">
            <button 
              onClick={handleRegister}
              disabled={mode !== 'captured'}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                  mode === 'captured' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:-translate-y-1 shadow-emerald-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {mode === 'captured' ? <><Save size={20}/> Encrypt & Register Voter</> : <><ScanFace size={20}/> Complete Verification First</>}
            </button>
            <div className="text-center mt-3">
                 <p className="text-[10px] text-slate-400 font-medium">SECURED BY HYPERLEDGER FABRIC</p>
            </div>
          </div>
        </div>

        {/* RIGHT: CAMERA & BIOMETRICS SECTION */}
        <div className="w-full md:w-7/12 bg-slate-50 border-l border-slate-100 p-8 flex flex-col items-center justify-center relative">
            
            {/* Status Pill */}
            <div className={`mb-8 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 border shadow-lg transition-all duration-300 z-10 transform ${
                mode === 'captured' 
                ? 'bg-emerald-600 text-white border-emerald-500 scale-105' 
                : 'bg-white text-indigo-600 border-indigo-100'
            }`}>
                <Activity size={14} className={cameraActive ? 'animate-pulse' : ''} />
                {mode === 'captured' ? "BIOMETRIC LOCK ACQUIRED" : cameraActive ? "LIVENESS DETECTION ACTIVE" : "CAMERA STANDBY"}
            </div>

            {/* --- FIXED CAMERA CONTAINER --- */}
            <div className="relative group z-0">
                {/* Decorative corners */}
                <div className={`absolute -top-3 -left-3 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors duration-300 ${mode==='captured'?'border-emerald-500':'border-indigo-400'}`}></div>
                <div className={`absolute -top-3 -right-3 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors duration-300 ${mode==='captured'?'border-emerald-500':'border-indigo-400'}`}></div>
                <div className={`absolute -bottom-3 -left-3 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors duration-300 ${mode==='captured'?'border-emerald-500':'border-indigo-400'}`}></div>
                <div className={`absolute -bottom-3 -right-3 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors duration-300 ${mode==='captured'?'border-emerald-500':'border-indigo-400'}`}></div>

                {/* Container for the video feed */}
                <div className="w-[400px] h-[320px] bg-black rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center">
                    
                    {/* SCENARIO 1: IMAGE CAPTURED */}
                    {imgSrc ? (
                        <>
                            <img src={imgSrc} className="w-full h-full object-cover" alt="Captured" />
                            <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay"></div>
                            <div className="absolute bottom-4 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                                <CheckCircle size={16} className="text-white" /> Quality Check Passed
                            </div>
                        </>
                    ) : (
                        // SCENARIO 2: CAMERA / STANDBY
                        <div className="w-full h-full relative flex items-center justify-center bg-black">
                            <style>{`
                                .camera-wrapper {
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    width: 100%;
                                    height: 100%;
                                    overflow: hidden;
                                }
                                .camera-wrapper video {
                                    min-width: 100%;
                                    min-height: 100%;
                                    width: auto !important;
                                    height: auto !important;
                                    object-fit: cover !important;
                                    position: absolute;
                                    left: 50%;
                                    top: 50%;
                                    transform: translate(-50%, -50%) scaleX(-1);
                                }
                            `}</style>

                            {/* Camera Component Wrapper */}
                            {cameraActive && (
                                <div className="camera-wrapper absolute inset-0 z-0">
                                    <FaceLivenessCam onCapture={handleLivenessVerified} />
                                </div>
                            )}

                            {/* Start Button Overlay */}
                            {!cameraActive && (
                                <div className="z-10 relative">
                                    <button 
                                        onClick={startCamera}
                                        className="group flex flex-col items-center justify-center gap-4"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-300">
                                            <Camera size={28} className="text-white" />
                                        </div>
                                        {/* CHANGED TEXT HERE */}
                                        <span className="text-white font-bold text-xs tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                                            Start Camera
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Control Panel */}
            <div className="mt-8 flex gap-4 h-10">
                 {mode === 'captured' && (
                    <button onClick={reset} className="px-6 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all shadow-sm">
                        <Camera size={16} /> Retake Photo
                    </button>
                 )}
            </div>

            {/* NEW SYSTEM ACTIVITY MONITOR (MATCHING SCREENSHOT) */}
            <div className="w-full max-w-lg mt-4">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <Activity size={16} className="text-slate-400" />
                    <h6 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Activity</h6>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-h-[80px] flex items-center">
                    <div className="flex items-start gap-4 w-full">
                        <span className="text-slate-400 font-mono text-xs whitespace-nowrap mt-0.5">
                            {new Date().toLocaleTimeString()}
                        </span>
                        <span className={`text-sm font-semibold flex-1 ${
                            logState.type === 'error' ? 'text-red-600' : 
                            logState.type === 'success' ? 'text-emerald-700' : 
                            logState.type === 'loading' ? 'text-indigo-600' :
                            'text-slate-700'
                        }`}>
                            {logState.message}
                        </span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default VoterOnboarding;