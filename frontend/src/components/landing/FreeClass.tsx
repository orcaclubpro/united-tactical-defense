import React, { useState, useEffect } from 'react';
import scheduleImage from '../../assets/images/schedule.jpeg';
import UDTTrainingForm from '../Form/UDTTrainingForm';
import './FreeClass.scss';

const FreeClass: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
  };
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);
  
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
      
      <UDTTrainingForm 
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </section>
  );
};

export default FreeClass; 