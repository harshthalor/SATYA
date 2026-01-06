import React, { useState } from 'react';
import { Save, UserPlus, CheckCircle, Camera } from 'lucide-react';
// IMPORT YOUR NEW COMPONENT
import FaceLivenessCam from '../components/FaceLivenessCam'; 

const VoterOnboarding = () => {
  // --- STATE ---
  const [mode, setMode] = useState('idle'); // idle, captured
  const [imgSrc, setImgSrc] = useState(null);
  const [log, setLog] = useState("");
  
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

  // --- HANDLER: Called when FaceLivenessCam verifies a human ---
  const handleLivenessVerified = (imageSrc) => {
    setImgSrc(imageSrc);
    setMode('captured');
    setLog("✅ Liveness Verified & Photo Captured!");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (mode !== 'captured' || !imgSrc) return;

    setLog("⏳ Processing Registration...");

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
        setLog(`🎉 Success! Voter Registered. ID: ${data.voterId}`);
      } else {
        if (response.status === 409) {
           setLog(`⛔ BLOCKED: ${data.message}`);
        } else if (response.status === 403) {
           setLog(`🛡️ SECURITY: ${data.message}`);
        } else {
           throw new Error(data.message || "Registration Failed");
        }
      }
    } catch (error) {
      setLog(`❌ Error: ${error.message}`);
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
    setLog("");
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
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">EPIC ID</label>
            <input required type="text" className="w-full p-3 mt-1 rounded-lg border border-slate-200 font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.epicId} onChange={e => setFormData({...formData, epicId: e.target.value})} 
            />
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">State</label>
                <select className="w-full p-2 bg-white rounded border border-slate-200 font-bold"
                  value={formData.homeState} onChange={handleStateChange}>
                  {Object.keys(CONSTITUENCY_LOOKUP).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Mapped ID</label>
                <input type="text" readOnly className="w-full p-2 rounded border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                  value={formData.constituencyId} />
             </div>
          </div>

          <button 
            type="submit"
            disabled={mode !== 'captured'}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                mode === 'captured' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {mode === 'captured' ? <><Save size={20}/> Confirm Registration</> : "Complete Liveness Check"}
          </button>
        </form>
      </div>

      {/* RIGHT: CAMERA UI */}
      <div className="w-1/2 flex flex-col items-center gap-4 pt-10">
        
        {/* --- HERE IS THE SWITCH --- */}
        {/* If we have an image, show it. If not, show the FaceLivenessCam component */}
        {imgSrc ? (
            <div className="relative w-96 h-72 bg-black rounded-2xl overflow-hidden shadow-2xl ring-4 ring-green-500">
               <img src={imgSrc} className="w-full h-full object-cover" alt="Captured" />
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                        <CheckCircle size={20} /> PHOTO READY
                    </div>
               </div>
            </div>
        ) : (
            // This is the Circular Camera with Blink Detection
            <FaceLivenessCam onCapture={handleLivenessVerified} />
        )}

        {/* CONTROLS */}
        <div className="flex gap-4">
           {mode === 'captured' && (
                <button onClick={reset} className="py-3 px-8 bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300">
                    <Camera size={20} /> Retake
                </button>
           )}
        </div>

        {/* LOG CONSOLE */}
        <div className="w-full max-w-lg p-4 bg-slate-900 rounded-xl font-mono text-xs text-green-400 border border-slate-800 overflow-y-auto max-h-[150px]">
            <p className="opacity-50 border-b border-slate-700 pb-2 mb-2">SYSTEM LOG:</p>
            <p className="animate-pulse">> {log || "Waiting for Liveness Check..."}</p>
        </div>
      </div>
    </div>
  );
};

export default VoterOnboarding;