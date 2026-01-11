import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ScanFace, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Lock,
  Camera, 
  Info,
  Power
} from 'lucide-react';

// Import Custom Camera
import FaceLivenessCam from '../components/FaceLivenessCam'; 

// --- 🌐 API CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Login = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [status, setStatus] = useState('idle'); 
  const [userData, setUserData] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false); 
  
  // Lock
  const isSubmittingRef = useRef(false);

  // --- HANDLERS ---
  const startCamera = () => {
    setIsCameraOn(true);
    setStatus('idle');
    isSubmittingRef.current = false;
  };

  const togglePower = () => {
    setIsCameraOn(prev => !prev);
    setStatus('idle');
    isSubmittingRef.current = false;
  };

  const handleCapture = async (imageSrc) => {
    if (!imageSrc || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setStatus('verifying');

    try {
      // ✅ UPDATED URL: Using Absolute Path via API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/scan`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageSrc })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setUserData(data.user || { name: "Voter" });
        localStorage.setItem('token', data.token);
        setTimeout(() => navigate("/vote"), 1500); 
      } else {
        setStatus('error'); // Triggers Red Cross
        setTimeout(() => {
            setStatus('idle');
            isSubmittingRef.current = false; 
        }, 3000);
      }
    } catch (e) {
      setStatus('error');
      setTimeout(() => {
          setStatus('idle');
          isSubmittingRef.current = false;
      }, 3000);
    }
  };

  // ... (REST OF THE JSX REMAINS EXACTLY THE SAME) ...
  return (
    // ✅ CHANGED: bg-slate-50 -> bg-green-50 to match the "pic" background
    <div className="flex items-center justify-center min-h-screen bg-green-50 text-slate-900 p-8 font-sans overflow-hidden">
      
            {/* CSS to Force Video Fit and center the face in the circle */}
            <style>{`
                .camera-circle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .camera-circle video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    object-position: center center !important;
                    transform: scaleX(-1);
                    border-radius: 0 !important;
                    display: block;
                }
            `}</style>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        {/* ✅ CHANGED: Switched to sky-200 for a clearer blue */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-200 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[100px] opacity-50"></div>
      </div>

      {/* --- MAIN CONTAINER --- */}
    <div className="relative z-10 w-full max-w-7xl bg-white border border-slate-200 rounded-[3rem] p-10 lg:p-14 shadow-2xl shadow-green-900/10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center min-h-[600px]">
        
        {/* --- LEFT COLUMN: BRANDING --- */}
        <div className="text-center lg:text-left space-y-6 lg:pl-2">
            {/* ✅ CHANGED: Blue-50 -> Sky-50/Sky-600 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold rounded-full uppercase tracking-widest shadow-sm">
                <ShieldCheck size={14} /> SATYA VOTER
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                Voter<br/><span className="text-sky-600">Login</span>
            </h1>
            
            <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                Secure biometric authentication gate. Verify identity to access the blockchain ballot.
            </p>
        </div>

        {/* --- CENTER COLUMN (CAMERA) --- */}
        <div className="flex justify-center relative z-20">
            
            {/* Camera Box (square) */}
            <div className="relative w-80 h-80 overflow-hidden shadow-2xl border-[8px] border-white bg-black ring-1 ring-slate-200 camera-circle">
                
                {/* STATE A: CAMERA IS ON */}
                {isCameraOn && (
                  <>
                    {(status === 'idle' || status === 'verifying') && (
                        <div className="absolute inset-0 w-full h-full">
                           <FaceLivenessCam 
                                onCapture={handleCapture} 
                                isProcessing={status !== 'idle'}
                           />
                        </div>
                    )}

                    {/* OVERLAYS */}
                    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                        
                        {/* Idle */}
                        {status === 'idle' && (
                           <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-56 h-56 border-2 border-dashed border-white/30 flex items-center justify-center mb-6">
                                            <ScanFace size={56} className="text-white/50" />
                                        </div>
                              <span className="absolute bottom-16 bg-black/50 text-white text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                 Blink to Verify
                              </span>
                           </div>
                        )}

                        {/* Verifying */}
                        {status === 'verifying' && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                                {/* ✅ CHANGED: Blue-600 -> Sky-600 */}
                                <Loader2 size={56} className="text-sky-600 animate-spin mb-4" />
                                <span className="text-sky-900 font-bold text-lg tracking-tight">Verifying...</span>
                            </div>
                        )}

                        {/* Success */}
                        {status === 'success' && (
                            <div className="absolute inset-0 bg-emerald-50 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                                <CheckCircle size={72} className="text-emerald-500 mb-4 drop-shadow-md" />
                                <h3 className="text-2xl font-black text-slate-800">Verified</h3>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mt-2">Welcome {userData?.name}</p>
                            </div>
                        )}

                        {/* Error / Not Found */}
                        {status === 'error' && (
                            <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center animate-in zoom-in duration-300 text-center p-6">
                                <XCircle size={72} className="text-red-500 mb-4 drop-shadow-md" />
                                <h3 className="text-2xl font-black text-slate-800">Failed</h3>
                                <p className="text-slate-500 font-medium text-xs mt-1">Identity Not Found</p>
                            </div>
                        )}
                    </div>
                  </>
                )}

                {/* STATE B: CAMERA IS OFF */}
                {!isCameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-30">
                        <button 
                            onClick={startCamera}
                            className="group relative flex flex-col items-center justify-center gap-4"
                        >
                            {/* ✅ CHANGED: Blue-600 -> Sky-600 */}
                            <div className="w-24 h-24 rounded-full bg-sky-600 flex items-center justify-center shadow-[0_0_40px_rgba(14,165,233,0.4)] group-hover:scale-110 group-hover:bg-sky-500 transition-all duration-300 border-4 border-white/10">
                                <Camera size={36} className="text-white" />
                            </div>
                            <span className="text-white font-bold text-xs tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                                Start Camera
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Power Button */}
            {isCameraOn && (
                <div className="absolute -bottom-20 left-0 right-0 flex justify-center">
                    <button 
                        onClick={togglePower}
                        className="p-4 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all border border-slate-200 shadow-sm"
                        title="Turn Off Camera"
                    >
                        <Power size={24} />
                    </button>
                </div>
            )}
        </div>

        {/* --- RIGHT COLUMN: INSTRUCTIONS --- */}
        <div className="flex justify-center lg:justify-end">
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 w-full max-w-md">
                
                <h3 className="font-bold text-black flex items-center gap-3 mb-8 text-xl">
                    {/* ✅ CHANGED: Blue-900 -> Sky-900 */}
                    <Info size={24} className="text-sky-900"/> Instructions
                </h3>

                <div className="space-y-8">
                    <div className="flex gap-6 items-start">
                        <div className="shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-200 font-bold text-sm">
                            1
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-base">Position Face</h4>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                Remove masks or sunglasses. Ensure good lighting.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-200 font-bold text-sm">
                            2
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-base">Blink Naturally</h4>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                Look at the camera and blink to confirm liveness.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Status</span>
                        <span className="flex items-center gap-2 text-emerald-600">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            Online
                        </span>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;