
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.classList.toggle('menu-open');
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="logo">UNITED DEFENSE TACTICAL</Link>
        <nav className="main-nav">
          <button 
            className="mobile-menu-toggle" 
            aria-label="Toggle menu" 
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span style={menuOpen ? {transform: 'rotate(45deg) translate(5px, 5px)'} : {}}></span>
            <span style={menuOpen ? {opacity: '0'} : {}}></span>
            <span style={menuOpen ? {transform: 'rotate(-45deg) translate(7px, -6px)'} : {}}></span>
          </button>
          <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <li><a href="#programs" onClick={() => setMenuOpen(false)}>Programs</a></li>
            <li><a href="#instructors" onClick={() => setMenuOpen(false)}>Instructors</a></li>
            <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
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
