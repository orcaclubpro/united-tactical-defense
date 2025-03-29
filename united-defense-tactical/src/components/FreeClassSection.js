
import React, { useState } from 'react';

const FreeClassSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.experience) {
      alert('Please fill out all fields');
      return;
    }

    // Submit form data
    console.log('Form submitted:', {
      ...formData,
      date: new Date().toISOString()
    });
    
    // Show success message
    setIsSubmitted(true);
  };

  return (
    <section id="free-class" className="free-class">
      <div className="container">
        <header className="section-header">
          <h2>Start With A Free Class</h2>
          <p>Experience our training with zero risk or obligation</p>
        </header>
        
        {isSubmitted ? (
          <div className="success-message">
            <h3>Thank You!</h3>
            <p>We've received your request for a free class. One of our instructors will contact you within 24 hours to schedule your session.</p>
          </div>
        ) : (
          <form id="free-class-form" className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                value={formData.phone}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="experience">Experience Level</label>
              <select 
                id="experience" 
                value={formData.experience}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select your experience level</option>
                <option value="beginner">Complete Beginner</option>
                <option value="some">Some Experience</option>
                <option value="experienced">Experienced</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-full">CLAIM YOUR FREE CLASS NOW</button>
            <p className="form-disclaimer">We respect your privacy and will never share your information.</p>
          </form>
        )}
      </div>
    </section>
  );
};

export default FreeClassSection;
