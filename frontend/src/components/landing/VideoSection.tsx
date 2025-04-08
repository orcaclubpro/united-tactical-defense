import React, { useEffect, useRef, useState } from 'react';
import './VideoSection.scss';

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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
    
    const updateProgress = () => {
      if (videoElement) {
        const percentage = (videoElement.currentTime / videoElement.duration) * 100;
        setProgress(percentage);
      }
    };
    
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateProgress);
      videoElement.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        videoElement.removeEventListener('timeupdate', updateProgress);
        videoElement.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  const stats = [
    {
      county: 'Orange',
      population: '3,170,435',
      crimes: '10,729',
      daily: '~29.4 per day'
    },
    {
      county: 'Riverside',
      population: '2,529,933',
      crimes: '9,729',
      daily: '~26.7 per day'
    },
    {
      county: 'Los Angeles',
      population: '9,721,138',
      crimes: '32,729',
      daily: '~89.7 per day'
    }
  ];

  return (
    <section className="video-section">
      <div className="container">
        <div className="section-header">
          <h2>HOW WOULD YOU REACT?</h2>
          <p>Understanding the threat landscape in Southern California</p>
        </div>

        <div className="video-container">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              className="training-video"
              playsInline
              poster={`${process.env.PUBLIC_URL}/assets/images/video-poster.jpg`}
            >
              <source src={`${process.env.PUBLIC_URL}/assets/videos/ty.mp4`} type="video/mp4" />
              <source src={`${process.env.PUBLIC_URL}/assets/videos/ty.webm`} type="video/webm" />
              Your browser does not support the video tag.
            </video>
            
            <div className="video-overlay" onClick={toggleVideo}>
              <button 
                className={`play-button ${isPlaying ? 'playing' : ''}`}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isPlaying ? (
                    <>
                      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                    </>
                  ) : (
                    <path d="M6 4.75C6 4.04777 6.74921 3.55719 7.4 3.8L20.4 9.05C21.0593 9.29698 21.0593 10.203 20.4 10.45L7.4 15.7C6.74921 15.9428 6 15.4522 6 14.75V4.75Z" fill="currentColor" />
                  )}
                </svg>
              </button>
            </div>
            
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <h3>{stat.county} County</h3>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="label">Population</span>
                  <span className="value">{stat.population}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Violent Crimes (2024)</span>
                  <span className="value">{stat.crimes}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Daily Average</span>
                  <span className="value">{stat.daily}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection; 
