'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList 
} from 'recharts';
import { 
  Vote, Activity, MapPin, RefreshCw, Trophy, AlertCircle, ShieldCheck, Info 
} from 'lucide-react';

const Result = () => {
  const [data, setData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [constituency, setConstituency] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(''); // For troubleshooting
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper to safely find the winner
  const leader = data.length > 0 && totalVotes > 0
    ? data.reduce((prev, current) => (prev.votes > current.votes) ? prev : current) 
    : null;

  const fetchLiveStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // 1. DETERMINE URL
    // Priority: Vercel Env Var -> Hardcoded Fallback -> Localhost
    // Note: 'NEXT_PUBLIC_API_URL' must be set in Vercel Dashboard for prod
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const targetUrl = `${API_BASE}/api/v1/results/${constituency}`;
    
    setDebugInfo(`Attempting to connect to: ${targetUrl}`);

    try {
      const res = await fetch(targetUrl);
      
      if (!res.ok) {
        throw new Error(`Server responded with Status ${res.status} (${res.statusText})`);
      }
      
      const realData = await res.json();
      
      if (Array.isArray(realData)) {
        const processedData = realData.map((item, index) => ({
          ...item,
          votes: Number(item.votes),
          fill: item.fill || ['#ea580c', '#0284c7', '#16a34a', '#64748b'][index % 4]
        }));

        setData(processedData);
        setTotalVotes(processedData.reduce((acc, curr) => acc + curr.votes, 0));
        setLastUpdated(new Date());
      } else {
        throw new Error("Invalid data format received from server.");
      }

    } catch (err) {
      console.error("Fetch error:", err);
      
      // 2. INTELLIGENT ERROR DIAGNOSIS
      let friendlyError = err.message;
      if (err.message.includes("Failed to fetch")) {
        // This usually means CORS or Mixed Content
        if (API_BASE.includes("http://") && window.location.protocol === "https:") {
          friendlyError = "Mixed Content Error: You are on HTTPS (Vercel) but trying to fetch HTTP (Insecure Backend). Your backend MUST be HTTPS.";
        } else {
          friendlyError = "Network Error: Could not reach backend. Check CORS settings or if backend is offline.";
        }
      }
      setError(friendlyError);
      setData([]); 
    } finally {
      setLoading(false);
    }
  }, [constituency]);

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 10000); 
    return () => clearInterval(interval);
  }, [fetchLiveStats]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-slate-900 pb-12 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <header className="bg-[#e0f2fe] border-b border-blue-100 px-4 md:px-8 py-6 mb-8 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <div className="flex items-center gap-3">
                   <div className="bg-sky-600 text-white p-2 rounded-lg">
                      <Vote size={24} />
                   </div>
                   <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                     SATYA <span className="text-sky-700 font-medium">Result Portal</span>
                   </h1>
                </div>
                
                <div className="flex items-center gap-2 mt-2 ml-1">
                    {error ? (
                         <span className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                            <AlertCircle size={12} /> Connection Failed
                         </span>
                    ) : (
                        <>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
                            </span>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Live from Election Authority • {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Syncing...'}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
                    <button 
                        onClick={() => setConstituency(1)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                        constituency === 1 
                            ? 'bg-sky-600 text-white shadow-md transform scale-105' 
                            : 'text-slate-500 hover:text-sky-700 hover:bg-sky-50'
                        }`}
                    >
                        <MapPin size={14}/> Delhi
                    </button>
                    <button 
                        onClick={() => setConstituency(2)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                        constituency === 2 
                             ? 'bg-sky-600 text-white shadow-md transform scale-105' 
                             : 'text-slate-500 hover:text-sky-700 hover:bg-sky-50'
                        }`}
                    >
                        <MapPin size={14}/> Mumbai
                    </button>
                </div>

                <button 
                    onClick={fetchLiveStats}
                    disabled={loading}
                    className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-sky-600 hover:border-sky-300 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin text-sky-600" : ""} />
                </button>
            </div>
        </div>
      </header>

      {/* --- ERROR & DEBUG DISPLAY --- */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col gap-2 text-red-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <h3 className="font-bold text-lg">Connection Error</h3>
                </div>
                <p className="text-sm ml-9 font-medium">{error}</p>
                <div className="bg-white/50 p-3 rounded mt-2 ml-9 text-xs font-mono text-red-700 break-all border border-red-100">
                    <span className="font-bold">Debug Info:</span> {debugInfo}
                </div>
                <div className="ml-9 mt-2 flex gap-3">
                    <button 
                        onClick={fetchLiveStats}
                        className="px-4 py-2 bg-white border border-red-200 rounded-lg text-xs font-bold shadow-sm hover:bg-red-100 transition-colors"
                    >
                        Retry Connection
                    </button>
                    <a 
                       href={debugInfo.replace('Attempting to connect to: ', '')} 
                       target="_blank"
                       rel="noreferrer"
                       className="px-4 py-2 bg-red-100 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-2"
                    >
                        Open API in Browser <Info size={12} />
                    </a>
                </div>
            </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      {!error && (
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center justify-between group hover:border-sky-200 transition-all duration-300">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Votes Cast</p>
                    <h3 className="text-5xl font-black text-slate-800 tracking-tight">
                        {totalVotes.toLocaleString()}
                    </h3>
                </div>
                <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Vote size={40} />
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center justify-between group hover:border-green-200 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-500"></div>

                <div className="z-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leading Candidate</p>
                    <h3 className="text-5xl font-black text-slate-800 tracking-tight">
                        {leader ? leader.name : '-'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        {leader && totalVotes > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200">
                                {`${((leader.votes / totalVotes) * 100).toFixed(1)}%`}
                            </span>
                        )}
                        <span className="text-xs font-bold text-slate-500 uppercase">Vote Share</span>
                    </div>
                </div>
                <div className="z-10 w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <Trophy size={36} />
                </div>
            </div>
        </div>

        {/* CHART ROW */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-slate-100 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Live Vote Tally</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Blockchain Verified Results</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    <ShieldCheck size={16} className="text-sky-600" />
                    Immutable Ledger Active
                </div>
            </div>
            
            <div className="w-full h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <defs>
                            {data.map((entry, index) => (
                                <linearGradient key={`grad-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={entry.fill} stopOpacity={0.9}/>
                                    <stop offset="95%" stopColor={entry.fill} stopOpacity={0.6}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#475569', fontSize: 14, fontWeight: 700}} 
                            dy={20}
                            interval={0} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                        />
                        <Tooltip 
                            cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                borderRadius: '12px', 
                                border: '1px solid #e2e8f0', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                color: '#1e293b',
                                fontWeight: 'bold'
                            }}
                        />
                        <Bar 
                            dataKey="votes" 
                            radius={[8, 8, 8, 8]} 
                            barSize={60} 
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} stroke={entry.fill} strokeWidth={0} />
                            ))}
                            <LabelList dataKey="votes" position="top" fill="#64748b" fontSize={12} fontWeight="bold" offset={10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Result;