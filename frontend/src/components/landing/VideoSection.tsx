import React, { useEffect, useRef, useState } from 'react';
import './VideoSection.scss';

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeProgressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChanging, setIsChanging] = useState(true);
  const countersInitialized = useRef(false);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    const progressElement = timeProgressRef.current;
    
    // Update time progress bar during video playback
    const updateTimeProgress = () => {
      if (videoElement && progressElement) {
        const percentage = (videoElement.currentTime / videoElement.duration) * 100;
        progressElement.style.width = `${percentage}%`;
      }
    };
    
    // Handle video loading events
    const handleLoadStart = () => setIsChanging(true);
    const handleCanPlay = () => setIsChanging(false);
    
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateTimeProgress);
      videoElement.addEventListener('loadstart', handleLoadStart);
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('waiting', handleLoadStart);
      videoElement.addEventListener('playing', handleCanPlay);
      
      // Reset progress bar when video ends
      videoElement.addEventListener('ended', () => {
        setIsPlaying(false);
        if (progressElement) {
          progressElement.style.width = '0%';
        }
      });
    }
    
    // Clean up event listeners
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', updateTimeProgress);
        videoElement.removeEventListener('loadstart', handleLoadStart);
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('waiting', handleLoadStart);
        videoElement.removeEventListener('playing', handleCanPlay);
        videoElement.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, []);

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
      <div className="industrial-grid-overlay"></div>
      <div className="container">
        {/* Video Section Heading */}
        <div className="video-section-heading">
          <div className="section-label">TRAINING SHOWCASE</div>
          <h2>TACTICAL TRAINING <span className="text-highlight">IN ACTION</span></h2>
          <div className="heading-accent"></div>
          <p>Experience our elite training methodology in real-world scenarios</p>
        </div>
        
        {/* Main Video Display */}
        <div className="video-showcase">
          <div className="video-frame">
            <div className="tech-corner top-left"></div>
            <div className="tech-corner top-right"></div>
            <div className="tech-corner bottom-left"></div>
            <div className="tech-corner bottom-right"></div>
            
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
                className={`video-play-button ${isPlaying ? 'playing' : ''} ${isChanging ? 'changing' : ''}`}
                onClick={toggleVideo}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <svg className="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isPlaying ? (
                    <>
                      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                    </>
                  ) : (
                    <path d="M6 4.75C6 4.04777 6.74921 3.55719 7.4 3.8L20.4 9.05C21.0593 9.29698 21.0593 10.203 20.4 10.45L7.4 15.7C6.74921 15.9428 6 15.4522 6 14.75V4.75Z" fill="currentColor" />
                  )}
                </svg>
                <span className="pulse"></span>
              </button>
              
              <div className="video-time-indicator">
                <div className="time-bar">
                  <div ref={timeProgressRef} className="time-progress"></div>
                </div>
                <div className="time-label">TRAINING FOOTAGE</div>
              </div>
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
            <div className="section-label">PERFORMANCE METRICS</div>
            <h2>PREPARED FOR <span className="text-highlight">REALITY</span></h2>
            <div className="heading-accent"></div>
            <p>KEY TRAINING BENEFITS</p>
          </div>
          
          <div className="feature-cards">
            {/* Feature Card 1 */}
            <div className="feature-card" data-aos="fade-up" data-aos-duration="300" data-aos-delay="100">
              <div className="card-indicator"></div>
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
              <div className="card-indicator"></div>
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
              <div className="card-indicator"></div>
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