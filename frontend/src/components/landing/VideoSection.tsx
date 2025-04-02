import React, { useEffect, useRef } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import './VideoSection.scss';

const VideoSection: React.FC = () => {
  const countersInitialized = useRef(false);

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
      <div className="container">
        <header className="section-header">
          <h2>Experience Our Training</h2>
          <p>See what makes our tactical training unique</p>
        </header>
        <div className="video-container">
          <img 
            src={placeholderImages.trainingVideo} 
            alt="Training video placeholder" 
            className="training-video"
          />
        </div>
        <div className="counter-container">
          <div className="counter-item">
            <div className="counter-value" data-target="5000">0</div>
            <div className="counter-label">TRAINED STUDENTS</div>
          </div>
          <div className="counter-item">
            <div className="counter-value" data-target="24">0</div>
            <div className="counter-label">TRAINING PROGRAMS</div>
          </div>
          <div className="counter-item">
            <div className="counter-value" data-target="65">0</div>
            <div className="counter-label">YEARS EXPERIENCE</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection; 