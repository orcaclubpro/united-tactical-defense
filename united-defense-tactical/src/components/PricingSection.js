
import React, { useState } from 'react';

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const togglePricing = () => {
    setIsYearly(!isYearly);
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <header className="section-header">
          <h2>Training Packages</h2>
          <p>Flexible options to fit your goals and schedule</p>
        </header>
        
        <div className="price-toggle">
          <span>Monthly</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              id="pricing-toggle"
              checked={isYearly}
              onChange={togglePricing}
            />
            <span className="toggle-slider"></span>
          </label>
          <span>Annual (Save 20%)</span>
        </div>
        
        <div className="pricing-plans">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Basic Defense</h3>
              <div className="price-monthly" style={{display: isYearly ? 'none' : 'block'}}>
                <span className="pricing-price">$149</span>
                <span className="pricing-period">/month</span>
              </div>
              <div className="price-yearly" style={{display: isYearly ? 'block' : 'none'}}>
                <span className="pricing-original">$1,788</span>
                <span className="pricing-price">$1,430</span>
                <span className="pricing-period">/year</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>2 Training Sessions Per Week</li>
              <li>Fundamentals & Defensive Skills</li>
              <li>Basic Equipment Provided</li>
              <li>Online Learning Resources</li>
              <li>Monthly Skill Assessment</li>
            </ul>
            <a href="#free-class" className="btn btn-secondary btn-full">CLAIM FREE CLASS</a>
          </div>
          
          <div className="pricing-card featured">
            <div className="featured-badge">Most Popular</div>
            <div className="pricing-header">
              <h3 className="pricing-title">Tactical Defender</h3>
              <div className="price-monthly" style={{display: isYearly ? 'none' : 'block'}}>
                <span className="pricing-price">$249</span>
                <span className="pricing-period">/month</span>
              </div>
              <div className="price-yearly" style={{display: isYearly ? 'block' : 'none'}}>
                <span className="pricing-original">$2,988</span>
                <span className="pricing-price">$2,390</span>
                <span className="pricing-period">/year</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>Unlimited Training Sessions</li>
              <li>All Basic Defense Features</li>
              <li>Advanced Scenario Training</li>
              <li>Simulation Range Access</li>
              <li>Quarterly Private Lessons</li>
              <li>Equipment Discounts</li>
            </ul>
            <a href="#free-class" className="btn btn-primary btn-full">CLAIM FREE CLASS</a>
          </div>
          
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Elite Operator</h3>
              <div className="price-monthly" style={{display: isYearly ? 'none' : 'block'}}>
                <span className="pricing-price">$399</span>
                <span className="pricing-period">/month</span>
              </div>
              <div className="price-yearly" style={{display: isYearly ? 'block' : 'none'}}>
                <span className="pricing-original">$4,788</span>
                <span className="pricing-price">$3,830</span>
                <span className="pricing-period">/year</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>All Tactical Defender Features</li>
              <li>VIP Priority Scheduling</li>
              <li>Monthly Private Lessons</li>
              <li>Elite Equipment Package</li>
              <li>Advanced Force-on-Force Training</li>
              <li>Exclusive Workshops & Events</li>
              <li>Personalized Training Plan</li>
            </ul>
            <a href="#free-class" className="btn btn-secondary btn-full">CLAIM FREE CLASS</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
