// Fetches candidates based on home seat

import { useState, useEffect } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
}

export default function DynamicBallot() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeSeat, setHomeSeat] = useState<string>('');

  useEffect(() => {
    // TODO: Fetch candidates based on home seat
    fetchCandidates();
  }, [homeSeat]);

  const fetchCandidates = async () => {
    // TODO: API call to fetch candidates
    setLoading(false);
  };

  const handleVote = (candidateId: string) => {
    // TODO: Handle vote selection
  };

  if (loading) {
    return <div>Loading candidates...</div>;
  }

  return (
    <div className="dynamic-ballot">
      <h2>Candidates for {homeSeat}</h2>
      <div className="candidates-list">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="candidate-card">
            <h3>{candidate.name}</h3>
            <p>{candidate.party}</p>
            <button onClick={() => handleVote(candidate.id)}>Vote</button>
          </div>
        ))}
      </div>
    </div>
  );
}


