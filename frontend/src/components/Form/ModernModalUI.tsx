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
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Styled Components
const ModalBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(8px);
  animation: ${props => props.isOpen ? fadeIn : 'none'} 0.3s ease forwards;
`;

const ModalContainer = styled.div<{ isOpen: boolean; darkMode?: boolean }>`
  background-color: ${props => props.darkMode ? '#1e1f21' : 'white'};
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  width: 90%;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  position: relative;
  animation: ${props => props.isOpen ? slideUp : 'none'} 0.4s ease forwards;
  overflow: hidden;
  border: ${props => props.darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'};
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    width: 95%;
    max-height: 80vh;
  }
`;

const ModalHeader = styled.div<{ darkMode?: boolean }>`
  padding: 12px 20px;
  border-bottom: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.08)' : '#f0f0f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  background: ${props => props.darkMode ? 'linear-gradient(to right, #1e1f21, #2a2b2e)' : 'white'};
  
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
  
  .header-content {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    
    .logo-container {
      display: flex;
      align-items: center;
      margin-right: 10px;
      
      img {
        width: 24px;
        height: 24px;
        margin-right: 8px;
        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
      }
    }
    
    h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: ${props => props.darkMode ? '#ffffff' : '#1a1a1a'};
      letter-spacing: -0.5px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .form-title {
      font-size: 1rem;
      font-weight: 500;
      color: #b71c1c;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding-left: 12px;
      margin-left: 12px;
      border-left: 2px solid rgba(183, 28, 28, 0.3);
    }
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    
    .header-content {
      .logo-container {
        margin-right: 8px;
        
        img {
          width: 20px;
          height: 20px;
          margin-right: 6px;
        }
      }
      
      h2 {
        font-size: 1.1rem;
      }
      
      .form-title {
        font-size: 0.85rem;
        padding-left: 8px;
        margin-left: 8px;
      }
    }
  }
`;

const CloseButton = styled.button<{ darkMode?: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.6)' : '#666'};
  font-size: 20px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.darkMode ? '#fff' : '#333'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  }
  
  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    font-size: 18px;
  }
`;

const ModalContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  position: relative;
  
  /* Custom scrollbar for webkit browsers */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(183, 28, 28, 0.5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(183, 28, 28, 0.7);
  }
`;

const ModalBody = styled.div<{ darkMode?: boolean }>`
  padding: 24px 28px;
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  
  /* Add some spacing at the top of the form content */
  > div:first-child {
    margin-top: 10px;
  }
`;

const ModalFooter = styled.div<{ darkMode?: boolean }>`
  padding: 20px 28px;
  border-top: 1px solid ${props => props.darkMode ? 'rgba(255, 255, 255, 0.08)' : '#f0f0f0'};
  background: ${props => props.darkMode ? 'linear-gradient(to right, #1e1f21, #2a2b2e)' : 'white'};
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
    display: ${props => props.darkMode ? 'block' : 'none'};
  }
`;

const HookBanner = styled.div<{ darkMode?: boolean }>`
  background: ${props => props.darkMode 
    ? 'linear-gradient(135deg, #b71c1c, #880e0e)' 
    : 'linear-gradient(135deg, #007bff, #0056b3)'};
  color: white;
  padding: 10px 20px;
  text-align: center;
  font-weight: 500;
  animation: ${pulse} 3s infinite ease-in-out;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  letter-spacing: 0.3px;
  font-size: 0.95rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
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
          <div className="header-content">
            <div className="logo-container">
              <img src="/favicon.ico" alt="UDT Logo" />
            </div>
            <h2>{title}</h2>
            {formType === 'free-class' && <div className="form-title">Claim Your Free Class</div>}
          </div>
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