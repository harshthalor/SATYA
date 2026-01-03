import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Shield, Camera, CheckCircle, AlertCircle } from 'lucide-react';

const Login = () => {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('searching'); // searching, stable, blink, verifying, success
  const [stableFrames, setStableFrames] = useState(0);
  const REQUIRED_STABILITY = 10;

  // The "Auto-Kiosk" Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'searching' || status === 'stable') {
        processFrame();
      }
    }, 200); // Check 5 times per second
    return () => clearInterval(interval);
  }, [status, stableFrames]);

  const processFrame = async () => {
    const image = webcamRef.current?.getScreenshot();
    if (!image) return;

    // Send a low-res "pre-scan" to Member B to check for eyes
    // This mimics the 'frames_stable' logic from your Python script
    try {
      const blob = await (await fetch(image)).blob();
      const formData = new FormData();
      formData.append("file", blob);

      const res = await fetch('/api/v1/auth/scan', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.status === "success") {
        // AI says "Blink Detected" (Eyes were closed in this frame)
        if (status === 'stable') {
          handleSuccess(data);
        }
      } else if (data.message.includes("Eyes are OPEN")) {
        // User is looking, increment stability
        setStableFrames(prev => prev + 1);
        if (stableFrames >= REQUIRED_STABILITY) setStatus('stable');
      } else {
        // Lost face
        setStableFrames(0);
        setStatus('searching');
      }
    } catch (e) {
      console.error("Kiosk Error", e);
    }
  };

  const handleSuccess = (data) => {
    setStatus('success');
    console.log("Voter Hash:", data.voter_hash);
    setTimeout(() => window.location.href = "/vote", 1500);
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-slate-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-satya-blue tracking-tighter">SATYA TERMINAL</h1>
        <p className="text-slate-400 font-mono text-xs uppercase mt-2">Biometric Identity Layer</p>
      </div>

      <div className="relative group">
        {/* Visual feedback ring based on state */}
        <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 opacity-30 ${
          status === 'stable' ? 'bg-orange-400 animate-pulse' : 
          status === 'success' ? 'bg-green-400' : 'bg-blue-400'
        }`} />
        
        <div className={`relative w-80 h-80 rounded-full overflow-hidden border-8 transition-all duration-500 ${
          status === 'stable' ? 'border-satya-orange' : 
          status === 'success' ? 'border-green-500' : 'border-satya-blue'
        }`}>
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="mt-10 w-full max-w-xs text-center space-y-4">
        <div className="py-3 px-6 rounded-2xl bg-white shadow-sm border border-slate-200">
          {status === 'searching' && <p className="text-blue-600 font-bold animate-pulse">CENTER YOUR FACE</p>}
          {status === 'stable' && <p className="text-satya-orange font-bold animate-bounce">⚡️ BLINK NOW ⚡️</p>}
          {status === 'success' && <p className="text-green-600 font-bold flex items-center justify-center gap-2"><CheckCircle size={18}/> IDENTITY VERIFIED</p>}
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed px-4">
          Stability: {Math.min(100, (stableFrames/REQUIRED_STABILITY)*100).toFixed(0)}%
        </p>
      </div>
    </div>
  );
};

export default Login;