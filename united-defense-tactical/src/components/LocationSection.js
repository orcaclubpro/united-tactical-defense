
import React, { useEffect } from 'react';

const LocationSection = () => {
  useEffect(() => {
    // Map implementation
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div style="height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--color-navy); color: white; text-align: center; padding: 2rem;">
          <div>
            <p style="margin-bottom: 1rem; font-weight: bold;">United Defense Tactical</p>
            <p>160 S Old Springs Road #155, Anaheim Hills, CA 92808</p>
          </div>
        </div>
      `;
    }
  }, []);

  return (
    <section id="contact" className="location">
      <div className="container">
        <header className="section-header">
          <h2>Visit Our Facility</h2>
          <p>Train in our state-of-the-art center in Anaheim Hills</p>
        </header>
        <div className="location-details">
          <address>
            <h3>Contact Information</h3>
            <p>160 S Old Springs Road #155<br />Anaheim Hills, CA 92808</p>
            <a href="tel:6572760457">(657) 276-0457</a>
            <a href="mailto:anaheimhills@uniteddefensetactical.com">anaheimhills@uniteddefensetactical.com</a>
            
            <h4>Hours of Operation</h4>
            <p><strong>Monday-Friday:</strong> 9:00 AM - 8:00 PM<br />
            <strong>Saturday:</strong> 9:00 AM - 6:00 PM<br />
            <strong>Sunday:</strong> 10:00 AM - 4:00 PM</p>
          </address>
          <div className="map-container">
            <div id="map"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
