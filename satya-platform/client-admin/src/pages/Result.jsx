import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { 
  Vote, Activity, MapPin, RefreshCw, Trophy 
} from 'lucide-react';

const Result = () => {
  const [data, setData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [constituency, setConstituency] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Helper to safely find the winner
  const leader = data.length > 0 && totalVotes > 0
    ? data.reduce((prev, current) => (prev.votes > current.votes) ? prev : current) 
    : null;

  const fetchLiveStats = useCallback(async () => {
    setLoading(true);
    try {
      // API Call
      const res = await fetch(`http://localhost:8080/api/v1/results/${constituency}`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const realData = await res.json();
      
      // Process colors for the UI (Soft Dark Theme)
      const processedData = realData.map((item, index) => ({
        ...item,
        // Using indigo and violet for a modern, slightly neon pop against slate
        fill: item.fill || (index % 2 === 0 ? '#818cf8' : '#a78bfa') 
      }));

      setData(processedData);
      setTotalVotes(realData.reduce((acc, curr) => acc + curr.votes, 0));
      setLastUpdated(new Date());

    } catch (error) {
      console.log("Using fallback data...");
      // Fallback Mock Data
      const mockData = [
        { name: 'BJP', votes: 1240, fill: '#fb923c' },  // Orange-400
        { name: 'INC', votes: 850, fill: '#60a5fa' },   // Blue-400
        { name: 'AAP', votes: 420, fill: '#38bdf8' },   // Sky-400
        { name: 'OTH', votes: 150, fill: '#94a3b8' },   // Slate-400
      ];
      setData(mockData);
      setTotalVotes(mockData.reduce((acc, curr) => acc + curr.votes, 0));
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
    // BG-SLATE-900 is softer than black, giving a "Deep Blue/Grey" feel
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 pb-12 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      {/* Lighter Slate-800 for header distinction */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-6 mb-8 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                  Election Command Center
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Live Consensus • Last Synced: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {/* Constituency Switcher */}
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex shadow-inner">
                    <button 
                        onClick={() => setConstituency(1)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                        constituency === 1 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                        <MapPin size={14}/> Delhi
                    </button>
                    <button 
                        onClick={() => setConstituency(2)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                        constituency === 2 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                        <MapPin size={14}/> Mumbai
                    </button>
                </div>

                {/* Refresh Button */}
                <button 
                    onClick={fetchLiveStats}
                    disabled={loading}
                    className="h-10 w-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-indigo-500 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin text-indigo-400" : ""} />
                </button>
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-6xl mx-auto px-8 space-y-8">
        
        {/* 1. STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Total Votes Card - Slate 800 Background */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl flex items-center justify-between group hover:border-indigo-500/50 transition-all duration-300">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Votes Cast</p>
                    <h3 className="text-5xl font-black text-white tracking-tight">
                        {totalVotes.toLocaleString()}
                    </h3>
                </div>
                <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-slate-700">
                    <Vote size={40} />
                </div>
            </div>

            {/* Leading Candidate Card - Slate 800 Background */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl flex items-center justify-between group hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden">
                {/* Subtle Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-500"></div>

                <div className="z-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leading Candidate</p>
                    <h3 className="text-5xl font-black text-white tracking-tight">
                        {leader ? leader.name : '-'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs font-bold border border-emerald-500/20">
                             {leader ? `${((leader.votes / totalVotes) * 100).toFixed(1)}%` : '0%'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase">Vote Share</span>
                    </div>
                </div>
                <div className="z-10 w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 border border-slate-700">
                    <Trophy size={36} />
                </div>
            </div>
        </div>

        {/* 2. MAIN CHART - Slate 800 Background */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-700">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Live Vote Tally</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Blockchain Verified Results</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    Immutable Ledger
                </div>
            </div>
            
            <div className="w-full h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                        
                        <defs>
                            {data.map((entry, index) => (
                                <linearGradient key={`grad-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={entry.fill} stopOpacity={0.9}/>
                                    <stop offset="95%" stopColor={entry.fill} stopOpacity={0.4}/>
                                </linearGradient>
                            ))}
                        </defs>

                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#cbd5e1', fontSize: 14, fontWeight: 700}}
                            dy={20}
                            interval={0} 
                        />
                        
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                        />
                        
                        <Tooltip 
                            cursor={{ fill: '#334155', opacity: 0.3 }}
                            contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                borderRadius: '12px', 
                                border: '1px solid #475569', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                                color: '#f1f5f9',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        
                        <Bar 
                            dataKey="votes" 
                            radius={[10, 10, 10, 10]} 
                            barSize={60} 
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={`url(#gradient-${index})`} 
                                    stroke={entry.fill}
                                    strokeWidth={1}
                                />
                            ))}
                            <LabelList dataKey="votes" position="top" fill="#cbd5e1" fontSize={12} fontWeight="bold" offset={10} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Result;