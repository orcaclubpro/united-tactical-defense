import React, { useState, useEffect, useRef } from 'react';
import scheduleImage from '../../assets/images/schedule.jpeg';
import { FreeLessonFormController } from '../Form';
import './FreeClass.scss';

// Create a global variable to track if the modal has been shown
// This ensures the modal only shows once across all components
let globalModalShown = false;

const FreeClass: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userClosedModal, setUserClosedModal] = useState<boolean>(false);
  const modalInitialized = useRef<boolean>(false);
  
  // Check if device is mobile and open modal automatically - only once
  useEffect(() => {
    // Skip if already initialized, user closed the modal, or modal was already shown globally
    if (modalInitialized.current || userClosedModal || globalModalShown) {
      return;
    }
    
    // More reliable mobile detection
    const isMobileDevice = () => {
      // Check for mobile user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      
      // Check if it's a mobile device based on user agent
      const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
      
      // Check if it's a small screen (mobile-like)
      const isSmallScreen = window.innerWidth <= 768;
      
      // Only consider it a mobile device if both conditions are true
      // This prevents desktop browsers with small windows from triggering the modal
      return isMobileUserAgent && isSmallScreen;
    };
    
    // Only open on mobile devices
    if (isMobileDevice()) {
      // Mark as initialized to prevent duplicate openings
      modalInitialized.current = true;
      globalModalShown = true;
      
      // Use a single timeout to ensure this happens after initial render
      const timer = setTimeout(() => {
        // Check if the modal is already open before setting it
        if (!isModalOpen) {
          setIsModalOpen(true);
          document.body.classList.add('modal-open');
        }
      }, 1000);
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, [userClosedModal, isModalOpen]);
  
  const openModal = () => {
    // Only open if not already open
    if (!isModalOpen) {
      setIsModalOpen(true);
      document.body.classList.add('modal-open');
      // Reset the user closed flag when manually opening
      setUserClosedModal(false);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
    // Set the flag when user manually closes the modal
    setUserClosedModal(true);
  };
  
  return (
    <section id="free-class" className="free-class-section">
      <div className="container">
        <div className="free-class-content">
          <div className="content-text">
            <h2>Experience Our Training Firsthand</h2>
            <p className="lead">Claim your complimentary training session to see if our approach is right for you</p>
            
            <div className="benefits">
              <h3>What to Expect in Your Free Class:</h3>
              <ul>
                <li>Grip, stance, sight picture, trigger control</li>
                <li>Drawing from concealment & commands</li>
                <li>De-escalation & legal considerations</li>
                <li>Real-life threat simulation to test your response under pressure</li>
              </ul>
            </div>
            
            <div className="cta-button">
              <button id="open-free-class-modal" className="btn btn-primary btn-lg" onClick={openModal}>
                Schedule Your Free Class
              </button>
            </div>
          </div>
          
          <div className="content-image">
            <img src={scheduleImage} alt="Training session schedule" />
          </div>
        </div>
      </div>
      
      <FreeLessonFormController 
        isOpen={isModalOpen}
        onClose={closeModal}
        formSource="website-homepage"
      />
    </section>
  );
};

export default FreeClass; 