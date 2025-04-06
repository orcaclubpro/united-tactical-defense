import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [upScrollAmount, setUpScrollAmount] = useState(0);
  
  // Threshold for how much upward scroll is needed before showing header (in pixels)
  const upScrollThreshold = 550;

  // Handle scroll event to add sticky header and show/hide based on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Determine if we've scrolled past threshold
      setIsScrolled(currentScrollPos > 50);
      
      // Determine scroll direction
      const isScrollingUp = prevScrollPos > currentScrollPos;
      
      if (isScrollingUp) {
        // When scrolling up, accumulate the scroll amount
        const amount = prevScrollPos - currentScrollPos;
        setUpScrollAmount(prev => prev + amount);
        
        // Only show header if upward scroll amount exceeds threshold or we're at the top
        setIsVisible(upScrollAmount > upScrollThreshold || currentScrollPos < 50);
      } else {
        // When scrolling down, reset the upward scroll counter and hide header
        setUpScrollAmount(0);
        setIsVisible(currentScrollPos < 50);
      }
      
      // Save current position for next comparison
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos, upScrollAmount]);

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
    <header className={`site-header ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
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