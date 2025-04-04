import React from 'react';
import './TrustBadges.scss';

const TrustBadges: React.FC = () => {
  return (
    <section className="trust-badges">
      <div className="container">
        <ul className="badge-list">
          <li>
            <div className="badge-icon">
              <img src={`${process.env.PUBLIC_URL}/assets/images/icons/military.svg`} alt="Military" />
            </div>
            <div className="badge-text">
              <h4>Military Trained</h4>
              <p>Special Forces Instructors</p>
            </div>
          </li>
          <li>
            <div className="badge-icon">
              <img src={`${process.env.PUBLIC_URL}/assets/images/icons/simulation.svg`} alt="Simulation" />
            </div>
            <div className="badge-text">
              <h4>Reality-Based</h4>
              <p>Advanced Simulation Training</p>
            </div>
          </li>
          <li>
            <div className="badge-icon">
              <img src={`${process.env.PUBLIC_URL}/assets/images/icons/system.svg`} alt="System" />
            </div>
            <div className="badge-text">
              <h4>Progressive System</h4>
              <p>8-Level Training Path</p>
            </div>
          </li>
          <li>
            <div className="badge-icon">
              <img src={`${process.env.PUBLIC_URL}/assets/images/icons/defense.svg`} alt="Defense" />
            </div>
            <div className="badge-text">
              <h4>Combat Ready</h4>
              <p>Tactical Defense Training</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default TrustBadges; 