import React, { useEffect } from 'react';
import styled from 'styled-components';

interface UDTTrainingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IframeContainerProps {
  isOpen: boolean;
}

const IframeContainer = styled.div<IframeContainerProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  overflow-y: auto;
  padding: 20px;
`;

const IframeWrapper = styled.div`
  width: 90%;
  max-width: 650px;
  min-height: 632px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  margin: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  width: 36px;
  height: 36px;
  color: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const UDTTrainingForm: React.FC<UDTTrainingFormProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    // Load the UDT Training form script when the component mounts
    const script = document.createElement('script');
    script.src = 'https://go.udttraining.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <IframeContainer isOpen={isOpen} onClick={onClose}>
      <IframeWrapper onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">
          <span aria-hidden="true">×</span>
        </CloseButton>
        <iframe
          src="https://go.udttraining.com/widget/form/TEKBM3ACn5q9MxWAjsL8"
          style={{ width: '100%', height: '100%', border: 'none' }}
          id="inline-TEKBM3ACn5q9MxWAjsL8"
          data-layout="{'id':'INLINE'}"
          data-trigger-type="alwaysShow"
          data-trigger-value=""
          data-activation-type="alwaysActivated"
          data-activation-value=""
          data-deactivation-type="neverDeactivate"
          data-deactivation-value=""
          data-form-name="Lead Capture"
          data-height="632"
          data-layout-iframe-id="inline-TEKBM3ACn5q9MxWAjsL8"
          data-form-id="TEKBM3ACn5q9MxWAjsL8"
          title="Lead Capture"
        />
      </IframeWrapper>
    </IframeContainer>
  );
};

export default UDTTrainingForm; 