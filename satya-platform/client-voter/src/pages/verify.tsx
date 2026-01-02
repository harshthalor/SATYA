// The "SATYA" check-in page

import { useState } from 'react';
import { useRouter } from 'next/router';
import BiometricScanner from '../components/BiometricScanner';

export default function Verify() {
  const router = useRouter();
  const [step, setStep] = useState<'aadhaar' | 'biometric'>('aadhaar');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleAadhaarSubmit = async () => {
    // TODO: Verify Aadhaar number
    setStep('biometric');
  };

  const handleBiometricVerify = async () => {
    // TODO: Verify biometric
    setIsVerified(true);
    router.push('/vote');
  };

  return (
    <div className="verify-page">
      <h1>SATYA Verification</h1>
      
      {step === 'aadhaar' && (
        <div className="aadhaar-step">
          <label>
            Aadhaar Number:
            <input
              type="text"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              placeholder="Enter 12-digit Aadhaar number"
            />
          </label>
          <button onClick={handleAadhaarSubmit}>Verify Aadhaar</button>
        </div>
      )}

      {step === 'biometric' && (
        <div className="biometric-step">
          <h2>Face ID Verification</h2>
          <BiometricScanner />
          <button onClick={handleBiometricVerify} disabled={!isVerified}>
            Complete Verification
          </button>
        </div>
      )}
    </div>
  );
}


