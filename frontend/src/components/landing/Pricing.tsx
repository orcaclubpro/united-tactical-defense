import React from 'react';
import './TrainingPackages.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faAward, faStar, faFire } from '@fortawesome/free-solid-svg-icons';

interface TrainingPackage {
  id: number;
  name: string;
  perMonth: string;
  perYear: string;
  features: string[];
  popular: boolean;
  icon: any;
}

const trainingPackages: TrainingPackage[] = [
  {
    id: 1,
    name: "BASE+",
    perMonth: "2 trainings per month",
    perYear: "26 per year",
    features: [
      "2 simulator trainings per month",
      "2 self-defense classes per month",
      "2 seminar/workshop per month",
      "4 combat conditioning per month",
      "4 UDT range experiences per year"
    ],
    popular: false,
    icon: faAward
  },
  {
    id: 2,
    name: "CORE",
    perMonth: "4 trainings per month",
    perYear: "52 per year",
    features: [
      "4 simulator trainings per month",
      "Unlimited self-defense per month",
      "Unlimited seminars/workshops per month",
      "Unlimited combat conditioning",
      "6 UDT range experiences per year"
    ],
    popular: true,
    icon: faStar
  },
  {
    id: 3,
    name: "CORE+",
    perMonth: "6 trainings per month",
    perYear: "78 per year",
    features: [
      "6 simulator trainings per month",
      "Unlimited self-defense classes",
      "Unlimited seminars/workshops",
      "Unlimited combat conditioning",
      "10 UDT range experiences per year"
    ],
    popular: false,
    icon: faFire
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="training-packages" className="training-packages-section">
      <div className="container">
        <header className="section-header">
          <h2>Membership Plans</h2>
          <p>Elevate your tactical defense skills with our premium training programs</p>
        </header>
        
        <div className="package-cards">
          {trainingPackages.map(pkg => (
            <div 
              key={pkg.id} 
              className={`package-card ${pkg.popular ? 'popular' : ''}`}
            >
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="card-header">
                <div className="icon-container">
                  <FontAwesomeIcon icon={pkg.icon} className="package-icon" />
                </div>
                <h3 className="package-name">{pkg.name}</h3>
              </div>
              
              <div className="training-quantity">
                <div className="training-quantity-value">{pkg.perMonth}</div>
                <div className="training-quantity-caption">{pkg.perYear}</div>
              </div>
              
              <div className="card-body">
                <ul className="feature-list">
                  {pkg.features.map((feature, index) => (
                    <li key={index}>
                      <FontAwesomeIcon icon={faCheck} className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="card-footer">
                <a href="#assessment" className="btn btn-primary">Claim free class</a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="packages-note">
          <p>All plans include access to our state-of-the-art training facilities and certified instructors</p>
          <p>Start with a free assessment and our experts will help you choose the right program for your needs</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 