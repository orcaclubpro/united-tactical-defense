import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OODASection.scss';

interface OODAStep {
  title: string;
  description: string;
}

const OODASection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, oodaSteps.length);
  }, [oodaSteps.length]);

  const handleScroll = useCallback(() => {
    if (!stepsContainerRef.current) return;

    const container = stepsContainerRef.current;
    const containerCenter = container.offsetWidth / 2;
    let closestStepIndex = -1;
    let minDistance = Infinity;

    stepRefs.current.forEach((stepEl, index) => {
      if (!stepEl) return;
      
      const stepRect = stepEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const stepCenterRelativeToContainer = (stepRect.left - containerRect.left) + (stepRect.width / 2);
      
      const distance = Math.abs(stepCenterRelativeToContainer - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestStepIndex = index;
      }
    });

    if (closestStepIndex !== -1 && activeStep !== closestStepIndex) {
      setActiveStep(closestStepIndex);
    }
  }, [activeStep]);

  useEffect(() => {
    const container = stepsContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout | null = null;
    const debouncedScrollHandler = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleScroll, 50);
    };

    container.addEventListener('scroll', debouncedScrollHandler, { passive: true });
    
    handleScroll();

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      container.removeEventListener('scroll', debouncedScrollHandler);
    };
  }, [handleScroll]);

  return (
    <section className="ooda-section">
      <div className="container">
        <div className="section-header">
          <h2>How to Throw Off the Threat's OODA Loop</h2>
          <p>Our tactical training helps you stay ahead of potential threats through rapid decision-making and action</p>
        </div>
        
        <div className="ooda-diagram">
          <div className="steps-outer-container">
            <div 
              className="steps-container" 
              ref={stepsContainerRef}
            >
              {oodaSteps.map((step, index) => (
                <div 
                  key={index}
                  ref={(el: HTMLDivElement | null) => { 
                    stepRefs.current[index] = el; 
                  }}
                  className={`step ${activeStep === index ? 'active' : ''}`}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-title">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="step-details">
            {activeStep !== null ? (
              <div className="details-content">
                <h3>{oodaSteps[activeStep].title}</h3>
                <p>{oodaSteps[activeStep].description}</p>
              </div>
            ) : (
              <div className="details-content placeholder">
                <p>Scroll to view step details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OODASection; 