import React, { useState, useEffect } from 'react';
import scheduleImage from '../../assets/images/schedule.jpeg';
import { FreeLessonFormController } from '../Form';
import './FreeClass.scss';

const FreeClass: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userClosedModal, setUserClosedModal] = useState<boolean>(false);
  
  // Check if device is mobile and open modal automatically
  useEffect(() => {
    // More reliable mobile detection
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
             window.innerWidth <= 768;
    };

    const checkMobileAndOpenModal = () => {
      if (isMobileDevice() && !isModalOpen && !userClosedModal) {
        // Use setTimeout to ensure this happens after initial render
        setTimeout(() => {
          setIsModalOpen(true);
          document.body.classList.add('modal-open');
        }, 500);
      }
    };

    // Initial check
    checkMobileAndOpenModal();

    // Add resize listener
    window.addEventListener('resize', checkMobileAndOpenModal);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobileAndOpenModal);
    };
  }, [isModalOpen, userClosedModal]);
  
  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
    // Reset the user closed flag when manually opening
    setUserClosedModal(false);
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