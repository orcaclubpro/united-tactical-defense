import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlobalFormTrigger, { useGlobalForm } from '../Form/GlobalTrigger';
import './Header.scss';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openForm } = useGlobalForm();

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBookFreeClass = () => {
    openForm('free-class');
    setIsMenuOpen(false);
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="logo">UNITED DEFENSE TACTICAL</Link>
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
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><a href="#programs" onClick={() => setIsMenuOpen(false)}>Programs</a></li>
            <li><a href="#instructors" onClick={() => setIsMenuOpen(false)}>Instructors</a></li>
            <li><a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a></li>
            <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
            <li><Link to="/dashboard" className="dashboard-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>
            <li className="book-class-nav">
              <button 
                className="nav-cta-button"
                onClick={handleBookFreeClass}
              >
                Free Class
              </button>
            </li>
          </ul>
        </nav>
        <div className="contact-info">
          <a href="tel:6572760457" className="phone">(657) 276-0457</a>
          <span>Anaheim Hills, CA</span>
          <GlobalFormTrigger 
            buttonText="Free Class" 
            buttonSize="sm" 
            className="header-cta"
          />
        </div>
      </div>
    </header>
  );
};

export default Header; 