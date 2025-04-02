import React, { useState } from 'react';
import './Pricing.scss';

interface PricingPlan {
  id: number;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  popular: boolean;
  commitment: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: "Basic Training",
    price: 149,
    interval: "month",
    description: "Essential training for those beginning their self-defense journey",
    features: [
      "2 classes per week",
      "Basic equipment provided",
      "Online learning portal access",
      "Fundamentals curriculum",
      "Safety certification included"
    ],
    popular: false,
    commitment: "No contract, cancel anytime"
  },
  {
    id: 2,
    name: "Tactical Defender",
    price: 249,
    interval: "month",
    description: "Our most popular program for comprehensive defensive training",
    features: [
      "3 classes per week",
      "Full equipment provided",
      "Online learning portal access",
      "Advanced defensive techniques",
      "Monthly live-fire sessions",
      "Scenario-based training",
      "Quarterly skills assessment"
    ],
    popular: true,
    commitment: "3-month minimum commitment"
  },
  {
    id: 3,
    name: "Elite Protector",
    price: 399,
    interval: "month",
    description: "Advanced training for those seeking mastery of tactical skills",
    features: [
      "Unlimited classes",
      "Premium equipment provided",
      "Priority scheduling",
      "One-on-one instructor time",
      "Advanced scenario training",
      "Force-on-force sessions",
      "Tactical team exercises",
      "Specialized workshops included"
    ],
    popular: false,
    commitment: "6-month minimum commitment"
  }
];

interface PricingOption {
  id: string;
  label: string;
  discount?: number;
}

const billingOptions: PricingOption[] = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly", discount: 10 },
  { id: "annual", label: "Annual", discount: 20 }
];

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<string>("monthly");
  
  const calculatePrice = (basePrice: number, billingType: string): number => {
    const option = billingOptions.find(opt => opt.id === billingType);
    if (option && option.discount) {
      return Math.round(basePrice * (1 - option.discount / 100));
    }
    return basePrice;
  };
  
  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <header className="section-header">
          <h2>Training Packages</h2>
          <p>Choose the plan that fits your training goals and commitment level</p>
        </header>
        
        <div className="billing-toggle">
          <span>Select billing cycle:</span>
          <div className="toggle-options">
            {billingOptions.map(option => (
              <button
                key={option.id}
                className={`toggle-option ${billingCycle === option.id ? 'active' : ''}`}
                onClick={() => setBillingCycle(option.id)}
              >
                {option.label}
                {option.discount && <span className="discount-badge">Save {option.discount}%</span>}
              </button>
            ))}
          </div>
        </div>
        
        <div className="pricing-cards">
          {pricingPlans.map(plan => (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="card-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-pricing">
                  <span className="currency">$</span>
                  <span className="price">{calculatePrice(plan.price, billingCycle)}</span>
                  <span className="interval">/{plan.interval}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>
              
              <div className="card-body">
                <ul className="feature-list">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="card-footer">
                <p className="commitment">{plan.commitment}</p>
                <a href="#free-class" className="btn btn-secondary">Start With Free Class</a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pricing-note">
          <p>All plans include access to training facilities, certified instructors, and basic equipment</p>
          <p>Custom corporate and group training packages also available <a href="#contact">Contact us</a> for details</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 