import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, Save, UserPlus, RefreshCw, CheckCircle, ScanFace, Aperture } from 'lucide-react';

const VoterOnboarding = () => {
  const webcamRef = useRef(null);
  
  // --- STATE ---
  const [mode, setMode] = useState('idle'); // idle, camera_active, captured
  const [imgSrc, setImgSrc] = useState(null);
  const [log, setLog] = useState("");
  const CONSTITUENCY_LOOKUP = {
    'Delhi': { id: '1', region: 'North Delhi Central' },
    'Mumbai': { id: '2', region: 'Mumbai South' },
    'Bihar': { id: '3', region: 'Patna Sahib' }
  };
  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    epicId: '',
    homeState: 'Delhi',
    constituencyId: '1' // Default matching Delhi
  });

  // --- 1. CAMERA CONTROLS ---
  const startCamera = () => {
    setMode('camera_active');
    setLog("📸 Camera Active. Please align face and click Capture.");
  };

  const capture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setMode('captured');
    setLog("✅ Photo Captured. Ready to Register.");
  };

  const reset = () => {
    setImgSrc(null);
    setMode('idle');
    setFormData({ ...formData, fullName: '', epicId: '' });
    setLog("");
  };

  // --- 2. REGISTRATION (Calls Face++ Backend) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (mode !== 'captured' || !imgSrc) return;

    setLog("⏳ Processing: Face++ Uniqueness Check -> Blockchain -> DB...");

    try {
      const payload = {
        fullName: formData.fullName,
        epicId: formData.epicId,
        homeState: formData.homeState,
        constituencyId: formData.constituencyId,
        base64Image: imgSrc 
      };

      // Note: Ensure this URL matches your Backend Admin Route
      const response = await fetch('http://localhost:8080/api/v1/admin/register-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setLog(`🎉 Success! Voter Registered. ID: ${data.voterId}`);
        // Optional: Auto-reset after success
        // setTimeout(reset, 4000);
      } else {
        // Handle specific errors like Duplicate Face
        if (response.status === 409) {
           setLog(`⛔ BLOCKED: ${data.message}`);
        } else {
           throw new Error(data.message || data.error || "Registration Failed");
        }
      }
    } catch (error) {
      setLog(`❌ Error: ${error.message}`);
    }
  };

  // --- New Mapping Handler ---
const handleStateChange = (e) => {
  const selectedState = e.target.value;
  const mapping = CONSTITUENCY_LOOKUP[selectedState];

  setFormData({
    ...formData,
    homeState: selectedState,
    constituencyId: mapping.id // 👈 Automatically maps the correct ID
  });
  
  setLog(`📍 Region Mapped: ${mapping.region} (ID: ${mapping.id})`);
};

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex gap-8 font-sans">
      
      {/* LEFT: FORM */}
      <div className="w-1/2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <UserPlus className="text-blue-600" /> Voter Onboarding
        </h1>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input required type="text" className="w-full p-3 mt-1 rounded-lg border border-slate-200 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} 
              placeholder="e.g. Arjun Mehta"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">EPIC ID</label>
            <input required type="text" className="w-full p-3 mt-1 rounded-lg border border-slate-200 font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.epicId} onChange={e => setFormData({...formData, epicId: e.target.value})} 
              placeholder="e.g. DEL1234567"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">State</label>
                <select 
                  className="w-full p-2 bg-white rounded border border-slate-200 font-bold"
                  value={formData.homeState} 
                  onChange={handleStateChange} // 👈 Use the new handler
                >
                  {Object.keys(CONSTITUENCY_LOOKUP).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Mapped Const. ID</label>
                <input 
                  type="text" 
                  readOnly // 👈 Prevent manual editing
                  className="w-full p-2 rounded border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                  value={formData.constituencyId} 
                />
            </div>
          </div>

          <button 
            type="submit"
            disabled={mode !== 'captured'}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                mode === 'captured' ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-200' : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {mode === 'captured' ? <><Save size={20}/> Confirm Registration</> : "Capture Photo First"}
          </button>
        </form>
      </div>

      {/* RIGHT: CAMERA UI */}
      <div className="w-1/2 flex flex-col gap-4">
        <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video ring-4 transition-all ${
            mode === 'captured' ? 'ring-green-500' : 
            mode === 'camera_active' ? 'ring-blue-500' : 'ring-transparent'
        }`}>
            {imgSrc ? (
               <img src={imgSrc} className="w-full h-full object-cover" alt="Captured" />
            ) : mode === 'idle' ? (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100">
                  <Camera size={64} className="opacity-20 mb-2" />
                  <p className="text-sm font-medium opacity-40">Camera Inactive</p>
               </div>
            ) : (
               <Webcam 
                 ref={webcamRef} 
                 screenshotFormat="image/jpeg" 
                 className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
               />
            )}

            {/* OVERLAYS */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {mode === 'captured' && (
                    <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                        <CheckCircle size={20} /> PHOTO READY
                    </div>
                )}
            </div>
        </div>

        {/* CONTROLS */}
        <div className="grid grid-cols-2 gap-4">
           {mode === 'idle' ? (
                <button onClick={startCamera} className="col-span-2 py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-all">
                    <ScanFace size={20} /> Start Camera
                </button>
           ) : (
             <>
                <button 
                    onClick={capture} 
                    disabled={mode === 'captured'}
                    className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        mode === 'camera_active' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <Aperture size={20} /> Capture
                </button>
                
                <button onClick={reset} className="py-4 bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300 transition-all">
                    <RefreshCw size={20} /> Retake
                </button>
             </>
           )}
        </div>

        {/* LOG CONSOLE */}
        <div className="flex-1 p-4 bg-slate-900 rounded-xl font-mono text-xs text-green-400 border border-slate-800 overflow-y-auto max-h-[150px]">
            <p className="opacity-50 border-b border-slate-700 pb-2 mb-2">SYSTEM LOG:</p>
            <p className="animate-pulse">> {log || "Waiting for input..."}</p>
        </div>
      </div>
    </div>
  );
};

export default VoterOnboarding;