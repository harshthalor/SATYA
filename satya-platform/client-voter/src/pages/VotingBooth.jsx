import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- 🌐 API CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Vote = () => {
  const navigate = useNavigate();
  const [ballot, setBallot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteStatus, setVoteStatus] = useState('idle'); 
  const [txId, setTxId] = useState("");

  // 1. Fetch Ballot
  useEffect(() => {
    const fetchBallot = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate("/");

      try {
        console.log(`Fetching ballot from ${API_BASE_URL}/api/v1/ballot...`);
        // ✅ UPDATED URL
        const res = await fetch(`${API_BASE_URL}/api/v1/ballot`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 403 || res.status === 401) {
            alert("Session expired. Please login again.");
            return navigate("/");
        }

        const data = await res.json();
        setBallot(data);
      } catch (error) {
        console.error("Ballot Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBallot();
  }, [navigate]);

  // 2. Cast Vote
  const castVote = async (candidateId) => {
    if (!window.confirm("Confirm your vote? This action is permanent.")) return;

    setVoteStatus('casting');
    const token = localStorage.getItem('token');

    try {
      // ✅ UPDATED URL
      const res = await fetch(`${API_BASE_URL}/api/v1/ballot/cast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ candidate_id: candidateId })
      });

      const data = await res.json();

      if (res.ok) {
        setVoteStatus('success');
        setTxId(data.transactionId);
      } else {
        alert("Vote Failed: " + (data.message || "Unknown error"));
        setVoteStatus('error');
      }
    } catch (error) {
      console.error("Casting Error:", error);
      setVoteStatus('error');
    }
  };

  const logout = () => {
      localStorage.removeItem('token');
      navigate("/");
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">Loading Ballot...</div>;

  if (voteStatus === 'success') {
      return (
        <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center p-8 text-center text-white">
            <CheckCircle size={64} className="text-green-400 mb-6" />
            <h1 className="text-4xl font-black mb-2">VOTE RECORDED</h1>
            <p className="text-green-200 mb-8 opacity-80">Your identity has been verified and vote stored on Blockchain.</p>
            <div className="bg-black/30 p-4 rounded-xl font-mono text-xs text-green-400 break-all max-w-lg border border-green-800">
                TX_ID: {txId}
            </div>
            <button onClick={logout} className="mt-8 text-white font-bold hover:underline">Return to Login</button>
        </div>
      );
  }

  // ... (REST OF THE JSX REMAINS EXACTLY THE SAME) ...
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Shield className="text-blue-600"/> SATYA DIGITAL BALLOT
            </h1>
        </div>
        <div className="text-right">
            <p className="text-sm font-bold text-slate-700">Region: <span className="text-orange-600 uppercase">{ballot?.constituency}</span></p>
            <button onClick={logout} className="text-xs text-red-500 font-bold hover:underline flex items-center justify-end gap-1 mt-1 uppercase">
                Logout Session
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
  {ballot?.candidates?.map((candidate) => (
    <div key={candidate.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group">
      
      {/* 1. Image Section */}
      <div className="h-36 bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100 relative">
        <img 
          src={candidate.symbol_url} 
          alt={candidate.party} 
          className="h-24 w-24 object-contain group-hover:scale-110 transition-transform duration-300 z-10"
          onError={(e) => {
            e.target.style.display = 'none';
            if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div style={{ display: 'none' }} className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black">
            {candidate.party.charAt(0)}
          </div>
        </div>
      </div>

      {/* 2. Text Content Section (This was missing!) */}
      <div className="p-6 text-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {candidate.name} {/* 👈 Displays Candidate Name */}
        </h2>
        <p className="text-sm font-bold text-blue-600 mb-6 uppercase tracking-widest">
          {candidate.party} {/* 👈 Displays Party Name */}
        </p>

        {/* 3. Vote Action Button */}
        <button 
          onClick={() => castVote(candidate.id)}
          disabled={voteStatus === 'casting'}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300"
        >
          {voteStatus === 'casting' ? "COMMITTING..." : "CONFIRM VOTE"}
        </button>
      </div>
      
    </div>
  ))}
</div>
      
      {ballot?.candidates?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <AlertTriangle className="mx-auto mb-4 text-slate-300" size={48}/>
              <p className="text-slate-500 font-bold">No active candidates found for your constituency.</p>
          </div>
      )}
    </div>
  );
};

export default Vote;