import React, { useState, useEffect } from 'react';
import { submitAssessmentForm } from '../../services/api';
import './AssessmentForm.scss';

interface FormData {
  experience: string;
  goal: string;
  interests: string[];
  frequency: string;
  name: string;
  email: string;
  phone: string;
}

interface Recommendation {
  programName: string;
  description: string;
  features: string[];
  price: string;
}

const AssessmentForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    experience: '',
    goal: '',
    interests: [],
    frequency: '',
    name: 'Anonymous User',
    email: '',
    phone: ''
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const totalSteps = 4;

  // Update progress bar when step changes
  useEffect(() => {
    updateProgressBar();
  }, [currentStep]);

  const updateProgressBar = () => {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const progressIndicator = document.querySelector('.progress-indicator') as HTMLElement;
    if (progressIndicator) {
      progressIndicator.style.width = `${progress}%`;
    }

    // Update step indicators
    document.querySelectorAll('.step').forEach(step => {
      const stepNumber = parseInt(step.getAttribute('data-step') || '0');
      step.classList.remove('active', 'completed');

      if (stepNumber === currentStep) {
        step.classList.add('active');
      } else if (stepNumber < currentStep) {
        step.classList.add('completed');
      }
    });
  };

  const handleOptionClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    const label = e.currentTarget;
    const input = label.querySelector('input');
    
    if (!input) return;

    if (input.type === 'radio') {
      // Unselect other options in the same group
      const name = input.name;
      document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
        (radio as HTMLInputElement).checked = false;
        radio.closest('.answer-option')?.classList.remove('selected');
      });
      
      // Select this option
      input.checked = true;
      label.classList.add('selected');
      
      // Update form data
      setFormData({
        ...formData,
        [name]: input.value
      });
    } else if (input.type === 'checkbox') {
      // Toggle checkbox
      input.checked = !input.checked;
      label.classList.toggle('selected', input.checked);
      
      // Update form data (interests array)
      if (input.checked) {
        setFormData({
          ...formData,
          interests: [...formData.interests, input.value]
        });
      } else {
        setFormData({
          ...formData,
          interests: formData.interests.filter(item => item !== input.value)
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return !!formData.experience;
      case 2:
        return !!formData.goal;
      case 3:
        return formData.interests.length > 0;
      case 4:
        return !!formData.frequency;
      default:
        return true;
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      alert('Please complete this step before continuing.');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      // Submit directly after the last question
      submitAssessment();
    }
  };

  const generateRecommendation = (data: FormData): Recommendation => {
    // This is a simplified version of the recommendation logic
    let programName = 'Tactical Defense Program';
    let description = 'A comprehensive training program tailored to your needs.';
    let features = ['Personalized training schedule', 'Expert instructor guidance'];
    let price = '$249/month';

    // Adjust recommendation based on experience
    if (data.experience === 'none' || data.experience === 'limited') {
      programName = 'Fundamentals Training Program';
      features.push('Safety and handling basics');
      features.push('Confidence-building exercises');
    } else if (data.experience === 'experienced') {
      programName = 'Advanced Tactical Program';
      features.push('Complex scenario training');
      features.push('Force-on-force exercises');
      price = '$399/month';
    }

    // Adjust based on goal
    if (data.goal === 'home-defense') {
      programName += ' - Home Defense Focus';
      features.push('Home defense scenarios');
    } else if (data.goal === 'ccw') {
      programName += ' - CCW Preparation';
      features.push('Concealed carry tactics');
    }

    return {
      programName,
      description,
      features,
      price
    };
  };

  const submitAssessment = async () => {
    if (!validateCurrentStep()) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate recommendation
      const rec = generateRecommendation(formData);
      setRecommendation(rec);

      // Set showResults to true to display the results
      setShowResults(true);
      
      // Submit to backend with anonymized data if no contact info provided
      await submitAssessmentForm({
        ...formData,
        recommendedProgram: rec.programName
      });
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('There was an error processing your assessment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scheduleClass = () => {
    // Scroll to free class section
    const freeClassSection = document.getElementById('free-class');
    if (freeClassSection) {
      freeClassSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // You could also open the modal here if needed
    const openModalButton = document.getElementById('open-free-class-modal');
    if (openModalButton) {
      openModalButton.click();
    }
  };

  return (
    <section id="training-assessment" className="training-assessment">
      <div className="container">
        <header className="section-header">
          <div className="badge">TACTICAL READINESS ASSESSMENT</div>
          <h2>ARE YOU PREPARED?</h2>
          <p>Discover your tactical readiness level and get a personalized training recommendation</p>
        </header>

        <div className="assessment-container">
          {/* Assessment progress bar */}
          <div className="assessment-progress">
            <div className="progress-bar">
              <div className="progress-indicator" style={{ width: '0%' }}></div>
            </div>
            <div className="progress-steps">
              <span className="step active" data-step="1">1</span>
              <span className="step" data-step="2">2</span>
              <span className="step" data-step="3">3</span>
              <span className="step" data-step="4">4</span>
            </div>
          </div>

          {/* Assessment questions */}
          <div className="assessment-questions">
            {/* Step 1: Experience level */}
            <div className={`question-step ${currentStep === 1 ? 'active' : ''}`} data-step="1">
              <h3>What's your current experience level with firearms?</h3>
              <div className="answer-options">
                <label className={`answer-option ${formData.experience === 'none' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="experience" value="none" />
                  <div className="option-content">
                    <span className="option-title">Complete Beginner</span>
                    <span className="option-desc">I've never handled a firearm before</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.experience === 'limited' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="experience" value="limited" />
                  <div className="option-content">
                    <span className="option-title">Limited Experience</span>
                    <span className="option-desc">I've fired guns before but have little formal training</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.experience === 'moderate' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="experience" value="moderate" />
                  <div className="option-content">
                    <span className="option-title">Moderate Experience</span>
                    <span className="option-desc">I've had some training and am comfortable with firearms</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.experience === 'experienced' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="experience" value="experienced" />
                  <div className="option-content">
                    <span className="option-title">Experienced</span>
                    <span className="option-desc">I have extensive training and am seeking to advance my skills</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 2: Primary goal */}
            <div className={`question-step ${currentStep === 2 ? 'active' : ''}`} data-step="2">
              <h3>What's your primary goal for seeking training?</h3>
              <div className="answer-options">
                <label className={`answer-option ${formData.goal === 'self-defense' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="goal" value="self-defense" />
                  <div className="option-content">
                    <span className="option-title">Personal Self-Defense</span>
                    <span className="option-desc">Learn how to protect myself in dangerous situations</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.goal === 'home-defense' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="goal" value="home-defense" />
                  <div className="option-content">
                    <span className="option-title">Home Defense</span>
                    <span className="option-desc">Protect my home and family from potential threats</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.goal === 'skill-development' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="goal" value="skill-development" />
                  <div className="option-content">
                    <span className="option-title">Skill Development</span>
                    <span className="option-desc">Improve my shooting and tactical abilities</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.goal === 'ccw' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="goal" value="ccw" />
                  <div className="option-content">
                    <span className="option-title">Concealed Carry Preparation</span>
                    <span className="option-desc">Train for responsible everyday carry</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Training Preferences */}
            <div className={`question-step ${currentStep === 3 ? 'active' : ''}`} data-step="3">
              <h3>What type of training environment do you prefer?</h3>
              <div className="answer-options">
                <label className={`answer-option ${formData.interests.includes('group') ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="checkbox" name="interests" value="group" />
                  <div className="option-content">
                    <span className="option-title">Group Training</span>
                    <span className="option-desc">Learn alongside others in a collaborative environment</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.interests.includes('private') ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="checkbox" name="interests" value="private" />
                  <div className="option-content">
                    <span className="option-title">Private Sessions</span>
                    <span className="option-desc">Small group classes for personalized attention</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.interests.includes('scenario') ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="checkbox" name="interests" value="scenario" />
                  <div className="option-content">
                    <span className="option-title">Scenario-Based</span>
                    <span className="option-desc">Real-world situation simulations</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.interests.includes('drills') ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="checkbox" name="interests" value="drills" />
                  <div className="option-content">
                    <span className="option-title">Technical Drills</span>
                    <span className="option-desc">Focus on specific skills and techniques</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 4: Training frequency */}
            <div className={`question-step ${currentStep === 4 ? 'active' : ''}`} data-step="4">
              <h3>How often would you ideally like to train?</h3>
              <div className="answer-options">
                <label className={`answer-option ${formData.frequency === 'once-week' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="frequency" value="once-week" />
                  <div className="option-content">
                    <span className="option-title">Once per week</span>
                    <span className="option-desc">Regular but limited commitment</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.frequency === 'twice-week' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="frequency" value="twice-week" />
                  <div className="option-content">
                    <span className="option-title">Twice per week</span>
                    <span className="option-desc">Serious commitment to improvement</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.frequency === 'three-plus' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="frequency" value="three-plus" />
                  <div className="option-content">
                    <span className="option-title">Three+ times per week</span>
                    <span className="option-desc">Intensive training for rapid skill development</span>
                  </div>
                </label>
                <label className={`answer-option ${formData.frequency === 'flexible' ? 'selected' : ''}`} onClick={handleOptionClick}>
                  <input type="radio" name="frequency" value="flexible" />
                  <div className="option-content">
                    <span className="option-title">Flexible/Variable</span>
                    <span className="option-desc">Schedule varies based on availability</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Results step (shown after submission) */}
            <div className={`question-step results-step ${showResults ? 'active' : ''}`} data-step="results">
              {recommendation && (
                <div className="assessment-results">
                  <div className="results-header">
                    <h3>Your Personalized Training Recommendation</h3>
                    <p>Based on your responses, we recommend:</p>
                  </div>
                  <div className="recommended-program">
                    <h4>{recommendation.programName === 'Advanced' ? 'Core+' : 'Core'} Training Package</h4>
                    <p>{recommendation.description}</p>
                    <ul className="program-features">
                      {recommendation.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="results-cta">
                    <p>Ready to experience training that's tailored to your needs?</p>
                    <button 
                      className="btn btn-primary schedule-btn"
                      onClick={scheduleClass}
                    >
			BOOK NOW
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="assessment-nav">
            <button 
              className="btn btn-secondary" 
              id="prev-question" 
              onClick={goToPreviousStep} 
              disabled={currentStep === 1 || showResults}
            >
              PREVIOUS
            </button>
            {!showResults && (
              <button 
                className="btn btn-primary" 
                id="next-question" 
                onClick={goToNextStep}
              >
                {currentStep === totalSteps ? 'GET RECOMMENDATION' : 'NEXT'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssessmentForm; 
