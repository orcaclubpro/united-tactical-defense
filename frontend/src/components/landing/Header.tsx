import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to add sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <a href="#" className="logo" onClick={closeMenu}>UNITED DEFENSE TACTICAL</a>
        <nav className="main-nav">
          <button 
            className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`} 
            aria-label="Toggle menu" 
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div 
            className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} 
            onClick={closeMenu}
          ></div>
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><a href="#programs" onClick={closeMenu}>Programs</a></li>
            <li><a href="#instructors" onClick={closeMenu}>Instructors</a></li>
            <li><a href="#pricing" onClick={closeMenu}>Membership</a></li>
            <li><a href="#faq" onClick={closeMenu}>FAQ</a></li>
            <li><a href="#location" onClick={closeMenu}>Location</a></li>
            <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
            <li><Link to="/dashboard" className="dashboard-link" onClick={closeMenu}>Dashboard</Link></li>
          </ul>
        </nav>
        <div className="contact-info">
          <a href="tel:6572760457" className="phone">(657) 276-0457</a>
          <span>Anaheim Hills, CA</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 