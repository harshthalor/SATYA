// Webcam interface for Face ID

import { useState, useRef, useEffect } from 'react';

export default function BiometricScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Initialize webcam for face scanning
  }, []);

  const startScan = async () => {
    // TODO: Start biometric scanning
    setIsScanning(true);
  };

  const stopScan = () => {
    // TODO: Stop scanning
    setIsScanning(false);
  };

  return (
    <div className="biometric-scanner">
      <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={isScanning ? stopScan : startScan}>
        {isScanning ? 'Stop Scan' : 'Start Face ID'}
      </button>
    </div>
  );
}

