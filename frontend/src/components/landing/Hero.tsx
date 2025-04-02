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

      // Add source
      const source = document.createElement('source');
      source.src = `${process.env.PUBLIC_URL}/videos/hero-background.mp4`;
      source.type = 'video/mp4';
      
      video.appendChild(source);
      
      // Add fallback for browsers that don't support video
      video.innerHTML += `
        <img src="${process.env.PUBLIC_URL}/assets/images/hero-fallback.jpg" alt="Tactical training" />
      `;
      
      // Append video to container
      videoContainerRef.current.appendChild(video);

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
        videoContainerRef.current?.appendChild(playButton);
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

export default Hero; 