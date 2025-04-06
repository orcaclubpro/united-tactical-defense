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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3315.0066420868344!2d-117.79796368430508!3d33.823384938405945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcd0688e5d9e59%3A0xada12e709af311b6!2s160%20S%20Old%20Springs%20Rd%20%23155%2C%20Anaheim%2C%20CA%2092808!5e0!3m2!1sen!2sus!4v1649456892029!5m2!1sen!2sus" 
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
              <div className="card-content">
                <h3>Address</h3>
                <p>160 S. Old Springs Rd, Suite 155<br />Anaheim Hills, CA 92808</p>
                <a 
                  href="https://maps.app.goo.gl/zQbT5YsbsXaFYsgM9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="directions-link"
                >
                  Get Directions <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
            
            <div className="detail-card hours">
              <div className="card-content">
                <h3>Training Hours</h3>
                <ul className="hours-list">
                  <li><span>Monday - Friday:</span> 9:00 AM - 8:00 PM</li>
                  <li><span>Sat/Sun:</span> 8:00 AM - 5:00 PM</li>
                </ul>
              </div>
            </div>
            
            <div className="detail-card contact">
              <div className="card-content">
                <h3>Contact</h3>
                <p><strong>Phone:</strong> <a href="tel:6572760457">(657) 276-0457</a></p>
                <p><strong>Email:</strong> <a href="mailto:anaheimhills@uniteddefensetactical.com">anaheimhills@uniteddefensetactical.com</a></p>
              </div>
            </div>
          </div>
        </div>
        
        <div id="contact" className="contact-info-container">
          <div className="info-header">
            <h3>Get In Touch</h3>
            <p>For any inquiries about our training programs or scheduling, please contact us directly.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location; 