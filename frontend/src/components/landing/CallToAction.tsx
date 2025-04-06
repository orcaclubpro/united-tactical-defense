import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/images/hero.jpg';
import './CallToAction.scss';

const CallToAction: React.FC = () => {
  const scrollToPrograms = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
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
            <a href="#assessment" className="btn btn-primary btn-lg">
              Take the Assessment
            </a>
            <a href="#programs" className="btn btn-outline btn-lg" onClick={scrollToPrograms}>
              Explore Programs
            </a>
          </div>
          <div className="cta-features">
            <div className="feature">
              <i className="fas fa-medal"></i>
              <span>Expert Instructors</span>
            </div>
            <div className="feature">
              <i className="fas fa-shield-alt"></i>
              <span>Industry-Leading Techniques</span>
            </div>
            <div className="feature">
              <i className="fas fa-users"></i>
              <span>Supportive Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 