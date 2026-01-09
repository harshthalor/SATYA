import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  ShieldCheck, 
  ArrowRight,
  UserPlus,
  MapPin,
  FileText, // Icon for Whitepaper
  Server,
  Cpu
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 animate-in fade-in duration-700">
      
      {/* --- HERO SECTION (Kept as previous) --- */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-widest">
              <Globe size={12} /> National Voter Registry
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              One Nation.<br/>
              <span className="text-blue-600">
                One Identity.
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
              Welcome to the SATYA Admin Node. This portal provides authorized access to the distributed ledger for voter onboarding, constituency migration, and real-time election monitoring.
            </p>

            <div className="flex gap-4 pt-4">
              <Link to="/register" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                Begin Onboarding <ArrowRight size={16} />
              </Link>
              <div className="flex items-center gap-3 px-4">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Node Active<br/>v2.4.0-stable
                 </div>
              </div>
            </div>
          </div>

          {/* Visual: Admin Control Hub */}
          <div className="flex-1 flex justify-center relative">
             <div className="w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl absolute -z-0 opacity-60"></div>
             
             <div className="relative z-10 grid grid-cols-2 gap-4 max-w-sm">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-4">
                   <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <Cpu size={20} />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-slate-900">12ms</p>
                      <p className="text-xs font-bold text-slate-400 uppercase">Latency</p>
                   </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col gap-4 text-white">
                   <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-emerald-400">
                      <ShieldCheck size={20} />
                   </div>
                   <div>
                      <p className="text-2xl font-black">AES-256</p>
                      <p className="text-xs font-bold text-slate-500 uppercase">Encryption</p>
                   </div>
                </div>

                <div className="col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="font-bold text-slate-700">Hyperledger Fabric Consensus</span>
                    </div>
                    <Server size={18} className="text-slate-400" />
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* --- ADMIN MODULES SECTION --- */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-end justify-between mb-10">
            <div>
                <h2 className="text-3xl font-black text-slate-900">Platform Modules</h2>
                <p className="text-slate-500 font-medium mt-1">Select an administrative function to proceed.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Registration */}
            <Link to="/register" className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    <UserPlus size={28} className="text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Voter Registration</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Onboard new citizens using biometric facial verification and generate their unique blockchain identity.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:underline">
                    Access Module <ArrowRight size={12} />
                </div>
            </Link>

            {/* Card 2: Migration */}
            <Link to="/update" className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                    <MapPin size={28} className="text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Constituency Migration</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Update a voter's constituency in real-time. Smart contracts handle the transfer of voting rights instantly.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest group-hover:underline">
                    Access Module <ArrowRight size={12} />
                </div>
            </Link>

            {/* Card 3: Whitepaper (Replaces Live Ledger) */}
            <a href="#" className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors">
                    <FileText size={28} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Read Whitepaper</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Access the complete technical documentation, architecture diagrams, and security protocols of SATYA.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:underline">
                    View PDF <ArrowRight size={12} />
                </div>
            </a>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;