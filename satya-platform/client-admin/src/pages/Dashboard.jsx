import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ArrowRight,
  UserPlus,
  MapPin,
  FileText,
  Server,
  CheckCircle2,
  Lock,
  Image as ImageIcon
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="w-full relative">

      {/* --- SOFT BACKGROUND ACCENT --- */}
      <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-40 left-[-100px] w-[300px] h-[300px] bg-sky-200/40 rounded-full blur-3xl -z-10"></div>

      {/* ================= HERO SECTION ================= */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">

        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold rounded-full uppercase tracking-widest shadow-sm">
            <Globe size={14} /> National Voter Infrastructure
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
            {/* Both lines now match the primary text color */}
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
          {/* 👇 REPLACE THIS DIV WITH YOUR HERO IMAGE 👇 */}
          <div className="w-full max-w-md aspect-[4/3] bg-white border-2 border-dashed border-sky-200 rounded-3xl flex flex-col items-center justify-center text-sky-300">
            <ImageIcon size={48} className="mb-2 opacity-50" />
            <span className="font-semibold text-sky-400">HERO IMAGE HERE</span>
            <span className="text-xs text-sky-300">(Your Project Illustration)</span>
          </div>
          {/* 👆 END PLACEHOLDER 👆 */}
        </div>
      </div>

      {/* ================= STATS SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition">
          <Server className="text-sky-600 mb-3 h-8 w-8" />
          <p className="text-3xl font-bold text-slate-900">Secure</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Database Storage
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm hover:border-sky-300 transition">
          <Lock className="text-sky-600 mb-3 h-8 w-8" />
          <p className="text-xl font-bold text-slate-900">AES-256</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Encryption Standard
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center justify-between hover:border-sky-300 transition">
          <div>
            <p className="font-bold text-slate-900 text-lg">Blockchain Ledger</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
              Consensus Verified
            </p>
          </div>
          <CheckCircle2 className="text-emerald-500 h-10 w-10" />
        </div>

      </div>

      {/* ================= ADMIN MODULES ================= */}
      <div className="pb-12">
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
            {/* 👇 IMAGE PLACEHOLDER 👇 */}
            <div className="w-full h-48 bg-sky-50 border-2 border-dashed border-sky-200 rounded-2xl mb-6 flex flex-col items-center justify-center text-sky-300 group-hover:bg-sky-100/50 transition">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span className="text-xs font-bold text-sky-400">REGISTRATION IMAGE</span>
            </div>
            {/* 👆 END PLACEHOLDER 👆 */}

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
              Open Module <ArrowRight size={16} />
            </span>
          </Link>

          {/* MODULE 2: UPDATE */}
          <Link
            to="/update"
            className="group bg-white p-8 rounded-3xl border border-sky-100 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-200/40 transition duration-300"
          >
             {/* 👇 IMAGE PLACEHOLDER 👇 */}
             <div className="w-full h-48 bg-sky-50 border-2 border-dashed border-sky-200 rounded-2xl mb-6 flex flex-col items-center justify-center text-sky-300 group-hover:bg-sky-100/50 transition">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span className="text-xs font-bold text-sky-400">UPDATE IMAGE</span>
            </div>
            {/* 👆 END PLACEHOLDER 👆 */}

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
              Open Module <ArrowRight size={16} />
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;