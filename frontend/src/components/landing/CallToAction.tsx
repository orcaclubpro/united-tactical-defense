import React from 'react';
import heroImage from '../../assets/images/hero.jpg';
import './CallToAction.scss';

const CallToAction: React.FC = () => {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="cta" className="cta-section" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="cta-overlay"></div>
      <div className="container">
        <div className="cta-content">
          <h2>Ready to Join Elite Tactical Training?</h2>
          <p>
            Take the first step towards tactical excellence. Join our community of professionals
            and enthusiasts committed to the highest standards of training and preparedness.
          </p>
          <div className="cta-buttons">
            <a href="#" className="btn btn-primary btn-lg" onClick={scrollToTop}>
              Take the Assessment
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 