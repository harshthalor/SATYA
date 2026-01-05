import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { ScanFace } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [log, setLog] = useState("Ready to verify identity.");

  const verifyIdentity = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setStatus('verifying');
    setLog("🔐 Verifying with Face++ Cloud...");

    try {
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
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (e) {
      setStatus('error');
      setLog("❌ Server Error. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black tracking-tighter text-blue-400">SATYA VOTER</h1>
        <p className="text-slate-500 font-mono text-xs uppercase mt-2">Secure Voting Terminal</p>
      </div>

      <div className="relative group rounded-full">
        {/* Status Ring Animation */}
        <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 opacity-40 ${
          status === 'verifying' ? 'bg-blue-500 animate-pulse' : 
          status === 'success' ? 'bg-green-500' : 
          status === 'error' ? 'bg-red-500' : 'bg-slate-700'
        }`} />
        
        <div className={`relative w-72 h-72 rounded-full overflow-hidden border-4 transition-all duration-300 bg-black ${
          status === 'success' ? 'border-green-500' : 
          status === 'error' ? 'border-red-500' : 'border-slate-700'
        }`}>
          <Webcam 
            ref={webcamRef} 
            screenshotFormat="image/jpeg" 
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        </div>
      </div>

      <div className="mt-10 w-full max-w-sm text-center space-y-6">
        <div className="py-4 px-6 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm">
            {log}
        </div>

        <button 
            onClick={verifyIdentity}
            disabled={status === 'verifying' || status === 'success'}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                status === 'verifying' ? 'bg-slate-600 cursor-wait' :
                status === 'success' ? 'bg-green-600' :
                'bg-blue-600 hover:bg-blue-500'
            }`}
        >
            {status === 'verifying' ? "Scanning..." : <><ScanFace /> VERIFY ME</>}
        </button>
      </div>
    </div>
  );
};

export default Login;