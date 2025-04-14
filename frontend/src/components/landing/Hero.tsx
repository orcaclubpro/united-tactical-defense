import React, { useEffect, useRef } from "react";
import "./Hero.scss";

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Only run this effect if the video element exists
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // Handle Instagram and other problematic browsers
    const playVideo = () => {
      // Ensure video is set to muted to help with autoplay
      video.muted = true;
      
      video.play()
        .then(() => {
          // Optionally seek to a specific time
          video.currentTime = 11;
        })
        .catch((err) => {
          console.log("Auto-play was prevented:", err);
        });
    };
    
    // Detect if running in Instagram browser
    const isInstagramBrowser = 
      navigator.userAgent.includes('Instagram') || 
      window.location.href.includes('instagram');
    
    // Try playing initially
    playVideo();
    
    // Try playing when visibility changes (useful for Instagram browser)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        playVideo();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Try playing on user interaction (fallback)
    const handleInteraction = () => {
      playVideo();
      // Remove listeners after successful interaction
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
    
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('click', handleInteraction);
    
    // Special handling for Instagram browser with timers
    if (isInstagramBrowser) {
      // For Instagram browser - try with a slight delay
      setTimeout(playVideo, 500);
      
      // Try again after a longer delay
      setTimeout(playVideo, 2000);
      
      // Add a play button overlay for Instagram users if autoplay fails
      setTimeout(() => {
        // Check if video is playing
        if (video.paused) {
          const videoContainer = video.parentElement;
          if (!videoContainer) return;
          
          // Check if overlay already exists
          if (!document.querySelector('.instagram-play-button')) {
            // Create play button overlay
            const playButton = document.createElement('div');
            playButton.className = 'instagram-play-button';
            playButton.innerHTML = '▶';
            playButton.style.cssText = `
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(0,0,0,0.5);
              color: white;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              cursor: pointer;
              z-index: 10;
            `;
            
            // Add click event listener
            playButton.addEventListener('click', () => {
              playVideo();
              playButton.style.display = 'none';
            });
            
            videoContainer.appendChild(playButton);
          }
        }
      }, 3000);
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  const openFreeClassModal = () => {
    const openModalButton = document.getElementById("open-free-class-modal");
    if (openModalButton) {
      openModalButton.click();
    }
  };

  return (
    <section className="hero">
      <div className="hero-video-container">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="auto"
          className="hero-video"
        >
          <source src="/assets/videos/ty.mp4" type="video/mp4" />
          <source src="/assets/videos/ty.webm" type="video/webm" />
          <source src={`https://${window.location.host}/assets/videos/ty.mp4`} type="video/mp4" />
          <img src="/assets/images/hero-fallback.jpg" alt="Tactical training" />
        </video>
      </div>
      <div className="container hero-container">
        <div className="hero-content">
          <h1>REALITY-BASED TACTICAL TRAINING FOR REAL-WORLD DEFENSE</h1>
          <p className="hero-tagline">
            Train your survival mentality in a safe and engaging dry fire facility
          </p>
          <ul className="hero-benefits">
            <li>
              Awareness: We teach situational awareness to help clients
              recognize and avoid threats before they happen—key to staying
              safe.
            </li>
            <li>
              Confidence: Our reality-based training builds true confidence
              under pressure, so clients feel ready and in control.
            </li>
            <li>
              Empower: We empower everyday people with the skills to protect
              themselves and others—strength through preparation.
            </li>
          </ul>
          <div className="cta-buttons">
            <button onClick={openFreeClassModal} className="btn btn-red btn-lg">
              BOOK FREE CLASS
            </button>
            <a
              href="#programs"
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("programs")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              VIEW PROGRAMS
            </a>
          </div>
        </div>
        <div className="hero-logo">
          <img
            src="/assets/images/logo.png"
            alt="United Tactical Defense Logo"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
