import React from 'react';
import styled from 'styled-components';
import { DistanceResult, getDistanceMessage, formatDistance } from '../../utils/distanceUtils';

interface DistanceWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  distanceResult: DistanceResult | null;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled.div<{ type: 'warning' | 'blocked' | 'success' }>`
  background: #2a2a2a;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  border: 1px solid ${props => {
    switch (props.type) {
      case 'blocked': return 'rgba(244, 67, 54, 0.3)';
      case 'warning': return 'rgba(255, 193, 7, 0.3)';
      default: return 'rgba(76, 175, 80, 0.3)';
    }
  }};
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin: 20px;
    border-radius: 12px;
  }
`;

const Header = styled.div<{ type: 'warning' | 'blocked' | 'success' }>`
  background: ${props => {
    switch (props.type) {
      case 'blocked': return 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
      case 'warning': return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
      default: return 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)';
    }
  }};
  padding: 24px;
  text-align: center;
  color: white;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Icon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin-bottom: 12px;
  }
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Distance = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Content = styled.div`
  padding: 24px;
  color: #e0e0e0;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Message = styled.p`
  margin: 0 0 20px 0;
  line-height: 1.6;
  font-size: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 16px;
  }
`;

const AddressSection = styled.div`
  background: #1a1a1a;
  padding: 16px;
  border-radius: 10px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  h4 {
    margin: 0 0 8px 0;
    color: #f44336;
    font-size: 1rem;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    color: #a0a0a0;
    font-size: 0.95rem;
    line-height: 1.4;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    margin: 16px 0;
    
    h4 {
      font-size: 0.95rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #b71c1c 0%, #880e0e 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(183, 28, 28, 0.2);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(183, 28, 28, 0.3);
    }
  ` : `
    background: transparent;
    color: #a0a0a0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #e0e0e0;
    }
  `}
  
  &:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 0.95rem;
  }
`;

const ContactInfo = styled.div`
  background: rgba(244, 67, 54, 0.1);
  padding: 16px;
  border-radius: 10px;
  margin: 20px 0;
  border: 1px solid rgba(244, 67, 54, 0.2);
  text-align: center;
  
  h4 {
    margin: 0 0 12px 0;
    color: #f44336;
    font-size: 1rem;
  }
  
  p {
    margin: 0 0 8px 0;
    color: #e0e0e0;
    font-size: 0.95rem;
    
    &:last-child {
      margin: 0;
    }
  }
  
  a {
    color: #f44336;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    margin: 16px 0;
    
    h4 {
      font-size: 0.95rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const DistanceWarningModal: React.FC<DistanceWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  distanceResult
}) => {
  if (!distanceResult) return null;

  const messageData = getDistanceMessage(distanceResult);
  const isBlocked = distanceResult.isBlocked;
  const isWarning = distanceResult.requiresWarning;

  const getIcon = () => {
    if (isBlocked) return '🚗';
    if (isWarning) return '⚠️';
    return '✅';
  };

  const getType = (): 'warning' | 'blocked' | 'success' => {
    if (isBlocked) return 'blocked';
    if (isWarning) return 'warning';
    return 'success';
  };

  return (
    <Overlay isOpen={isOpen}>
      <ModalContainer type={getType()}>
        <Header type={getType()}>
          <Icon>{getIcon()}</Icon>
          <Title>{messageData.title}</Title>
          <Distance>
            {formatDistance(distanceResult.distance)} away
            {distanceResult.userCity && ` from ${distanceResult.userCity}`}
          </Distance>
        </Header>
        
        <Content>
          <Message>{messageData.message}</Message>
          
          <AddressSection>
            <h4>Our Location</h4>
            <p>{distanceResult.businessAddress}</p>
          </AddressSection>

          {isBlocked && (
            <ContactInfo>
              <h4>We'd Still Love to Help!</h4>
              <p>Phone: <a href="tel:+16572760457">(657) 276-0457</a></p>
              <p>Email: <a href="mailto:anaheimhills@uniteddefensetactical.com">anaheimhills@uniteddefensetactical.com</a></p>
              <p>Let's discuss training options in your area.</p>
            </ContactInfo>
          )}

          <ButtonContainer>
            {isBlocked ? (
              <>
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                  Confirm
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={onClose}>
                  Go Back
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                  Confirm
                </Button>
              </>
            )}
          </ButtonContainer>
        </Content>
      </ModalContainer>
    </Overlay>
  );
};

export default DistanceWarningModal;