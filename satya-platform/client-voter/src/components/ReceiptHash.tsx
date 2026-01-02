// Shows the Blockchain Transaction ID

interface ReceiptHashProps {
  transactionId: string;
  timestamp?: string;
}

export default function ReceiptHash({ transactionId, timestamp }: ReceiptHashProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(transactionId);
    // TODO: Show toast notification
  };

  return (
    <div className="receipt-hash">
      <h3>Vote Receipt</h3>
      <div className="transaction-info">
        <p className="label">Transaction ID:</p>
        <div className="hash-display">
          <code className="hash-value">{transactionId}</code>
          <button onClick={copyToClipboard} className="copy-btn">
            Copy
          </button>
        </div>
        {timestamp && (
          <p className="timestamp">Timestamp: {timestamp}</p>
        )}
      </div>
      <p className="note">
        Save this transaction ID to verify your vote on the blockchain.
      </p>
    </div>
  );
}


