
import React from 'react';

const FeaturedSection = () => {
  return (
    <section className="featured-section">
      <div className="container">
        <p>AS FEATURED IN</p>
        <div className="featured-logos">
          <img src="images/logo-foxnews.png" alt="Fox News Logo" />
          <img src="images/logo-uscca.png" alt="USCCA Logo" />
          <img src="images/logo-nra.png" alt="NRA Logo" />
          <img src="images/logo-tactical-life.png" alt="Tactical Life Magazine Logo" />
        </div>
        <div className="counter-container">
          <div className="counter-item">
            <div className="counter-value" data-target="5000">0</div>
            <div className="counter-label">TRAINED STUDENTS</div>
          </div>
          <div className="counter-item">
            <div className="counter-value" data-target="24">0</div>
            <div className="counter-label">TRAINING PROGRAMS</div>
          </div>
          <div className="counter-item">
            <div className="counter-value" data-target="65">0</div>
            <div className="counter-label">YEARS EXPERIENCE</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
