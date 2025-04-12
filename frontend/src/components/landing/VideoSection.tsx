import React, { useEffect, useRef, useState } from 'react';
import './VideoSection.scss';
import videoPoster from '../../assets/images/udt5.jpg';

interface CountyStats {
  name: string;
  population: number;
  totalCrimes: number;
  dailyAverage: number;
}

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overviewSlide, setOverviewSlide] = useState(0);
  const [countySlide, setCountySlide] = useState(0);
  const [firstFrameCapture, setFirstFrameCapture] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const countyRef = useRef<HTMLDivElement>(null);

  const countyStats: CountyStats[] = [
    {
      name: 'Orange County',
      population: 3161829,
      totalCrimes: 12453,
      dailyAverage: 34
    },
    {
      name: 'Riverside County',
      population: 2400000,
      totalCrimes: 9876,
      dailyAverage: 27
    },
    {
      name: 'Los Angeles County',
      population: 10000000,
      totalCrimes: 45678,
      dailyAverage: 125
    }
  ];

  const totalPopulation = countyStats.reduce((sum, county) => sum + county.population, 0);
  const totalCrimes = countyStats.reduce((sum, county) => sum + county.totalCrimes, 0);
  const averageDailyCrimes = Math.round(totalCrimes / 365);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

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

  const nextOverviewSlide = () => {
    setOverviewSlide((prev) => (prev + 1) % 3);
  };

  const prevOverviewSlide = () => {
    setOverviewSlide((prev) => (prev - 1 + 3) % 3);
  };

  const nextCountySlide = () => {
    setCountySlide((prev) => (prev + 1) % 3);
  };

  const prevCountySlide = () => {
    setCountySlide((prev) => (prev - 1 + 3) % 3);
  };

  const handleOverviewTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const diff = startX - touch.clientX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextOverviewSlide();
        } else {
          prevOverviewSlide();
        }
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleCountyTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const diff = startX - touch.clientX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextCountySlide();
        } else {
          prevCountySlide();
        }
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Auto-advance carousels
  useEffect(() => {
    const overviewTimer = setInterval(nextOverviewSlide, 5000);
    const countyTimer = setInterval(nextCountySlide, 5000);
    
    return () => {
      clearInterval(overviewTimer);
      clearInterval(countyTimer);
    };
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Capture first frame when video metadata loads
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const captureFirstFrame = () => {
      if (isMobile && video.readyState >= 2) {
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current frame (first frame) to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/jpeg');
        setFirstFrameCapture(dataURL);
      }
    };
    
    // Listen for loadeddata event to capture first frame
    video.addEventListener('loadeddata', captureFirstFrame);
    
    return () => {
      video.removeEventListener('loadeddata', captureFirstFrame);
    };
  }, [isMobile]);

  return (
    <section className="video-section">
      <div className="container">
        <div className="section-header">
          <h2>About Us</h2>
          <p>See what makes us different</p>
        </div>

        <div className="video-container">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              className="training-video"
              playsInline
              preload="metadata"
              poster={isMobile && firstFrameCapture ? firstFrameCapture : videoPoster}
            >
              <source src={`${process.env.PUBLIC_URL}/assets/videos/ty.mp4`} type="video/mp4" />
              <source src={`${process.env.PUBLIC_URL}/assets/videos/ty.webm`} type="video/webm" />
              Your browser does not support the video tag.
            </video>
            
            {/* Hidden canvas for capturing the first frame */}
            <canvas 
              ref={canvasRef} 
              style={{ display: 'none' }} 
            />
            
            <div className="video-overlay" onClick={toggleVideo}>
              <button className={`play-button ${isPlaying ? 'playing' : ''}`}>
                {isPlaying ? <span>⏸</span> : <span>▶</span>}
              </button>
            </div>
            
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stats-panel">
          <div className="panel-header">
            <h3>Crime Statistics Overview</h3>
            <p>Recent data from major counties in Southern California</p>
            <div className="slide-counter">
              {overviewSlide + 1} / 3
            </div>
          </div>
          
          <div className="stats-overview-container">
            <div className="carousel-controls">
              <button className="carousel-control prev" onClick={prevOverviewSlide}>
                <span>◀</span>
              </button>
              <button className="carousel-control next" onClick={nextOverviewSlide}>
                <span>▶</span>
              </button>
            </div>
            
            <div 
              className="stats-overview" 
              ref={overviewRef}
              onTouchStart={handleOverviewTouchStart}
            >
              <div 
                className="overview-track" 
                style={{ transform: `translateX(-${overviewSlide * 33.333}%)` }}
              >
                <div className="overview-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Total Population</span>
                    <span className="card-value">{formatNumber(totalPopulation)}</span>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Total Violent Crimes</span>
                    <span className="card-value">{formatNumber(totalCrimes)}</span>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Daily Average</span>
                    <span className="card-value">{formatNumber(averageDailyCrimes)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="county-stats-container">
            <h4>County Breakdown</h4>
            <div className="slide-counter">
              {countySlide + 1} / 3
            </div>
            
            <div className="carousel-controls">
              <button className="carousel-control prev" onClick={prevCountySlide}>
                <span>◀</span>
              </button>
              <button className="carousel-control next" onClick={nextCountySlide}>
                <span>▶</span>
              </button>
            </div>
            
            <div 
              className="county-cards" 
              ref={countyRef}
              onTouchStart={handleCountyTouchStart}
            >
              <div 
                className="county-track" 
                style={{ transform: `translateX(-${countySlide * 33.333}%)` }}
              >
                {countyStats.map((county, index) => (
                  <div key={index} className="county-card">
                    <div className="county-header">
                      <h5>{county.name}</h5>
                      <div className="crime-rate">
                        <span className="rate-value">{county.dailyAverage}</span>
                        <span className="rate-label">crimes per day</span>
                      </div>
                    </div>
                    <div className="county-details">
                      <div className="detail-item">
                        <span className="detail-label">Population</span>
                        <span className="detail-value">{formatNumber(county.population)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Crimes</span>
                        <span className="detail-value">{formatNumber(county.totalCrimes)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection; 
