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
    name: '',
    email: '',
    phone: ''
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const totalSteps = 5;
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [showFinalSuccess, setShowFinalSuccess] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add custom styling to the progress bar when the component mounts
  useEffect(() => {
    // Add a nicer heading to the form
    const formContainer = document.querySelector('.assessment-form-container');
    if (formContainer && !formContainer.querySelector('.form-header')) {
      const header = document.createElement('div');
      header.className = 'form-header';
      
      const heading = document.createElement('h3');
      heading.textContent = 'Find Your Perfect Training Path';
      heading.className = 'form-title';
      
      const subtitle = document.createElement('p');
      subtitle.textContent = 'Answer a few quick questions to get a personalized recommendation';
      subtitle.className = 'form-subtitle';
      
      header.appendChild(heading);
      header.appendChild(subtitle);
      
      // Insert at the beginning of the form
      const firstChild = formContainer.firstChild;
      formContainer.insertBefore(header, firstChild);
    }
    
    // Enhance the security message
    const form = document.querySelector('form');
    if (form && !document.querySelector('.form-security-note')) {
      const securityNote = document.createElement('div');
      securityNote.className = 'form-security-note';
      
      securityNote.innerHTML = `
        <div class="security-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11h1.5v5h-8.5v-5h1.5V9.5C9.3 8.1 10.6 7 12 7zm0 1.5c-.8 0-1.3.6-1.3 1.3V11h2.5V9.8c0-.7-.5-1.3-1.2-1.3z" />
          </svg>
        </div>
        <span>Your information is secure and will never be shared with third parties.</span>
      `;
      
      form.appendChild(securityNote);
    }
    
    updateProgressBar();
  }, [currentStep]);

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
      
      // Automatically advance to next step after a short delay
      setTimeout(() => {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
        }
      }, 500);
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        [name]: [...formData.interests, value]
      });
    } else {
      setFormData({
        ...formData,
        [name]: formData.interests.filter(item => item !== value)
      });
    }
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
      case 5:
        return !!formData.name && !!formData.email && !!formData.phone;
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

      // Submit to backend
      await submitAssessmentForm({
        ...formData,
        recommendedProgram: rec.programName
      });

      // Show contact form instead of results
      setSubmitSuccess(true);
      setShowContactForm(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle contact info changes
  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
  };
  
  // Submit contact info
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit the contact info along with the assessment data
      const combinedData = {
        ...formData,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        email: contactInfo.email || formData.email,
        phone: contactInfo.phone || formData.phone,
      };
      
      // Submit to your API (reuse existing function or create new one)
      try {
        await submitAssessmentForm(combinedData);
        console.log('Contact info saved successfully.');
      } catch (error) {
        console.error('Error saving contact info:', error);
        // Continue anyway to show final success
      }
      
      // Hide contact form and show recommendation
      setShowContactForm(false);
      setShowFinalSuccess(true);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error submitting contact info:', error);
      setErrorMessage('There was an error saving your contact information. Please try again.');
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

  const renderRecommendation = () => {
    if (!recommendation) return null;
    
    return (
      <div className="recommendation-container">
        <div className="recommendation-header">
          <div className="success-icon">✓</div>
          <h3>Your Personalized Training Plan</h3>
          <p>Based on your responses, we've created a custom program perfect for your needs</p>
        </div>
        
        <div className="recommendation-content">
          <div className="program-name">{recommendation.programName}</div>
          <p className="program-description">{recommendation.description}</p>
          
          <div className="program-features">
            <h4>What's Included:</h4>
            <ul>
              {recommendation.features.map((feature, index) => (
                <li key={index}>
                  <span className="feature-check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="program-pricing">
            <div className="price-tag">{recommendation.price}</div>
            <div className="price-note">Special offer for new students</div>
          </div>
        </div>
        
        <div className="recommendation-cta">
          <button className="btn btn-primary btn-lg pulse-animation" onClick={() => setShowContactForm(true)}>
            Claim Your Free Trial Class
          </button>
          <p className="satisfaction-guarantee">100% Satisfaction Guarantee • No Obligation</p>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    // If showing results or success state, render those
    if (showResults && recommendation) {
      return renderRecommendation();
    }
    
    if (showFinalSuccess) {
      return renderFinalSuccess();
    }

    if (showContactForm) {
      return renderContactForm();
    }

    // Otherwise, render the current form step
    return (
      <div className="assessment-form">
        <div className="form-header">
          <h3>Find Your Perfect Training Path</h3>
          <p>Answer a few quick questions to get a personalized recommendation</p>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-indicator"></div>
          </div>
          <div className="steps-indicator">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div 
                key={idx}
                className={`step ${idx + 1 === currentStep ? 'active' : ''} ${idx + 1 < currentStep ? 'completed' : ''}`}
                data-step={idx + 1}
              >
                {idx + 1 < currentStep ? '✓' : idx + 1}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-content">
          {renderStep()}
        </div>
        
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" className="btn btn-outline back-btn" onClick={goToPreviousStep}>
              Back
            </button>
          )}
          
          {currentStep < totalSteps && (
            <button type="button" className="btn btn-primary next-btn" onClick={goToNextStep}>
              Continue
            </button>
          )}
          
          {currentStep === totalSteps && (
            <button 
              type="button" 
              className="btn btn-primary submit-btn" 
              onClick={submitAssessment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Analyzing...' : 'Get Your Custom Plan'}
            </button>
          )}
        </div>
        
        <div className="form-security-note">
          <div className="security-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11h1.5v5h-8.5v-5h1.5V9.5C9.3 8.1 10.6 7 12 7zm0 1.5c-.8 0-1.3.6-1.3 1.3V11h2.5V9.8c0-.7-.5-1.3-1.2-1.3z" />
            </svg>
          </div>
          <span>Your information is secure and will never be shared with third parties.</span>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step" id="step-1">
            <div className="step-title">
              <h4>What's your tactical training experience level?</h4>
              <p className="step-subtitle">This helps us tailor our recommendations to your skill level</p>
            </div>
            
            <div className="answer-options">
              <label className={`answer-option ${formData.experience === 'none' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Beginner</h5>
                  <p>Little to no prior training</p>
                </div>
                <input type="radio" name="experience" value="none" checked={formData.experience === 'none'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.experience === 'limited' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Some Experience</h5>
                  <p>Basic understanding of techniques</p>
                </div>
                <input type="radio" name="experience" value="limited" checked={formData.experience === 'limited'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.experience === 'moderate' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Intermediate</h5>
                  <p>Regular training for 1-3 years</p>
                </div>
                <input type="radio" name="experience" value="moderate" checked={formData.experience === 'moderate'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.experience === 'experienced' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Advanced</h5>
                  <p>Extensive training experience</p>
                </div>
                <input type="radio" name="experience" value="experienced" checked={formData.experience === 'experienced'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="form-step" id="step-2">
            <div className="step-title">
              <h4>What's your primary goal for seeking training?</h4>
              <p className="step-subtitle">This helps us tailor our recommendations to your needs</p>
            </div>
            
            <div className="answer-options">
              <label className={`answer-option ${formData.goal === 'self-defense' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Personal Self-Defense</h5>
                  <p>Learn how to protect myself in dangerous situations</p>
                </div>
                <input type="radio" name="goal" value="self-defense" checked={formData.goal === 'self-defense'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.goal === 'home-defense' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Home Defense</h5>
                  <p>Protect my home and family from potential threats</p>
                </div>
                <input type="radio" name="goal" value="home-defense" checked={formData.goal === 'home-defense'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.goal === 'skill-development' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Skill Development</h5>
                  <p>Improve my shooting and tactical abilities</p>
                </div>
                <input type="radio" name="goal" value="skill-development" checked={formData.goal === 'skill-development'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.goal === 'ccw' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Concealed Carry Preparation</h5>
                  <p>Train for responsible everyday carry</p>
                </div>
                <input type="radio" name="goal" value="ccw" checked={formData.goal === 'ccw'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="form-step" id="step-3">
            <div className="step-title">
              <h4>Which training areas interest you most?</h4>
              <p className="step-subtitle">This helps us tailor our recommendations to your interests</p>
            </div>
            
            <div className="answer-options checkbox-options">
              <label className={`answer-option ${formData.interests.includes('handguns') ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Handgun Training</h5>
                  <p>Pistol safety, shooting, and handling</p>
                </div>
                <input type="checkbox" name="interests" value="handguns" checked={formData.interests.includes('handguns')} onChange={handleCheckboxChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.interests.includes('tactical') ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Tactical Training</h5>
                  <p>Movement, positions, and combat scenarios</p>
                </div>
                <input type="checkbox" name="interests" value="tactical" checked={formData.interests.includes('tactical')} onChange={handleCheckboxChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.interests.includes('non-firearm') ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Non-Firearm Defense</h5>
                  <p>Hand-to-hand combat and threat de-escalation</p>
                </div>
                <input type="checkbox" name="interests" value="non-firearm" checked={formData.interests.includes('non-firearm')} onChange={handleCheckboxChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.interests.includes('stress-training') ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Stress Response Training</h5>
                  <p>Preparing for high-pressure situations</p>
                </div>
                <input type="checkbox" name="interests" value="stress-training" checked={formData.interests.includes('stress-training')} onChange={handleCheckboxChange} />
                <div className="check"></div>
              </label>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="form-step" id="step-4">
            <div className="step-title">
              <h4>How often would you ideally like to train?</h4>
              <p className="step-subtitle">This helps us tailor our recommendations to your schedule</p>
            </div>
            
            <div className="answer-options">
              <label className={`answer-option ${formData.frequency === 'once-week' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Once per week</h5>
                  <p>Regular but limited commitment</p>
                </div>
                <input type="radio" name="frequency" value="once-week" checked={formData.frequency === 'once-week'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.frequency === 'twice-week' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Twice per week</h5>
                  <p>Serious commitment to improvement</p>
                </div>
                <input type="radio" name="frequency" value="twice-week" checked={formData.frequency === 'twice-week'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.frequency === 'three-plus' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Three+ times per week</h5>
                  <p>Intensive training for rapid skill development</p>
                </div>
                <input type="radio" name="frequency" value="three-plus" checked={formData.frequency === 'three-plus'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
              
              <label className={`answer-option ${formData.frequency === 'flexible' ? 'selected' : ''}`} onClick={handleOptionClick}>
                <div className="option-content">
                  <h5>Flexible/Variable</h5>
                  <p>Schedule varies based on availability</p>
                </div>
                <input type="radio" name="frequency" value="flexible" checked={formData.frequency === 'flexible'} onChange={handleInputChange} />
                <div className="check"></div>
              </label>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="form-step" id="step-5">
            <div className="step-title">
              <h4>Get your personalized training recommendation</h4>
              <p className="step-subtitle">Enter your information to receive your custom recommendation and a free class offer</p>
            </div>
            
            <div className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  placeholder="(123) 456-7890" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFinalSuccess = () => {
    return (
      <div className="success-message">
        <div className="success-icon pulse-animation">✓</div>
        <h3>Congratulations!</h3>
        <p>Your free class has been scheduled. We've sent the details to your email.</p>
        <p className="success-contact">One of our instructors will contact you shortly to confirm.</p>
      </div>
    );
  };

  const renderContactForm = () => {
    return (
      <div className="contact-form-container">
        <h3>Complete Your Booking</h3>
        <p>Just a few more details to schedule your free class</p>
        
        <form onSubmit={handleContactSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={contactInfo.firstName}
                onChange={handleContactInfoChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={contactInfo.lastName}
                onChange={handleContactInfoChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={contactInfo.email || formData.email}
              onChange={handleContactInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={contactInfo.phone || formData.phone}
              onChange={handleContactInfoChange}
              required
            />
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="form-cta">
            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Reserve My Free Class Now'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="assessment-form-container">
      {showResults && recommendation ? (
        renderRecommendation()
      ) : showFinalSuccess ? (
        <div className="success-message">
          <div className="success-icon pulse-animation">✓</div>
          <h3>Congratulations!</h3>
          <p>Your free class has been scheduled. We've sent the details to your email.</p>
          <p className="success-contact">One of our instructors will contact you shortly to confirm.</p>
        </div>
      ) : showContactForm ? (
        <div className="contact-form-container">
          <h3>Complete Your Booking</h3>
          <p>Just a few more details to schedule your free class</p>
          
          <form onSubmit={handleContactSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={contactInfo.firstName}
                  onChange={handleContactInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={contactInfo.lastName}
                  onChange={handleContactInfoChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={contactInfo.email || formData.email}
                onChange={handleContactInfoChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={contactInfo.phone || formData.phone}
                onChange={handleContactInfoChange}
                required
              />
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="form-cta">
              <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Reserve My Free Class Now'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <form>
          {renderStep()}
        </form>
      )}
    </div>
  );
};

export default AssessmentForm; 