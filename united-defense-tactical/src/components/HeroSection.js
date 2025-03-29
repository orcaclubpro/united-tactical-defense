
import React, { useEffect } from 'react';

const HeroSection = () => {
  useEffect(() => {
    // Video background
    const videoContainer = document.querySelector('.hero-video-container');
    if (videoContainer) {
      const video = document.createElement('video');
      video.className = 'hero-video';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;

      // Add source element
      const source = document.createElement('source');
      source.src = 'videos/tactical-training.mp4';
      source.type = 'video/mp4';

      video.appendChild(source);
      videoContainer.appendChild(video);

      // Fallback if video can't play
      video.addEventListener('error', function() {
        videoContainer.style.backgroundImage = 'url("images/hero-bg.jpg")';
        videoContainer.style.backgroundSize = 'cover';
        videoContainer.style.backgroundPosition = 'center';
      });
    }
  }, []);

  return (
    <section className="hero">
      <div className="hero-video-container">
        {/* Video will be added via useEffect */}
      </div>
      <div className="container">
        <div className="hero-content">
          <h1>REALITY-BASED TACTICAL TRAINING FOR REAL-WORLD DEFENSE</h1>
          <p className="hero-tagline">Train to be safe. Train to be confident. Train to survive.</p>
          <ul className="hero-benefits">
            <li>Train with former special forces operators & law enforcement</li>
            <li>Master proven techniques in state-of-the-art facilities</li>
            <li>Join over 5,000 trained civilians, military & police</li>
          </ul>
          <div className="cta-buttons">
            <a href="#free-class" className="btn btn-primary btn-lg">CLAIM FREE CLASS</a>
            <a href="#programs" className="btn btn-secondary">VIEW PROGRAMS</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
