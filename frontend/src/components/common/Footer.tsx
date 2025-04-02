import React from 'react';
import { Link } from 'react-router-dom';
import { placeholderImages } from '../../utils/placeholderImages';
import './Footer.scss';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-logo">
                <img src={placeholderImages.logoWhite} alt="United Tactical Defense" />
              </div>
              <p className="footer-tagline">
                Elite Tactical Training for Law Enforcement, Military & Civilians
              </p>
              <div className="social-icons">
                <a href="https://www.facebook.com/unitedtacticaldefense" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.instagram.com/unitedtacticaldefense" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.youtube.com/unitedtacticaldefense" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="https://www.linkedin.com/company/unitedtacticaldefense" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            
            <div className="footer-column">
              <h4>Programs</h4>
              <ul className="footer-links">
                <li><Link to="/programs/law-enforcement">Law Enforcement</Link></li>
                <li><Link to="/programs/military">Military</Link></li>
                <li><Link to="/programs/civilian">Civilian</Link></li>
                <li><Link to="/programs/executive-protection">Executive Protection</Link></li>
                <li><Link to="/programs/certification">Certification Programs</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/instructors">Our Instructors</Link></li>
                <li><Link to="/assessment">Training Assessment</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/blog">Blog</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Contact Us</h4>
              <address className="contact-info">
                <p><i className="fas fa-map-marker-alt"></i> 5790 Radar Way, Anaheim Hills, CA 92807</p>
                <p><i className="fas fa-phone"></i> <a href="tel:+17148789030">(714) 878-9030</a></p>
                <p><i className="fas fa-envelope"></i> <a href="mailto:info@unitedtacticaldefense.com">info@unitedtacticaldefense.com</a></p>
              </address>
              <Link to="/contact" className="btn btn-outline-light btn-sm">Get in Touch</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {currentYear} United Tactical Defense. All Rights Reserved.
            </p>
            <ul className="legal-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/sitemap">Sitemap</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 