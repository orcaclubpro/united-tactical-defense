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
                <path d="M9 12l2 2 4-4" />
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
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                <path d="M12 2v20" />
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
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