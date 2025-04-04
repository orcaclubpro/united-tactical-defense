import React from 'react';
import { Link } from 'react-scroll';
import GlobalFormTrigger from '../Form/GlobalTrigger';
import './CallToAction.scss';

const CallToAction: React.FC = () => {
  return (
    <section id="cta" className="cta-section">
      <div className="cta-background">
        <div className="cta-overlay"></div>
      </div>
      <div className="container">
        <div className="cta-content">
          <div className="cta-tag">Limited Time Offer</div>
          <h2>Start Your Tactical Training Journey With A <span className="highlight">FREE Class</span></h2>
          <p className="cta-description">
            Don't miss this opportunity to experience our world-class training firsthand. 
            Our free introductory session gives you a taste of our methodology and lets you
            meet our expert instructors with <strong>no obligation</strong>.
          </p>
          
          <div className="cta-value-props">
            <div className="value-prop">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11h1.5v5h-8.5v-5h1.5V9.5C9.3 8.1 10.6 7 12 7zm0 1.5c-.8 0-1.3.6-1.3 1.3V11h2.5V9.8c0-.7-.5-1.3-1.2-1.3z" />
                </svg>
              </div>
              <div className="value-content">
                <h3>Expert Instructors</h3>
                <p>Learn from former special forces operators with real-world experience.</p>
              </div>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
                </svg>
              </div>
              <div className="value-content">
                <h3>Personalized Approach</h3>
                <p>Training tailored to your skill level, goals, and experience.</p>
              </div>
            </div>
            
            <div className="value-prop">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <div className="value-content">
                <h3>Supportive Community</h3>
                <p>Join a network of like-minded individuals dedicated to tactical excellence.</p>
              </div>
            </div>
          </div>
          
          <div className="cta-testimonial">
            <div className="testimonial-content">
              <blockquote>
                "The free introductory class exceeded all my expectations. The instructors were professional, 
                the facility was state-of-the-art, and I learned more in one session than I had in months elsewhere."
              </blockquote>
              <cite>— Michael R., Active Member</cite>
            </div>
          </div>
          
          <div className="cta-countdown">
            <p className="countdown-text">Limited spots available this month</p>
            <div className="spots-container">
              <div className="spots-indicator">
                <div className="spots-filled" style={{ width: '85%' }}></div>
              </div>
              <p className="spots-text">85% Full</p>
            </div>
          </div>
          
          <div className="cta-buttons">
            <Link 
              to="free-class"
              smooth={true}
              duration={800}
              offset={-100}
              className="btn btn-primary btn-lg pulse-animation"
            >
              Claim Your Free Class Now
            </Link>
            <p className="no-obligation">No credit card required • No obligation to continue</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 