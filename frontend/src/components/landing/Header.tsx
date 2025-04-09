import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  
  // Threshold for hiding header (pixels from top)
  const scrollThreshold = 50; 

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isMobile = window.innerWidth <= 768; 

      setIsScrolled(currentScrollPos > scrollThreshold);

      if (!isMobile) {
        // Show header if scrolling up or near the top, hide if scrolling down past threshold
        if (currentScrollPos < scrollThreshold) {
          setIsVisible(true);
        } else if (prevScrollPos > currentScrollPos) {
          setIsVisible(true); // Scrolling Up
        } else {
          setIsVisible(false); // Scrolling Down
        }
      } else {
        // Always visible on mobile
        setIsVisible(true); 
      }
      
      // Store scroll position for next event, but only if difference is significant
      // to avoid rapid state changes on minor scrolls
      if (Math.abs(currentScrollPos - prevScrollPos) > 5 || currentScrollPos < scrollThreshold) {
        setPrevScrollPos(currentScrollPos);
      }
    };
    
    // Add scroll and resize listeners
    window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive listener
    window.addEventListener('resize', handleScroll); 
    
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  // Dependency array simplified: only need prevScrollPos
  }, [prevScrollPos]); 

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

  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="container">
        <a href="#" className="logo" onClick={scrollToTop}>
          <img src="/assets/images/logo.png" alt="United Defense Tactical Logo" />
        </a>
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
            <li><a href="#programs" onClick={(e) => scrollToSection('programs', e)}>Programs</a></li>
            <li><a href="#instructors" onClick={(e) => scrollToSection('instructors', e)}>Instructors</a></li>
            <li><a href="#training-packages" onClick={(e) => scrollToSection('training-packages', e)}>Packages</a></li>
            <li><a href="#faq" onClick={(e) => scrollToSection('faq', e)}>FAQ</a></li>
            <li><a href="#location" onClick={(e) => scrollToSection('location', e)}>Location</a></li>
            <li><a href="#location" onClick={(e) => scrollToSection('location', e)}>Contact</a></li>
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