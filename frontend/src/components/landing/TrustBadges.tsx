import React from 'react';
import './TrustBadges.scss';

const TrustBadges: React.FC = () => {
  return (
    <section className="trust-badges">
      <div className="container">
        <ul className="badge-list">
          <li>
            <div className="badge-icon">✓</div>
            <div className="badge-text">Elite Military Instructors</div>
          </li>
          <li>
            <div className="badge-icon">✓</div>
            <div className="badge-text">Reality-Based Simulation</div>
          </li>
          <li>
            <div className="badge-icon">✓</div>
            <div className="badge-text">3000+ Trained Students</div>
          </li>
          <li>
            <div className="badge-icon">✓</div>
            <div className="badge-text">Hand-to-hand Self Defenses</div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default TrustBadges;