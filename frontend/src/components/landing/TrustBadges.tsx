import React from 'react';
import './TrustBadges.scss';

const TrustBadges: React.FC = () => {
  return (
    <section className="trust-badges">
      <div className="container">
        <ul className="badge-list">
          <li>
            <div className="badge-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="badge-text">
              <h4>Military Trained</h4>
              <p>Expert instructors with military experience</p>
            </div>
          </li>
          <li>
            <div className="badge-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16V12" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className="badge-text">
              <h4>Reality-Based</h4>
              <p>Training for real-world scenarios</p>
            </div>
          </li>
          <li>
            <div className="badge-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </div>
            <div className="badge-text">
              <h4>Progressive System</h4>
              <p>Structured learning path for all skill levels</p>
            </div>
          </li>
          <li>
            <div className="badge-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="badge-text">
              <h4>Combat Ready</h4>
              <p>Prepare for high-stress situations</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default TrustBadges; 