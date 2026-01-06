import React, { useState, useRef } from 'react'; // 1. Import useRef
import { useNavigate } from 'react-router-dom';
import FaceLivenessCam from '../components/FaceLivenessCam'; 

const Login = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [log, setLog] = useState("Ready to verify identity.");
  
  // 2. Create the Lock
  const isSubmittingRef = useRef(false);

  // This replaces verifyIdentity. It runs automatically when FaceLivenessCam detects a blink.
  const handleCapture = async (imageSrc) => {
    // 3. CHECK LOCK: If verification is already running, stop here.
    if (!imageSrc || isSubmittingRef.current) return;

    // 4. SET LOCK: Block future requests
    isSubmittingRef.current = true;

    setStatus('verifying');
    setLog("🔐 Verifying with Face++ Cloud...");

    try {
      // --- EXISTING LOGIC STARTS HERE ---
      const res = await fetch('/api/v1/auth/scan', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageSrc })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setLog(`✅ Welcome, ${data.user.name}!`);
        // Save token for the Vote page
        localStorage.setItem('token', data.token);
        // Redirect to Vote page after 1.5s
        setTimeout(() => navigate("/vote"), 1500); 
      } else {
        setStatus('error');
        setLog(`⛔ ${data.message || "Verification Failed"}`);
        // Reset to idle so they can try blinking again
        setTimeout(() => {
            setStatus('idle');
            isSubmittingRef.current = false; // 5. UNLOCK on error so they can retry
        }, 3000);
      }
      // --- EXISTING LOGIC ENDS HERE ---

    } catch (e) {
      setStatus('error');
      setLog("❌ Server Error. Try again.");
      setTimeout(() => {
          setStatus('idle');
          isSubmittingRef.current = false; // 5. UNLOCK on error so they can retry
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black tracking-tighter text-blue-400">SATYA VOTER</h1>
        <p className="text-slate-500 font-mono text-xs uppercase mt-2">Secure Voting Terminal</p>
      </div>

      <div className="relative group rounded-full">
        {/* Status Ring Animation (Preserved) */}
        <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 opacity-40 ${
          status === 'verifying' ? 'bg-blue-500 animate-pulse' : 
          status === 'success' ? 'bg-green-500' : 
          status === 'error' ? 'bg-red-500' : 'bg-slate-700'
        }`} />
        
        {/* REPLACED: Static Webcam -> FaceLivenessCam */}
        {/* We pass 'isProcessing' so the camera knows to stop detecting once verified */}
        <FaceLivenessCam 
            onCapture={handleCapture} 
            isProcessing={status === 'verifying' || status === 'success'}
        />
      </div>

      <div className="mt-10 w-full max-w-sm text-center space-y-6">
        <div className={`py-4 px-6 rounded-2xl border font-mono text-sm transition-colors ${
            status === 'error' ? "bg-red-900/20 border-red-500/50 text-red-200" :
            status === 'success' ? "bg-green-900/20 border-green-500/50 text-green-200" :
            "bg-slate-800 border-slate-700 text-slate-300"
        }`}>
            {log}
        </div>

        {/* Removed Manual Button: The Blink Check triggers the action automatically */}
      </div>
    </div>
  );
};

export default Login;