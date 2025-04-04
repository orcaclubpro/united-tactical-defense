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

  return (
    <section className="hero">
      <div className="hero-video-container" ref={videoContainerRef}></div>
      <div className="container hero-container">
        <div className="hero-content">
          <h1>REALITY-BASED TACTICAL TRAINING FOR REAL-WORLD DEFENSE</h1>
          <p className="hero-tagline">awareness. confidence. empowerment.</p>
          <ul className="hero-benefits">
            <li>Train with former special forces operators & law enforcement</li>
            <li>Master proven techniques in state-of-the-art facilities</li>
            <li>Join over 3000+ trained civilians, military & police</li>
          </ul>
          <div className="cta-buttons">
            <a href="#free-class" className="btn btn-red btn-lg">BOOK FREE CLASS</a>
            <a href="#programs" className="btn btn-secondary">VIEW PROGRAMS</a>
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