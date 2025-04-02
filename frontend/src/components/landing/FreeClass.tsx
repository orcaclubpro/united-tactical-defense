import React, { useState } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import { submitFreeClassForm } from '../../services/api';
import './FreeClass.scss';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  experience: string;
  hearAbout: string;
  notes: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  preferredDate: '',
  experience: 'beginner',
  hearAbout: '',
  notes: ''
};

const FreeClass: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus('');
    
    try {
      await submitFreeClassForm(formData);
      setFormStatus('success');
      setFormData(initialFormData);
      setTimeout(() => closeModal(), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
  };
  
  return (
    <section id="free-class" className="free-class-section">
      <div className="container">
        <div className="free-class-content">
          <div className="content-text">
            <h2>Experience Our Training Firsthand</h2>
            <p className="lead">Claim your complimentary training session to see if our approach is right for you</p>
            
            <div className="benefits">
              <h3>What to Expect in Your Free Class:</h3>
              <ul>
                <li>Personal introduction to our training methodology</li>
                <li>Hands-on experience with proper techniques</li>
                <li>Assessment of your current skill level</li>
                <li>Personalized training recommendations</li>
                <li>Tour of our state-of-the-art facilities</li>
              </ul>
            </div>
            
            <div className="cta-button">
              <button id="open-free-class-modal" className="btn btn-primary btn-lg" onClick={openModal}>
                Schedule Your Free Class
              </button>
            </div>
          </div>
          
          <div className="content-image">
            <img src={placeholderImages.trainingSession} alt="Training session" />
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>×</button>
          
          <div className="modal-header">
            <h3>Schedule Your Free Training Session</h3>
            <p>Fill out the form below and we'll contact you to confirm your session</p>
          </div>
          
          {formStatus === 'success' ? (
            <div className="form-success">
              <div className="success-icon">✓</div>
              <h4>Thank You!</h4>
              <p>Your free class has been scheduled. We'll contact you shortly to confirm the details.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="free-class-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="preferredDate">Preferred Date</label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="experience">Experience Level</label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                  >
                    <option value="beginner">Beginner - No Experience</option>
                    <option value="novice">Novice - Some Experience</option>
                    <option value="intermediate">Intermediate - Regular Experience</option>
                    <option value="advanced">Advanced - Extensive Experience</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="hearAbout">How did you hear about us?</label>
                <input
                  type="text"
                  id="hearAbout"
                  name="hearAbout"
                  value={formData.hearAbout}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                ></textarea>
              </div>
              
              {formStatus === 'error' && (
                <div className="form-error">
                  There was an error submitting your request. Please try again or contact us directly.
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Schedule Now'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default FreeClass; 