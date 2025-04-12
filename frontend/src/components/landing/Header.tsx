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

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent header click event
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent header click event
    closeMenu();
    
    let targetId = sectionId;
    
    // Special case handling for pricing section which is actually training-packages
    if (sectionId === 'pricing') {
      targetId = 'training-packages';
    }
    
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Only scroll to top if we're not clicking on a navigation link or menu button
    if (!(e.target as HTMLElement).closest('a') && 
        !(e.target as HTMLElement).closest('.mobile-menu-toggle') && 
        !(e.target as HTMLElement).closest('.hamburger')) {
      scrollToTop(e);
    }
  };

  return (
    <>
      <header 
        className={`site-header ${isScrolled ? 'scrolled' : ''} ${isVisible ? 'visible' : 'hidden'}`}
        onClick={handleHeaderClick}
      >
        <div className="container">
          <a href="#" className="logo" onClick={scrollToTop}>
            <div className="mobile-logo">
              <img src="/favicon.ico" alt="UDT Favicon" className="mobile-favicon" />
              <span>United Defense Tactical</span>
            </div>
          </a>
          
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <nav className={`main-nav ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
            <ul className="nav-links">
              <li>
                <a href="#programs" onClick={(e) => scrollToSection('programs', e)}>
                  Programs
                </a>
              </li>
              <li>
                <a href="#instructors" onClick={(e) => scrollToSection('instructors', e)}>
                  Instructors
                </a>
              </li>
              <li>
                <a href="#location" onClick={(e) => scrollToSection('location', e)}>
                  Location
                </a>
              </li>
              <li>
                <a href="#training-packages" onClick={(e) => scrollToSection('training-packages', e)}>
                  Packages
                </a>
              </li>
              <li>
                <a href="#location" onClick={(e) => scrollToSection('location', e)}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="nav-overlay active" onClick={closeMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <ul className="nav-links active">
              <li>
                <a href="#programs" onClick={(e) => scrollToSection('programs', e)}>
                  Programs
                </a>
              </li>
              <li>
                <a href="#instructors" onClick={(e) => scrollToSection('instructors', e)}>
                  Instructors
                </a>
              </li>
              <li>
                <a href="#location" onClick={(e) => scrollToSection('location', e)}>
                  Location
                </a>
              </li>
              <li>
                <a href="#training-packages" onClick={(e) => scrollToSection('training-packages', e)}>
                  Packages
                </a>
              </li>
              <li>
                <a href="#location" onClick={(e) => scrollToSection('location', e)}>
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 