
import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <h3>United Defense Tactical</h3>
            <p>Orange County's premier reality-based firearms and self-defense training facility. Providing immersive training for civilians, law enforcement, and military personnel since 2019.</p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#programs">Training Programs</a></li>
              <li><a href="#instructors">Our Instructors</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#free-class">Free First Class</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p><strong>Phone:</strong> (657) 276-0457</p>
            <p><strong>Email:</strong> anaheimhills@uniteddefensetactical.com</p>
            <p><strong>Address:</strong> 160 S Old Springs Road #155, Anaheim Hills, CA 92808</p>
          </div>
          <div className="footer-hours">
            <h3>Hours of Operation</h3>
            <ul>
              <li><span>Monday-Friday:</span> 9:00 AM - 8:00 PM</li>
              <li><span>Saturday:</span> 9:00 AM - 6:00 PM</li>
              <li><span>Sunday:</span> 10:00 AM - 4:00 PM</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} United Defense Tactical. All rights reserved.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="icon-facebook">FB</i></a>
            <a href="#" aria-label="Instagram"><i className="icon-instagram">IG</i></a>
            <a href="#" aria-label="Twitter"><i className="icon-twitter">TW</i></a>
            <a href="#" aria-label="YouTube"><i className="icon-youtube">YT</i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
