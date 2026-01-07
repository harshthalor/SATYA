import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus } from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import VoterOnboarding from './pages/VoterOnboarding';
import UpdateConstituency from './pages/UpdateConstituency'

// Simple Navbar Component
const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "bg-blue-700" : "hover:bg-blue-800";

  return (
    <nav className="bg-satya-blue text-white p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
        <span className="font-bold text-xl tracking-tight">SATYA ADMIN</span>
      </div>
      <div className="flex gap-4">
        <Link to="/" className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive('/')}`}>
          <LayoutDashboard size={18} /> Live Dashboard
        </Link>
        <Link to="/register" className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive('/register')}`}>
          <UserPlus size={18} /> Register Voter
        </Link>
        <Link to="/update" className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isActive('/update')}`}>
          <UserPlus size={18} /> Update Constituency
        </Link>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<VoterOnboarding />} />
          <Route path="/update" element={<UpdateConstituency />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;