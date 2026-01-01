// The actual voting booth

import { useState } from 'react';
import DynamicBallot from '../components/DynamicBallot';
import ReceiptHash from '../components/ReceiptHash';

export default function Vote() {
  const [hasVoted, setHasVoted] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleVoteSubmit = async () => {
    // TODO: Submit vote to blockchain
    const txId = '0x1234567890abcdef'; // Placeholder
    setTransactionId(txId);
    setHasVoted(true);
  };

  if (hasVoted && transactionId) {
    return (
      <div className="vote-complete">
        <h1>Vote Cast Successfully!</h1>
        <ReceiptHash transactionId={transactionId} />
      </div>
    );
  }

  return (
    <div className="voting-booth">
      <h1>Cast Your Vote</h1>
      <DynamicBallot />
      <button onClick={handleVoteSubmit} className="submit-vote-btn">
        Submit Vote
      </button>
    </div>
  );
}

