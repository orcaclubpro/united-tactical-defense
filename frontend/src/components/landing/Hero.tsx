import React, { useEffect, useRef } from 'react';
import './Hero.scss';

const Hero: React.FC = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoContainerRef.current) {
      // Create video element
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.className = 'hero-video';

      // Add source
      const source = document.createElement('source');
      source.src = `${process.env.PUBLIC_URL}/assets/images/ty.MOV`;
      source.type = 'video/quicktime';
      
      video.appendChild(source);
      
      // Add fallback for browsers that don't support video
      video.innerHTML += `
        <img src="${process.env.PUBLIC_URL}/assets/images/hero-fallback.jpg" alt="Tactical training" />
      `;
      
      // Append video to container
      videoContainerRef.current.appendChild(video);

      // Attempt to play and seek to 8 seconds
      video.play().then(() => {
        video.currentTime = 11;
      }).catch(err => {
        console.log('Auto-play was prevented:', err);
      });

      // Cleanup
      return () => {
        if (videoContainerRef.current) {
          videoContainerRef.current.innerHTML = '';
        }
      };
    }
  }, []);

  const openFreeClassModal = () => {
    const openModalButton = document.getElementById('open-free-class-modal');
    if (openModalButton) {
      openModalButton.click();
    }
  };

  return (
    <section className="hero">
      <div className="hero-video-container" ref={videoContainerRef}></div>
      <div className="container hero-container">
        <div className="hero-content">
          <h1>REALITY-BASED TACTICAL TRAINING FOR REAL-WORLD DEFENSE</h1>
          <p className="hero-tagline">Train to be safe. Train to be confident. Train to survive.</p>
          <ul className="hero-benefits">
            <li>Awareness: We teach situational awareness to help clients recognize and avoid threats before they happen—key to staying safe.</li>
            <li>Confidence: Our reality-based training builds true confidence under pressure, so clients feel ready and in control.</li>
            <li>Empower: We empower everyday people with the skills to protect themselves and others—strength through preparation.</li>
          </ul>
          <div className="cta-buttons">
            <button onClick={openFreeClassModal} className="btn btn-red btn-lg">BOOK FREE CLASS</button>
            <a 
              href="#programs" 
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >VIEW PROGRAMS</a>
          </div>
        </div>
        <div className="hero-logo">
          <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="United Tactical Defense Logo" />
        </div>
      </div>
    </section>
  );
};

export default Hero; 