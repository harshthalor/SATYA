import React, { useState } from 'react';
import { MapPin, ArrowRight, RefreshCw, Activity, Search, CheckCircle } from 'lucide-react';
import FaceLivenessCam from '../components/FaceLivenessCam'; // ✅ Import Camera

const UpdateConstituency = () => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    voterId: '',
    newState: 'Delhi',
    constituencyId: '1'
  });
  
  const [status, setStatus] = useState('idle'); // idle, scanning, searching, success, error
  const [log, setLog] = useState("");
  const [cameraActive, setCameraActive] = useState(true); // Control camera visibility

  // Configuration Mapping
  const CONSTITUENCY_LOOKUP = {
    'Delhi': { id: '1', region: 'North Delhi Central' },
    'Mumbai': { id: '2', region: 'Mumbai South' },
    'Bihar': { id: '3', region: 'Patna Sahib' }
  };

  // --- 1. FACE SCAN HANDLER ---
  const handleFaceDetected = async (imgSrc) => {
    setLog("🔍 Analyzing Face...");
    setCameraActive(false); // Hide camera temporarily
    setStatus('searching');

    try {
      // Send face to Admin Server to find the Voter ID
      const response = await fetch('http://localhost:8080/api/v1/admin/search-voter-by-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: imgSrc })
      });

      const data = await response.json();

      if (response.ok && data.voterId) {
        setFormData(prev => ({ ...prev, voterId: data.voterId }));
        setLog(`✅ IDENTIFIED: Welcome back, ${data.voterId}!`);
        setStatus('idle');
      } else {
        throw new Error("Face not found in database.");
      }
    } catch (error) {
      setLog(`❌ Search Failed: ${error.message}`);
      setStatus('error');
      // detailed error handling? reset camera?
      setTimeout(() => setCameraActive(true), 3000); // Bring camera back after 3s
    }
  };

  // --- 2. UPDATE HANDLER (Blockchain) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.voterId || !formData.newState) return;

    setStatus('loading');
    setLog(`🚀 Initiating transfer for Voter: ${formData.voterId}...`);

    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/update-location', {
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
        setStatus('success');
        setLog(`✅ SUCCESS: Voter moved to ${formData.newState}.`);
      } else {
        throw new Error(data.error || "Update Failed");
      }
    } catch (error) {
      setStatus('error');
      setLog(`❌ ERROR: ${error.message}`);
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const mapping = CONSTITUENCY_LOOKUP[selectedState];
    setFormData({ ...formData, newState: selectedState, constituencyId: mapping.id });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex gap-8 font-sans">
      
      {/* LEFT: FORM */}
      <div className="w-1/2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MapPin className="text-blue-600" /> Constituency Mobility
        </h1>

        <form onSubmit={handleUpdate} className="space-y-5">
            {/* Input 1: Voter ID (Auto-Filled by Face) */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                    Target Voter EPIC ID
                    {status === 'searching' && <span className="text-blue-500 animate-pulse">Scanning...</span>}
                </label>
                <div className="relative mt-1">
                    <input 
                        required 
                        type="text" 
                        placeholder="Scan Face or Type ID..."
                        className={`w-full p-3 rounded-lg border-2 font-bold outline-none font-mono transition-all ${
                            formData.voterId ? 'border-green-500 bg-green-50 text-green-800' : 'border-slate-200 text-slate-700 focus:border-blue-500'
                        }`}
                        value={formData.voterId} 
                        onChange={e => setFormData({...formData, voterId: e.target.value})} 
                    />
                    {formData.voterId && <CheckCircle className="absolute right-3 top-3 text-green-600" size={20} />}
                </div>
            </div>
          
            {/* Input 2: State Selection */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">New Home State</label>
                    <select 
                        className="w-full p-2 bg-white rounded border border-slate-200 font-bold outline-none focus:border-blue-500"
                        value={formData.newState} 
                        onChange={handleStateChange}
                    >
                        {Object.keys(CONSTITUENCY_LOOKUP).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Mapped ID</label>
                    <input 
                        type="text" 
                        readOnly 
                        className="w-full p-2 rounded border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                        value={formData.constituencyId} 
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={status === 'loading' || !formData.voterId}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                    status === 'loading' ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {status === 'loading' ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
                {status === 'loading' ? "Committing to Ledger..." : "Update Constituency"}
            </button>
        </form>
      </div>

      {/* RIGHT: CAMERA / STATUS */}
      <div className="w-1/2 flex flex-col items-center gap-4 pt-10">
        
        {/* Dynamic Display: Shows Camera OR Status Box */}
        {cameraActive ? (
             <div className="relative w-96 h-72">
                <div className="absolute -top-6 left-0 right-0 text-center text-xs font-bold text-slate-500 uppercase">
                    Scan Face to Auto-Fill ID
                </div>
                {/* Reuse your existing Camera Component */}
                <FaceLivenessCam onCapture={handleFaceDetected} isProcessing={status === 'searching'} />
             </div>
        ) : (
            // Status Box (Shown when processing or done)
            <div className="relative w-96 h-72 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                 <div className={`p-6 rounded-full ${status === 'success' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}>
                    {status === 'success' ? <CheckCircle className="text-white" size={48} /> : <Search className="text-white" size={48} />}
                 </div>
                 <button 
                    onClick={() => setCameraActive(true)}
                    className="absolute bottom-4 text-xs text-slate-400 hover:text-white underline"
                 >
                    Scan Another Face
                 </button>
            </div>
        )}

        <div className="w-full max-w-lg p-4 bg-slate-900 rounded-xl font-mono text-xs text-green-400 border border-slate-800">
            <p className="opacity-50 border-b border-slate-700 pb-2 mb-2">SYSTEM LOG:</p>
            <p className="animate-pulse"> {log || "Waiting for face input..."}</p>
        </div>
      </div>
    </div>
  );
};

export default UpdateConstituency;