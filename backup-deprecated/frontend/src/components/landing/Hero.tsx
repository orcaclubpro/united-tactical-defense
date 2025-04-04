import React, { useEffect, useRef } from 'react';
import { Link } from 'react-scroll';
import './Hero.scss';

const Hero: React.FC = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoContainer = videoContainerRef.current;
    if (videoContainer) {
      // Create video element
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.className = 'hero-video';

      // Add source
      const source = document.createElement('source');
      source.src = `${process.env.PUBLIC_URL}/videos/training.mov`;
      source.type = 'video/mp4';
      
      video.appendChild(source);
      
      // Add fallback for browsers that don't support video
      video.innerHTML += `
        <img src="${process.env.PUBLIC_URL}/images/hero-fallback.jpg" alt="Tactical training" />
      `;
      
      // Append video to container
      videoContainer.appendChild(video);

      // Attempt to play
      video.play().catch(err => {
        console.log('Auto-play was prevented:', err);
        // Add a play button as fallback
        const playButton = document.createElement('button');
        playButton.className = 'video-play-button';
        playButton.innerHTML = '<span>▶</span>';
        playButton.addEventListener('click', () => {
          video.play();
          playButton.style.display = 'none';
        });
        videoContainer?.appendChild(playButton);
      });

      // Cleanup
      return () => {
        if (videoContainer) {
          videoContainer.innerHTML = '';
        }
      };
    }
  }, []);

  return (
    <section className="hero">
      <div className="hero-video-container" ref={videoContainerRef}></div>
      <div className="overlay-pattern"></div>
      <div className="overlay-gradient"></div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">PREMIER TACTICAL TRAINING</div>
          
          <h1>REALITY-BASED <span className="highlight">TACTICAL TRAINING</span> FOR REAL-WORLD DEFENSE</h1>
          
          <p className="hero-tagline">Train to be safe. Train to be confident. Train to survive.</p>
          
          <ul className="hero-benefits">
            <li>
              <span className="benefit-icon">✓</span>
              <span>Train with former special forces operators & law enforcement</span>
            </li>
            <li>
              <span className="benefit-icon">✓</span>
              <span>Master proven techniques in state-of-the-art facilities</span>
            </li>
            <li>
              <span className="benefit-icon">✓</span>
              <span>Join over 5,000 trained civilians, military & police</span>
            </li>
          </ul>
          
          <div className="cta-buttons">
            <Link 
              to="free-class"
              smooth={true}
              duration={800}
              offset={-100}
              className="btn btn-primary btn-lg pulse-animation"
            >
              CLAIM FREE CLASS
              <div className="btn-badge">Limited Time</div>
            </Link>
            <a href="#programs" className="btn btn-outline">VIEW PROGRAMS</a>
          </div>
          
          <div className="hero-credentials">
            <p>Trusted by law enforcement agencies and security professionals nationwide</p>
            <div className="credentials-logos">
              <div className="credential-logo"></div>
              <div className="credential-logo"></div>
              <div className="credential-logo"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <div className="arrow-container">
          <span className="arrow"></span>
        </div>
      </div>
    </section>
  );
};

export default Hero; 