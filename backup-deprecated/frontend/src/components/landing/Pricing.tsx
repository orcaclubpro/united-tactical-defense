import React, { useState } from 'react';
import './Pricing.scss';

interface Feature {
  text: string;
  included: boolean;
}

interface Package {
  id: number;
  title: string;
  description: string;
  commitment: string;
  features: Feature[];
}

const packageData: Package[] = [
  {
    id: 1,
    title: "Tactical Essentials",
    description: "Perfect for beginners looking to build fundamental defensive skills and awareness",
    commitment: "12 month commitment",
    features: [
      { text: "Monthly foundational training sessions", included: true },
      { text: "Basic simulator training", included: true },
      { text: "Defensive fundamentals course", included: true },
      { text: "Online training resources", included: true },
      { text: "Quarterly skills assessment", included: true },
      { text: "Advanced techniques workshops", included: false },
      { text: "Scenario-based training", included: false }
    ]
  },
  {
    id: 2,
    title: "Tactical Advanced",
    description: "Our most popular package for those serious about comprehensive defense training",
    commitment: "12 month commitment",
    features: [
      { text: "Bi-weekly training sessions", included: true },
      { text: "Advanced simulator scenarios", included: true },
      { text: "Defensive fundamentals course", included: true },
      { text: "Online training resources", included: true },
      { text: "Monthly skills assessment", included: true },
      { text: "Advanced techniques workshops", included: true },
      { text: "Scenario-based training", included: false }
    ]
  },
  {
    id: 3,
    title: "Elite Defender",
    description: "The ultimate training experience for those who demand the highest level of preparedness",
    commitment: "12 month commitment",
    features: [
      { text: "Weekly training sessions", included: true },
      { text: "Elite-level simulator training", included: true },
      { text: "Complete defensive curriculum", included: true },
      { text: "Premium online resources", included: true },
      { text: "Bi-weekly skills assessment", included: true },
      { text: "All advanced workshops included", included: true },
      { text: "Full scenario-based training", included: true }
    ]
  }
];

const Pricing: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<number>(1); // Default to middle package

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <header className="section-header">
          <h2>Training Packages</h2>
          <p>Find the right training path for your goals and commitment level</p>
        </header>
        
        <div className="pricing-container">
          {packageData.map(pkg => (
            <div 
              key={pkg.id} 
              className={`pricing-card ${pkg.id === selectedPackage ? 'highlight' : ''}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <div className="pricing-header">
                <h3 className="package-title">{pkg.title}</h3>
                <p className="package-description">{pkg.description}</p>
              </div>
              
              <div className="commitment">
                <span className="commitment-text">{pkg.commitment}</span>
              </div>
              
              <ul className="feature-list">
                {pkg.features.map((feature, index) => (
                  <li key={index} className={feature.included ? 'included' : 'not-included'}>
                    <span className="feature-icon">{feature.included ? '✓' : '×'}</span>
                    <span className="feature-text">{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <div className="card-footer">
                <a href="#free-class" className="btn btn-primary">Schedule Free Class</a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pricing-note">
          <p>All packages include access to our state-of-the-art training facility with expert instructors.</p>
          <p>Contact us for more detailed information about our training packages and scheduling.</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 