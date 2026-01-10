import React from 'react';
import logo from "./assets/logo.png";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from 'react-router-dom';
import { Home, UserPlus, MapPin, Box } from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import VoterOnboarding from './pages/VoterOnboarding';
import UpdateConstituency from './pages/UpdateConstituency';

// ---------------- NAVBAR ----------------

const Navbar = () => {
  const location = useLocation();

  const navItem = (path) => {
    const base =
      "px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all";
    return location.pathname === path
      ? `${base} bg-white text-slate-900 shadow-sm ring-1 ring-sky-200`
      : `${base} text-slate-700 hover:bg-white/70 hover:text-sky-600`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-sky-200/90 backdrop-blur border-b border-sky-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Brand Section */}
        <div className="flex items-center gap-4"> {/* Gap-4 gives space between logo and text */}
          
          
          

          <div className="w-10 h-10 flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-18 h-18" />
          </div>

          {/* 👆 END LOGO SLOT 👆 */}

          <span className="text-lg font-bold text-slate-900 tracking-tight">
           SATYA ADMIN
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Link to="/" className={navItem('/')}>
            <Home size={16} /> Home
          </Link>

          <Link to="/register" className={navItem('/register')}>
            <UserPlus size={16} /> Register
          </Link>

          <Link to="/update" className={navItem('/update')}>
            <MapPin size={16} /> Update
          </Link>
        </div>

      </div>
    </nav>
  );
};

// ---------------- FOOTER ----------------

const Footer = () => (
  <footer className="w-full py-8 text-center bg-white border-t border-slate-200 mt-auto">
    <p className="text-slate-500 font-medium text-sm">
      &copy; 2026 SATYA <span className="mx-2 text-slate-300">|</span> DevLofars
    </p>
  </footer>
);

// ---------------- APP ----------------

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F3F6EC] flex flex-col font-sans">
        <Navbar />

        {/* Offset for fixed navbar */}
        <main className="flex-grow pt-28 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<VoterOnboarding />} />
            <Route path="/update" element={<UpdateConstituency />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;