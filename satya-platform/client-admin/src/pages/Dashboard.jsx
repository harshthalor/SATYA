import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Vote, Users, Server, Activity, MapPin, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [constituency, setConstituency] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // --- FETCH DATA FUNCTION (Wrapped in useCallback) ---
  const fetchLiveStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/results/${constituency}`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const realData = await res.json();
      
      setData(realData);
      const total = realData.reduce((acc, curr) => acc + curr.votes, 0);
      setTotalVotes(total);
      setLastUpdated(new Date());
    } catch (error) {
      console.log("Connection error...", error);
    } finally {
      setLoading(false);
    }
  }, [constituency]);

  // --- EFFECT: Initial Load + 5 Minute Timer ---
  useEffect(() => {
    fetchLiveStats();
    
    // Auto-refresh every 1.67 minutes (100,000 ms)
    const interval = setInterval(fetchLiveStats, 100000);
    return () => clearInterval(interval);
  }, [fetchLiveStats]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ELECTION COMMAND CENTER</h1>
          <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-2">
            <Activity size={16} className="text-green-600" /> 
            Last Synced: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-4">
            {/* MANUAL REFRESH BUTTON */}
            <button 
                onClick={fetchLiveStats}
                disabled={loading}
                className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                {loading ? "Syncing..." : "Sync Now"}
            </button>

            {/* Constituency Toggle */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setConstituency(1)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    constituency === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <MapPin size={16}/> Delhi
                </button>
                <button 
                    onClick={() => setConstituency(2)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    constituency === 2 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <MapPin size={16}/> Mumbai
                </button>
            </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<Vote />} 
          label={`Votes in ${constituency === 1 ? 'Delhi' : 'Mumbai'}`} 
          value={totalVotes} 
          color="bg-blue-600" 
        />
        <StatCard 
          icon={<Users />} 
          label="Active Nodes" 
          value="3" 
          color="bg-orange-500" 
        />
        <StatCard 
          icon={<Server />} 
          label="Blocks Mined" 
          value={`#${Math.floor(Date.now() / 100000).toString().slice(-4)}`} 
          color="bg-slate-700" 
        />
      </div>

      {/* Main Chart */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-[500px] relative">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Live Tally</h2>
            {loading && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse">Fetching Blockchain Data...</span>}
        </div>
        
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="votes" radius={[8, 8, 0, 0]} barSize={60} animationDuration={1000}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Simple Card Component
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:scale-105">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

export default Dashboard;