import React, { useEffect, useRef, useState } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import './VideoSection.scss';
import logo from '../../assets/images/logo.png';

const VideoSection: React.FC = () => {
  const countersInitialized = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Initialize counters animation if not already done
    if (!countersInitialized.current) {
      const counterElements = document.querySelectorAll('.counter-value');
      
      counterElements.forEach(counter => {
        const element = counter as HTMLElement;
        const target = parseInt(element.dataset.target || '0', 10);
        const duration = 2000; // Duration in ms
        const frameDuration = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);
        const increment = target / totalFrames;
        
        let currentCount = 0;
        
        const animateCounter = () => {
          currentCount += increment;
          
          if (currentCount >= target) {
            element.textContent = target.toString();
            countersInitialized.current = true;
          } else {
            element.textContent = Math.floor(currentCount).toString();
            requestAnimationFrame(animateCounter);
          }
        };
        
        // Start animation when element is in viewport
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                animateCounter();
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.5 }
        );
        
        observer.observe(element);
      });
    }
  }, []);

  return (
    <section className="video-section">
      <div className="section-accent-shape"></div>
      <div className="container">
        <div className="section-header text-center">
          <div className="section-logo">
            <img src={logo} alt="United Defense Tactical" />
          </div>
          <div className="section-tag">Our Approach</div>
          <h2>Experience The <span className="highlight">Difference</span></h2>
          <p>See how our tactical training methodology prepares you for real-world scenarios with proven techniques and professional instruction</p>
        </div>
        
        <div className="video-wrapper">
          <div className="video-container">
            <video 
              ref={videoRef}
              poster={placeholderImages.trainingVideo}
              preload="metadata"
              className="training-video"
            >
              <source src="/videos/training-preview.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <button 
              className={`play-button ${isPlaying ? 'playing' : ''}`} 
              onClick={toggleVideo}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4.75C6 4.04777 6.74921 3.55719 7.4 3.8L20.4 9.05C21.0593 9.29698 21.0593 10.203 20.4 10.45L7.4 15.7C6.74921 15.9428 6 15.4522 6 14.75V4.75Z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3.46776C17.4817 4.20411 18.5 5.73314 18.5 7.5C18.5 9.26686 17.4817 10.7959 16 11.5322M18 16.7664C19.5115 17.4503 20.5 18.8066 20.5 20.5M2 20.5C2 18.1803 3.31339 16.1816 5.22185 15.3367C6.51443 14.7693 7.96038 14.5 9.5 14.5C11.0396 14.5 12.4856 14.7693 13.7782 15.3367C15.6866 16.1816 17 18.1803 17 20.5M15 7.5C15 9.98528 12.5376 12 9.5 12C6.46243 12 4 9.98528 4 7.5C4 5.01472 6.46243 3 9.5 3C12.5376 3 15 5.01472 15 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-number">
              <span className="counter-value" data-target="5000">0</span>+
            </div>
            <div className="stat-label">Trained Students</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 8L9 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12L15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-number">
              <span className="counter-value" data-target="24">0</span>
            </div>
            <div className="stat-label">Training Programs</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 18L12 14L16 18M16 8L12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-number">
              <span className="counter-value" data-target="65">0</span>
            </div>
            <div className="stat-label">Years Experience</div>
          </div>
        </div>
        
        <div className="section-cta">
          <a href="#programs" className="btn btn-primary">Find Your Ideal Program</a>
        </div>
      </div>
    </section>
  );
};

export default VideoSection; 