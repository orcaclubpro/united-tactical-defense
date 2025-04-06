import React, { ReactElement, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface ModernModalUIProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactElement | ReactElement[];
  formType?: 'free-class' | 'assessment' | 'contact' | string;
  showHook?: boolean;
  hookMessage?: string;
  footerContent?: ReactElement | null;
  darkMode?: boolean;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const ModalBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(5px);
  animation: ${props => props.isOpen ? fadeIn : 'none'} 0.3s ease forwards;
`;

const ModalContainer = styled.div<{ isOpen: boolean; darkMode?: boolean }>`
  background-color: ${props => props.darkMode ? '#1e1f21' : 'white'};
  border-radius: 12px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  width: 95%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  position: relative;
  animation: ${props => props.isOpen ? slideUp : 'none'} 0.4s ease forwards;
  overflow: hidden;
  border: ${props => props.darkMode ? '1px solid #333' : 'none'};
`;

const ModalHeader = styled.div<{ darkMode?: boolean }>`
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.darkMode ? '#333' : '#f0f0f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
    display: ${props => props.darkMode ? 'block' : 'none'};
  }
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.darkMode ? '#e0e0e0' : '#1a1a1a'};
  }
`;

const CloseButton = styled.button<{ darkMode?: boolean }>`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 8px;
  color: ${props => props.darkMode ? '#999' : '#666'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#333' : '#f5f5f5'};
    color: ${props => props.darkMode ? '#fff' : '#333'};
  }
`;

const ModalContentWrapper = styled.div`
  overflow-y: auto;
  max-height: calc(85vh - 130px); /* Adjust based on header and potential footer */
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 128, 128, 0.7);
  }
`;

const ModalBody = styled.div<{ darkMode?: boolean }>`
  padding: 24px;
  background-color: ${props => props.darkMode ? '#1e1f21' : 'white'};
  color: ${props => props.darkMode ? '#e0e0e0' : 'inherit'};
`;

const ModalFooter = styled.div<{ darkMode?: boolean }>`
  padding: 16px 24px;
  border-top: 1px solid ${props => props.darkMode ? '#333' : '#f0f0f0'};
  background-color: ${props => props.darkMode ? '#2c2d30' : '#f8f8f8'};
`;

const HookBanner = styled.div<{ darkMode?: boolean }>`
  background: ${props => props.darkMode 
    ? 'linear-gradient(135deg, #b71c1c, #880e0e)' 
    : 'linear-gradient(135deg, #007bff, #0056b3)'};
  color: white;
  padding: 12px 24px;
  text-align: center;
  font-weight: 500;
  animation: ${pulse} 2s infinite ease-in-out;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

/**
 * ModernModalUI component provides an enhanced modal experience with animations
 * and visual hooks for improved user engagement.
 */
const ModernModalUI: React.FC<ModernModalUIProps> = ({
  isOpen,
  onClose,
  title,
  children,
  formType = 'free-class',
  showHook = false,
  hookMessage = 'Limited spots available for this week!',
  footerContent = null,
  darkMode = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Delay hiding to allow for animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Restore body scrolling when modal is closed
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
    
    // Cleanup function to ensure body scrolling is restored
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
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
  
  if (!isVisible && !isOpen) {
    return null;
  }
  
  return (
    <ModalBackdrop isOpen={isOpen} onClick={onClose}>
      <ModalContainer 
        isOpen={isOpen} 
        darkMode={darkMode}
        onClick={(e) => e.stopPropagation()}
      >
        {showHook && (
          <HookBanner darkMode={darkMode}>
            {hookMessage}
          </HookBanner>
        )}
        
        <ModalHeader darkMode={darkMode}>
          <h2>{title}</h2>
          <CloseButton darkMode={darkMode} onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </CloseButton>
        </ModalHeader>
        
        <ModalContentWrapper>
          <ModalBody darkMode={darkMode}>
            {children}
          </ModalBody>
        </ModalContentWrapper>
        
        {footerContent && (
          <ModalFooter darkMode={darkMode}>
            {footerContent}
          </ModalFooter>
        )}
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default ModernModalUI; 