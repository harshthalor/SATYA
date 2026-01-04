import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Save, UserPlus, RefreshCw, CheckCircle, ScanFace, MapPin } from 'lucide-react';

const VoterOnboarding = () => {
  const webcamRef = useRef(null);
  
  // --- STATE ---
  const [mode, setMode] = useState('idle'); // idle, scanning, stable, verified
  const [imgSrc, setImgSrc] = useState(null);
  const [aiHash, setAiHash] = useState(null);
  const [log, setLog] = useState("");
  const [stability, setStability] = useState(0);

  const [formData, setFormData] = useState({
    fullName: '',
    epicId: '',
    homeState: 'Delhi',
    constituencyId: '1'
  });

  // --- SMART CAMERA LOGIC ---
  useEffect(() => {
    let interval;
    if (mode === 'scanning' || mode === 'stable') {
      interval = setInterval(checkFaceLiveness, 300); // Check every 300ms
    }
    return () => clearInterval(interval);
  }, [mode, stability]);

  const checkFaceLiveness = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      // 1. Send frame to AI (Member C via Member B)
      const blob = await (await fetch(imageSrc)).blob();
      const form = new FormData();
      form.append("file", blob);

      const res = await fetch('http://localhost:8080/api/v1/auth/scan', { method: 'POST', body: form });
      const data = await res.json();

      // 2. Logic: Wait for Eyes Open (Stability), then Blink (Success)
      if (data.status === "success") {
        // AI says: "Blink Detected / Liveness Confirmed"
        if (mode === 'stable') {
          // CAPTURE!
          setImgSrc(imageSrc);
          setAiHash(data.voter_hash);
          setMode('verified');
          setLog("✅ Captured! Face verified by AI.");
        }
      } else if (data.message && data.message.includes("Eyes are OPEN")) {
        // AI says: "Eyes Open" -> Increase Stability
        setStability(prev => {
           const next = prev + 20; // +20% stability per frame
           if (next >= 100 && mode !== 'stable') {
               setMode('stable'); // Ready for blink
               setLog("⚡️ Face Stable. BLINK NOW to capture!");
           }
           return Math.min(next, 100);
        });
      } else {
        // AI says: "No Face" or "Look at Camera"
        setStability(0);
        if (mode === 'stable') setMode('scanning');
      }
    } catch (err) {
      console.log("Frame skipped:", err);
    }
  };

  const startCamera = () => {
    setMode('scanning');
    setStability(0);
    setLog("🔍 Looking for face... Keep steady.");
  };

  // --- FINAL REGISTRATION (To Backend) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (mode !== 'verified') return;

    setLog("⏳ Registering on Blockchain & DB...");

    try {
      // Clean the base64 string for the backend
      const rawBase64 = imgSrc.split(',')[1];

      const payload = {
        fullName: formData.fullName,
        epicId: formData.epicId,
        homeState: formData.homeState,
        constituencyId: formData.constituencyId,
        base64Image: rawBase64 // Backend will re-verify this
      };

      const response = await fetch('http://localhost:8080/api/v1/admin/register-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setLog(`🎉 Success! Voter ID: ${data.voterId}`);
        // Reset form after 4 seconds
        setTimeout(() => {
            setImgSrc(null);
            setAiHash(null);
            setMode('idle');
            setStability(0);
            setFormData({ ...formData, fullName: '', epicId: '' });
            setLog("");
        }, 4000);
      } else {
        throw new Error(data.message || "Registration Failed");
      }
    } catch (error) {
      setLog(`❌ Error: ${error.message}`);
    }
  };

  const reset = () => {
    setImgSrc(null);
    setAiHash(null);
    setMode('idle');
    setStability(0);
    setLog("");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex gap-8">
      
      {/* LEFT: FORM */}
      <div className="w-1/2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <UserPlus className="text-satya-blue" /> Smart Voter Enrollment
        </h1>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input required type="text" className="w-full p-3 rounded-lg border border-slate-200 font-bold"
              value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">EPIC ID</label>
            <input required type="text" className="w-full p-3 rounded-lg border border-slate-200 font-mono"
              value={formData.epicId} onChange={e => setFormData({...formData, epicId: e.target.value})} />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">State</label>
                <select className="w-full p-2 bg-white rounded border border-slate-200"
                  value={formData.homeState} onChange={e => setFormData({...formData, homeState: e.target.value})}>
                  <option>Delhi</option>
                  <option>Mumbai</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Constituency ID</label>
                <input type="number" className="w-full p-2 rounded border border-slate-200"
                  value={formData.constituencyId} onChange={e => setFormData({...formData, constituencyId: e.target.value})} />
             </div>
          </div>

          {/* REGISTER BUTTON (Only active after Blink Capture) */}
          <button 
            type="submit"
            disabled={mode !== 'verified'}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                mode === 'verified' ? 'bg-green-600 hover:bg-green-700 shadow-lg' : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {mode === 'verified' ? <><Save size={20}/> Confirm Registration</> : "Waiting for Face Capture..."}
          </button>
        </form>
      </div>

      {/* RIGHT: SMART CAMERA */}
      <div className="w-1/2 flex flex-col gap-4">
        <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video ring-4 transition-all ${
            mode === 'stable' ? 'ring-satya-orange' :
            mode === 'verified' ? 'ring-green-500' : 'ring-transparent'
        }`}>
            {imgSrc ? (
               <img src={imgSrc} className="w-full h-full object-cover" alt="Captured" />
            ) : mode === 'idle' ? (
               <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <Camera size={48} className="opacity-20" />
               </div>
            ) : (
               <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
            )}

            {/* HUD OVERLAY */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {mode === 'scanning' && (
                    <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur font-mono text-sm">
                        Keep Face Steady: {stability}%
                    </div>
                )}
                {mode === 'stable' && (
                    <div className="bg-satya-orange text-white px-6 py-3 rounded-xl font-black text-xl animate-bounce shadow-lg">
                        ⚡️ BLINK NOW ⚡️
                    </div>
                )}
                {mode === 'verified' && (
                    <div className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                        <CheckCircle /> LIVENESS VERIFIED
                    </div>
                )}
            </div>
        </div>

        {/* CONTROLS */}
        {mode === 'idle' ? (
            <button onClick={startCamera} className="w-full py-4 bg-satya-blue text-white rounded-xl font-bold hover:bg-blue-900 transition-all shadow-md flex items-center justify-center gap-2">
                <ScanFace size={20} /> Start AI Camera
            </button>
        ) : (
            <button onClick={reset} className="w-full py-4 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all flex items-center justify-center gap-2">
                <RefreshCw size={20} /> Reset / Retake
            </button>
        )}

        <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-green-400 min-h-[80px] border border-slate-700">
            <p className="opacity-50">System Status:</p>
            <p> {log || "Ready to initialize..."}</p>
            {aiHash && <p className="text-orange-400 mt-1 break-all">> Hash: {aiHash}</p>}
        </div>
      </div>

    </div>
  );
};

export default VoterOnboarding;