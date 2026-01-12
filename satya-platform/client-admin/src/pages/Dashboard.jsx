import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList // ✅ Kept this fix so cost labels appear
} from 'recharts';

// ✅ Reverted to your original local images
import heroImg from '../assets/hero.jpg';
import registerImg from '../assets/register.jpg';
import updateImg from '../assets/update.jpg';

import {
  UserPlus,
  MapPin,
  FileText,
  Server,
  Lock,
  Boxes,
  Earth,
  TrendingUp,
  IndianRupee,
  ArrowRight
} from 'lucide-react';

// --- DATA FOR GRAPHS ---

// Source: Centre for Media Studies (CMS) & ECI
const expenditureData = [
  { year: '2014', cost: 30000, label: '₹30k' },
  { year: '2019', cost: 60000, label: '₹60k' },
  { year: '2024', cost: 135000, label: '₹1.35L' },
];

// Source: ECI Voter Turnout Data 2024 (Official: 65.79%)
const voterTurnoutData = [
  { name: 'Voted', value: 65.8, color: '#0ea5e9' }, // Sky-500
  { name: 'Missing/Unable', value: 34.2, color: '#e2e8f0' }, // Slate-200
];

const Dashboard = () => {
  return (
    <div className="w-full relative overflow-hidden">

      {/* --- SOFT BACKGROUND ACCENT --- */}
      <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-40 left-[-100px] w-[300px] h-[300px] bg-sky-200/40 rounded-full blur-3xl -z-10"></div>

      {/* ================= HERO SECTION ================= */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20 px-4 md:px-0">
        
        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold rounded-full uppercase tracking-widest shadow-sm">
            <Earth size={14} /> National Voter Infrastructure
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
            One Nation.<br />
            One Identity.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
            <span className="font-bold text-slate-800">SATYA</span> is a secure and transparent
            voter registry designed to protect election integrity while supporting citizen mobility.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="https://harshthalor.github.io/SATYA/ABOUT/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-700 transition flex items-center gap-2 shadow-lg shadow-sky-600/20"
            >
              <FileText size={18} /> Project Overview
            </a>

            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-sky-200 text-sm font-semibold text-slate-600 shadow-sm">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              System Active
            </div>
          </div>
        </div>

        {/* RIGHT – HERO IMAGE SPACE */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/10 border-4 border-white">
            <img 
              src={heroImg} 
              alt="Voting System Hero" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-24 px-4 md:px-0">
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition group">
          <Server className="text-sky-600 mb-3 h-8 w-8 group-hover:scale-110 transition-transform" />
          <p className="text-3xl font-bold text-slate-900">Secure</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Storage</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition group">
          <Lock className="text-sky-600 mb-3 h-8 w-8 group-hover:scale-110 transition-transform" />
          <p className="text-xl font-bold text-slate-900">AES-256</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Encryption Standard</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition group">
          <Server className="text-sky-600 mb-3 h-8 w-8 group-hover:scale-110 transition-transform" />
          <p className="text-xl font-bold text-slate-900">Apache Kafka</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Real-time Syncing</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition group">
          <Boxes className="text-sky-600 mb-3 h-8 w-8 group-hover:scale-110 transition-transform" />
          <p className="text-xl font-bold text-slate-900">Blockchain</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Immutable Records</p>
        </div>
      </div>

      {/* ================= IMPACT & EFFICIENCY (GRAPHS) ================= */}
      <div className="mb-24 px-4 md:px-0">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-widest shadow-sm mb-4">
             <IndianRupee size={14} /> The Cost of Democracy
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Why Digital Transformation is Urgent</h2>
          <p className="text-slate-600 mt-2">Rising costs and stagnating turnout require a structural shift.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* GRAPH 1: COST EXPLOSION */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Election Expenditure</h3>
            <p className="text-sm text-slate-500 mb-6">Cost of Indian General Elections (Est.)</p>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenditureData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                    {/* ✅ Correctly using LabelList to show values on top */}
                    <LabelList 
                        dataKey="label" 
                        position="top" 
                        fill="#64748b" 
                        fontSize={12} 
                        fontWeight="bold" 
                    />
                    {expenditureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#2563eb' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 mt-auto pt-4 border-t border-slate-100">
              Source: Centre for Media Studies (CMS) Report
            </p>
          </div>

          {/* GRAPH 2: VOTER TURNOUT (2024 Data) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-1">The 34% Gap</h3>
            <p className="text-sm text-slate-500 mb-6">2024 Voter Turnout Analysis</p>
            
            <div className="h-48 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={voterTurnoutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {voterTurnoutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800">65.8%</span>
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Turnout</span>
                </div>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> Voted
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-slate-200"></span> Missing
              </div>
            </div>
             <p className="text-[10px] text-slate-400 mt-auto pt-4 border-t border-slate-100">
              Source: Election Commission of India (ECI)
            </p>
          </div>

          {/* STAT CARD: SAVINGS */}
          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-100/50 flex flex-col">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Projected Savings</h3>
            <p className="text-sm text-slate-500 mb-6">With ONOE & Digital Infra</p>
            
            <div className="my-auto">
              <span className="text-4xl md:text-5xl font-extrabold text-emerald-500">
                ₹4,500 Cr
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
                Per Election Cycle
              </p>
            </div>

            <p className="text-[10px] text-emerald-800/60 mt-auto pt-4 border-t border-emerald-100">
              Source: Law Commission Draft Report
            </p>
          </div>

        </div>
      </div>

      {/* ================= ADMIN MODULES ================= */}
      <div className="pb-12 px-4 md:px-0">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Administrative Modules</h2>
          <div className="w-12 h-1 bg-sky-500 mx-auto rounded-full mb-3"></div>
          <p className="text-slate-600">
            Select an operation to manage the SATYA registry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* MODULE 1: REGISTRATION */}
          <Link
            to="/register"
            className="group bg-white p-8 rounded-3xl border border-sky-100 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-200/40 transition duration-300"
          >
            <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden shadow-sm border border-slate-200 group-hover:shadow-md transition-all">
               <img 
                 src={registerImg} 
                 alt="Registration Preview" 
                 className="w-full h-full object-cover" 
               />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4 text-sky-600">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition">
                  Voter Registration
                </h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  Register new citizens and generate secure digital voter identities.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 font-bold text-sm text-sky-600 group-hover:translate-x-1 transition-transform">
              Tap to register <ArrowRight size={16} />
            </span>
          </Link>

          {/* MODULE 2: UPDATE */}
          <Link
            to="/update"
            className="group bg-white p-8 rounded-3xl border border-sky-100 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-200/40 transition duration-300"
          >
            <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden shadow-sm border border-slate-200 group-hover:shadow-md transition-all">
               <img 
                 src={updateImg} 
                 alt="Update Preview" 
                 className="w-full h-full object-cover" 
               />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4 text-sky-600">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition">
                  Constituency Update
                </h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  Transfer voter records securely across constituencies using face auth.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 font-bold text-sm text-sky-600 group-hover:translate-x-1 transition-transform">
              Tap to update <ArrowRight size={16} />
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;