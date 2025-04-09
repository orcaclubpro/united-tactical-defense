import React, { useEffect, useRef, useState } from 'react';
import './VideoSection.scss';

interface CountyStats {
  name: string;
  population: number;
  totalCrimes: number;
  dailyAverage: number;
}

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overviewSlide, setOverviewSlide] = useState(0);
  const [countySlide, setCountySlide] = useState(0);
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

  return (
    <section className="video-section">
      <div className="container">
        <div className="section-header">
          <h2>Training Overview</h2>
          <p>Watch our comprehensive training video and explore the statistics that drive our mission</p>
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
                    <span>👥</span>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Total Population</span>
                    <span className="card-value">{formatNumber(totalPopulation)}</span>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">
                    <span>⚠️</span>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Total Violent Crimes</span>
                    <span className="card-value">{formatNumber(totalCrimes)}</span>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">
                    <span>📈</span>
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
