import React, { useState } from 'react';
import './OODASection.scss';

interface OODAStep {
  title: string;
  description: string;
}

const OODASection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const oodaSteps: OODAStep[] = [
    {
      title: 'Assessment',
      description: 'Quickly evaluate the threat level and situation. Identify potential escape routes and cover options.'
    },
    {
      title: 'Draw',
      description: 'Smoothly and efficiently access your defensive tools while maintaining situational awareness.'
    },
    {
      title: 'Move',
      description: 'Create distance and find cover while maintaining a defensive posture. Movement is life.'
    },
    {
      title: 'Communicate',
      description: 'Use clear verbal commands to attempt de-escalation while maintaining defensive positioning.'
    },
    {
      title: 'De-escalate',
      description: 'Continue verbal commands and body language to attempt peaceful resolution if possible.'
    },
    {
      title: 'If They Reach',
      description: 'Be prepared to defend yourself if the threat continues to advance despite de-escalation attempts.'
    },
    {
      title: 'Shoot',
      description: 'As a last resort, use necessary force to stop the threat and protect yourself or others.'
    }
  ];

  return (
    <section className="ooda-section">
      <div className="container">
        <div className="section-header">
          <h2>How to Throw Off the Threat's OODA Loop</h2>
          <p>Our tactical training helps you stay ahead of potential threats through rapid decision-making and action</p>
        </div>
        
        <div className="ooda-diagram">
          <div className="steps-container">
            {oodaSteps.map((step, index) => (
              <div 
                key={index}
                className={`step ${activeStep === index ? 'active' : ''}`}
                onClick={() => setActiveStep(activeStep === index ? null : index)}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-title">{step.title}</div>
                {index < oodaSteps.length - 1 && <div className="connector" />}
              </div>
            ))}
          </div>
          
          <div className="step-details">
            {activeStep !== null && (
              <div className="details-content">
                <h3>{oodaSteps[activeStep].title}</h3>
                <p>{oodaSteps[activeStep].description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OODASection; 