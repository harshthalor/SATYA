import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Vote, Users, Server, Activity } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState([
    { name: 'Arjun Mehta', votes: 120, color: '#3b82f6' },
    { name: 'Priya Sharma', votes: 98, color: '#f97316' },
    { name: 'David Wilson', votes: 45, color: '#22c55e' },
  ]);
  const [totalVotes, setTotalVotes] = useState(263);

  // ... inside Dashboard component

useEffect(() => {
  const fetchLiveStats = async () => {
    try {
      // 1. GET DATA FROM BACKEND (Port 8080)
      const res = await fetch('http://localhost:8080/api/v1/vote/stats');
      const realData = await res.json();

      // 2. Update State with REAL DB Data
      // Assuming backend returns: { candidates: [...], total: 150 }
      if (realData.candidates) {
        setData(realData.candidates);
        setTotalVotes(realData.total);
      }
    } catch (error) {
      console.log("Waiting for server connection...", error);
    }
  };

  // Initial fetch
  fetchLiveStats();

  // Poll every 2 seconds (Live Update Effect)
  const interval = setInterval(fetchLiveStats, 2000);
  return () => clearInterval(interval);
}, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-satya-blue">ELECTION COMMAND CENTER</h1>
        <p className="text-sm font-bold text-green-600 flex items-center gap-2 mt-2">
          <Activity size={16} /> LIVE BLOCKCHAIN FEED
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Vote />} label="Total Votes" value={totalVotes} color="bg-blue-600" />
        <StatCard icon={<Users />} label="Active Sessions" value="12" color="bg-orange-500" />
        <StatCard icon={<Server />} label="Blocks Mined" value="#892" color="bg-slate-700" />
      </div>

      {/* Main Chart */}
      {/* FIX: Added manual style={{ height: 400 }} so it works even if Tailwind fails */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" style={{ height: 450 }}>
        <h2 className="text-lg font-bold text-slate-700 mb-4">Real-Time Analytics</h2>
        
        {/* ResponsiveContainer needs a defined parent height to work */}
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none' }}
              />
              <Bar dataKey="votes" radius={[6, 6, 0, 0]} barSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase">{label}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

export default Dashboard;