import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, Lock, ChevronRight, Loader2 } from 'lucide-react';

// Mock Data (Member B will eventually serve this from the Blockchain)
const CANDIDATES = [
  { id: 101, name: "Arjun Mehta", party: "Progressive Future", color: "bg-blue-100 border-blue-500", icon: "🚀" },
  { id: 102, name: "Priya Sharma", party: "National Unity", color: "bg-orange-100 border-orange-500", icon: "🦁" },
  { id: 103, name: "David Wilson", party: "Green Earth Alliance", color: "bg-green-100 border-green-500", icon: "🌱" }
];

const VotingBooth = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, encrypting, success, error
  const [voterToken, setVoterToken] = useState(null);

  useEffect(() => {
    // 1. Retrieve the Voter Hash from storage (saved during Login)
    // For now, let's mock it if missing, or use localStorage if you set it there
    const token = localStorage.getItem('voter_hash') || "DEMO_TOKEN_12345";
    setVoterToken(token);
  }, []);

  // ... inside castVote function ...

// ... inside castVote function

const castVote = async () => {
  if (!selectedCandidate) return;
  setStatus('encrypting');

  try {
    // 1. Send to Member B (Port 8080)
    // Note: We don't send 'voterId' manually anymore. The backend extracts it from the Token!
    const response = await fetch('http://localhost:8080/api/v1/ballot/vote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // <--- THE VIP BADGE
      },
      body: JSON.stringify({
        candidateId: selectedCandidate.id
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setStatus('success');
      console.log("Vote Recorded! Tx Hash:", data.txId);
    } else {
      console.error("Vote failed:", data.message);
      setStatus('error');
    }
  } catch (err) {
    console.error("Network Error:", err);
    setStatus('error');
  }
};

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShieldCheck size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-satya-blue mb-2">Vote Secured</h1>
        <p className="text-slate-500 max-w-xs mx-auto mb-8">
          Your ballot has been encrypted and permanently recorded on the Hyperledger Blockchain.
        </p>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full max-w-xs">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Transaction Hash</p>
          <p className="font-mono text-xs text-slate-600 break-all">0x7f9a2b3c...8d9e1f</p>
        </div>
        <button 
          onClick={() => window.location.href = "/"}
          className="mt-12 text-satya-blue font-bold hover:underline"
        >
          Return to Terminal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-8 bg-satya-blue text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Lock size={120} /></div>
        <p className="text-blue-200 text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> Secure Session Active
        </p>
        <h1 className="text-3xl font-bold mt-2">Official Ballot</h1>
        <p className="text-blue-100 text-sm mt-1">General Election 2026</p>
      </div>

      {/* Candidate List */}
      <div className="flex-1 px-6 py-8 space-y-4">
        {CANDIDATES.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCandidate(c)}
            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group ${
              selectedCandidate?.id === c.id 
                ? `${c.color} shadow-md scale-[1.02]` 
                : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div className="text-4xl filter drop-shadow-sm">{c.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg">{c.name}</h3>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.party}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedCandidate?.id === c.id ? 'border-satya-blue bg-satya-blue' : 'border-slate-300'
            }`}>
              {selectedCandidate?.id === c.id && <Check size={14} className="text-white" />}
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="p-6 bg-white border-t border-slate-100">
        <button
          onClick={castVote}
          disabled={!selectedCandidate || status === 'encrypting'}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
            selectedCandidate 
              ? 'bg-satya-orange text-white hover:bg-orange-600 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {status === 'encrypting' ? (
            <><Loader2 className="animate-spin" /> Processing...</>
          ) : (
            <>Confirm Vote <ChevronRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default VotingBooth;