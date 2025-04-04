import React, { useEffect, useRef, useState } from 'react';
import './VideoSection.scss';

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const countersInitialized = useRef(false);

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
    // Initialize counter animations when they come into view
    if (!countersInitialized.current) {
      const counterElements = document.querySelectorAll('.counter-value');
      
      counterElements.forEach(counter => {
        const element = counter as HTMLElement;
        const target = parseInt(element.dataset.target || '0', 10);
        const duration = 2000;
        const frameDuration = 1000 / 60;
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
        
        // Start animation when element comes into viewport
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
      <div className="container">
        {/* Video Section Heading */}
        <div className="video-section-heading">
          <h2>TACTICAL TRAINING <span className="text-highlight">IN ACTION</span></h2>
          <div className="heading-accent"></div>
          <p>Experience our elite training methodology in real-world scenarios</p>
        </div>
        
        {/* Main Video Display */}
        <div className="video-showcase">
          <div className="video-frame">
            <div className="video-container">
              {/* Video Element */}
              <video
                ref={videoRef}
                className="training-video"
                playsInline
                poster={`${process.env.PUBLIC_URL}/assets/images/video-poster.jpg`}
              >
                <source src={`${process.env.PUBLIC_URL}/assets/images/ty.MOV`} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
              
              <div className="video-overlay"></div>
              
              {/* Play/Pause Button */}
              <button 
                className={`video-play-button ${isPlaying ? 'playing' : ''}`}
                onClick={toggleVideo}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <span className="play-icon"></span>
                <span className="pulse"></span>
              </button>
            </div>
            
            {/* Video Caption */}
            <div className="video-caption">
              <div className="caption-badge">EXCLUSIVE TRAINING</div>
              <h3>Master tactical defense in high-stress environments</h3>
            </div>
          </div>
        </div>
        
        {/* Key Features Section */}
        <div className="features-section">
          <div className="features-header">
            <h2>PREPARED FOR <span className="text-highlight">REALITY</span></h2>
            <div className="heading-accent"></div>
            <p>KEY TRAINING BENEFITS</p>
          </div>
          
          <div className="feature-cards">
            {/* Feature Card 1 */}
            <div className="feature-card" data-aos="fade-up" data-aos-duration="300" data-aos-delay="100">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div className="feature-content">
                <h3>Rapid Response Training</h3>
                <p>Develop split-second decision making skills for high-pressure situations.</p>
                <div className="feature-stat">
                  <span className="counter-value" data-target="24">24</span>
                  <span className="unit">seconds</span>
                  <span className="context">average response time after training</span>
                </div>
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="feature-card" data-aos="fade-up" data-aos-duration="300" data-aos-delay="200">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v8"></path>
                  <path d="M8 12h8"></path>
                </svg>
              </div>
              <div className="feature-content">
                <h3>Precision Under Pressure</h3>
                <p>Master techniques that dramatically improve accuracy in stressful scenarios.</p>
                <div className="feature-stat">
                  <span className="counter-value" data-target="77">77</span>
                  <span className="unit">%</span>
                  <span className="context">accuracy improvement with our training</span>
                </div>
              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="feature-card" data-aos="fade-up" data-aos-duration="300" data-aos-delay="300">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"></path>
                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                  <circle cx="12" cy="10" r="4"></circle>
                </svg>
              </div>
              <div className="feature-content">
                <h3>Tactical Readiness</h3>
                <p>Comprehensive training to protect yourself and others in threatening situations.</p>
                <div className="feature-stat">
                  <span className="counter-value" data-target="55">55</span>
                  <span className="unit">%</span>
                  <span className="context">more confident in crisis situations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection; 