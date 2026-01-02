// Landing page

import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-page">
      <h1>SATYA Platform</h1>
      <p>Secure Authentication & Transparent Yield Architecture</p>
      <p>One Identity, Zero Friction, Total Mobility.</p>
      
      <div className="cta-buttons">
        <Link href="/verify">
          <button className="primary-btn">Start Voting</button>
        </Link>
      </div>
    </div>
  );
}


