import React from 'react';
import './TrustBadges.scss';

const TrustBadges: React.FC = () => {
  return (
    <section className="trust-badges">
      <div className="container">
        <ul className="badge-list">
          <li>
            <div className="badge-text">
              <h4>Military Trained</h4>
            </div>
          </li>
          <li>
            <div className="badge-text">
              <h4>Reality-Based</h4>
            </div>
          </li>
          <li>
            <div className="badge-text">
              <h4>Progressive System</h4>
            </div>
          </li>
          <li>
            <div className="badge-text">
              <h4>Combat Ready</h4>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default TrustBadges; 