import React from 'react';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact</h3>
            <p>160 S. Old Springs Rd, Suite 155</p>
            <p>Anaheim Hills, CA 92808</p>
            <p>Phone: (714) 555-0123</p>
            <p>Email: info@unitedtacticaldefense.com</p>
          </div>
          
          <div className="footer-section">
            <h3>Training Hours</h3>
            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p>Saturday: 10:00 AM - 4:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="https://instagram.com/UDT_anaheimhills" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://facebook.com/UDT_anaheimhills" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://twitter.com/UDT_anaheimhills" target="_blank" rel="noopener noreferrer">Twitter</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} United Tactical Defense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 