import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import VotingBooth from './pages/VotingBooth.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex justify-center">
        {/* Mobile-first constraints */}
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/vote" element={<VotingBooth />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;