import React, { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import './OODASection.scss';

interface OODAStep {
  title: string;
  description: string;
}

const OODASection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Initialize first step as active and scroll into view
  useEffect(() => {
    const initializeFirstStep = () => {
      if (stepRefs.current[0] && stepsContainerRef.current) {
        const container = stepsContainerRef.current;
        const stepEl = stepRefs.current[0];
        
        const stepRect = stepEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const scrollLeft = container.scrollLeft + (stepRect.left - containerRect.left) - (container.offsetWidth / 2) + (stepRect.width / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
        
        // Force the first step to be active
        setActiveStep(0);
        setInitialized(true);
      }
    };

    // Add a delay to ensure refs are set properly before initializing
    const timer = setTimeout(initializeFirstStep, 300);
    return () => clearTimeout(timer);
  }, []);

  // Re-apply active state on resize in case of mobile/desktop switch
  useEffect(() => {
    const handleResize = () => {
      if (initialized) {
        // Force a re-render to apply active styles after a slight delay
        setActiveStep(prev => prev);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialized]);

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

  const scrollToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= oodaSteps.length || !stepsContainerRef.current || !stepRefs.current[stepIndex]) return;
    
    const container = stepsContainerRef.current;
    const stepEl = stepRefs.current[stepIndex];
    
    if (stepEl) {
      const stepRect = stepEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const scrollLeft = container.scrollLeft + (stepRect.left - containerRect.left) - (container.offsetWidth / 2) + (stepRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
      
      setActiveStep(stepIndex);
    }
  }, [oodaSteps.length]);

  const goToNextStep = useCallback(() => {
    if (activeStep < oodaSteps.length - 1) {
      scrollToStep(activeStep + 1);
    }
  }, [activeStep, oodaSteps.length, scrollToStep]);

  const goToPrevStep = useCallback(() => {
    if (activeStep > 0) {
      scrollToStep(activeStep - 1);
    }
  }, [activeStep, scrollToStep]);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;
    
    // If horizontal swipe is significant (more than 50px)
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe right - go to previous step
        goToPrevStep();
      } else {
        // Swipe left - go to next step
        goToNextStep();
      }
    }
    
    setTouchStartX(null);
  };

  // Initial scroll to active step
  useEffect(() => {
    scrollToStep(activeStep);
  }, [scrollToStep, activeStep]);

  return (
    <section className="ooda-section">
      <div className="container">
        <div className="section-header">
          <h2>How to Throw Off the Threat's OODA Loop</h2>
          <p>Our tactical training helps you stay ahead of potential threats through rapid decision-making and action</p>
        </div>
        
        <div className="ooda-diagram">
          <div className="steps-navigation">
            <button 
              className={`nav-button prev ${activeStep === 0 ? 'disabled' : ''}`}
              onClick={goToPrevStep}
              disabled={activeStep === 0}
              aria-label="Previous step"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            
            <div className="steps-outer-container">
              <div 
                className="steps-container" 
                ref={stepsContainerRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {oodaSteps.map((step, index) => (
                  <div 
                    key={index}
                    ref={(el: HTMLDivElement | null) => { 
                      stepRefs.current[index] = el; 
                    }}
                    className={`step ${activeStep === index ? 'active' : ''}`}
                    onClick={() => scrollToStep(index)}
                  >
                    <div className="step-number">{index + 1}</div>
                    <div className="step-title">{step.title}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className={`nav-button next ${activeStep === oodaSteps.length - 1 ? 'disabled' : ''}`}
              onClick={goToNextStep}
              disabled={activeStep === oodaSteps.length - 1}
              aria-label="Next step"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
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