import React from 'react';
import './Location.scss';

const Location: React.FC = () => {
  return (
    <section id="location" className="location-section">
      <div className="container">
        <header className="section-header">
          <h2>Our Location</h2>
          <p>Train with us at our state-of-the-art facility in Anaheim Hills</p>
        </header>
        
        <div className="location-container">
          <div className="location-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3313.887811086248!2d-117.75910858479216!3d33.844911280659076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcd0ab6c42a6c3%3A0x8f1293d0e7169571!2s160%20S%20Old%20Springs%20Rd%20Suite%20155%2C%20Anaheim%2C%20CA%2092808!5e0!3m2!1sen!2sus!4v1649456892029!5m2!1sen!2sus" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="United Defense Tactical location map"
            ></iframe>
          </div>
          
          <div className="location-details">
            <div className="detail-card address">
              <div className="card-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="card-content">
                <h3>Address</h3>
                <p>160 S. Old Springs Rd, Suite 155<br />Anaheim, CA 92808</p>
                <a 
                  href="https://maps.google.com/?q=160+S.+Old+Springs+Rd,+Suite+155,+Anaheim,+CA+92808" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="directions-link"
                >
                  Get Directions
                </a>
              </div>
            </div>
            
            <div className="detail-card hours">
              <div className="card-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="card-content">
                <h3>Training Hours</h3>
                <ul className="hours-list">
                  <li><span>Monday - Friday:</span> 9:00 AM - 8:00 PM</li>
                  <li><span>Saturday - Sunday:</span> 8:00 AM - 5:00 PM</li>
                </ul>
              </div>
            </div>
            
            <div className="detail-card contact">
              <div className="card-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className="card-content">
                <h3>Contact</h3>
                <p><strong>Phone:</strong> <a href="tel:6572760457">(657) 276-0457</a></p>
                <p><strong>Email:</strong> <a href="mailto:anaheimhills@uniteddefensetactical.com">anaheimhills@uniteddefensetactical.com</a></p>
              </div>
            </div>
          </div>
        </div>
        
        <div id="contact" className="contact-form-container">
          <div className="form-header">
            <h3>Send Us a Message</h3>
            <p>Questions about our training or facility? Drop us a line and we'll get back to you shortly.</p>
          </div>
          
          <form className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name *</label>
                <input type="text" id="contact-name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email *</label>
                <input type="email" id="contact-email" name="email" required />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="contact-subject">Subject</label>
              <input type="text" id="contact-subject" name="subject" />
            </div>
            
            <div className="form-group">
              <label htmlFor="contact-message">Message *</label>
              <textarea id="contact-message" name="message" rows={5} required></textarea>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Send Message</button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="tagline">
        <div className="container">
          <p>Real World Tactical Training for Civilians, Law Enforcement & Military</p>
        </div>
      </div>
    </section>
  );
};

export default Location; 