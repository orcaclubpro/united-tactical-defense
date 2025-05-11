import React from "react";
import "./Location.scss";

const Location: React.FC = () => {
  const appleMapsUrl =
    "https://maps.apple.com/?address=160+S+Old+Springs+Rd+%23155,+Anaheim+Hills,+CA+92808,+USA&ll=33.823385,-117.797964&q=United+Tactical+Defense";

  return (
    <section id="location" className="location-section">
      <div className="container">
        <header className="section-header">
          <h2>Our Location</h2>
          <p>Train with us at our state-of-the-art facility in Anaheim Hills</p>
        </header>

        <div className="location-container">
          <div className="location-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3315.0066420868344!2d-117.79796368430508!3d33.823384938405945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcd0688e5d9e59%3A0xada12e709af311b6!2s160%20S%20Old%20Springs%20Rd%20%23155%2C%20Anaheim%2C%20CA%2092808!5e0!3m2!1sen!2sus!4v1649456892029!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="United Defense Tactical location map"
            ></iframe>
          </div>

          <div className="location-details">
            <div className="detail-card address">
              <h3>Address</h3>
              <p>160 S. Old Springs Rd, Suite 155</p>
              <p>Anaheim Hills, CA 92808</p>
              <a
                href={appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-link"
              >
                Get Directions
              </a>
            </div>

            <div className="detail-card hours">
              <h3>Training Hours</h3>
              <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p>Saturday - Sunday: 8:00 AM - 5:00 PM</p>
            </div>

            <div className="detail-card contact">
              <h3>Contact</h3>
              <p>Phone: (657)276-0457</p>
              <p>Email: anaheimhills@uniteddefensetactical.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
