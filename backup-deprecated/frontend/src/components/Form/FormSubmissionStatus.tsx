import React from 'react';
import styled from 'styled-components';
import { FormSubmissionProgress } from '../../services/api';

// Updated props interface
interface FormSubmissionStatusProps {
  status: 'idle' | 'submitting' | 'success' | 'error' | 'retrying';
  progress: number;
  error?: Error | string;
  currentAttempt?: number;
  maxAttempts?: number;
  onRetry?: () => void;
  onClose?: () => void;
  isOffline?: boolean;
  serverResponse?: any;
  showServerResponse?: boolean;
}

const StatusContainer = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.3s ease;

  &.submitting {
    background-color: #e6f7ff;
  }

  &.success {
    background-color: #f6ffed;
  }

  &.error {
    background-color: #fff2f0;
  }

  &.retrying {
    background-color: #fffbe6;
  }
`;

const StatusMessage = styled.div`
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;

  &.submitting {
    color: #1890ff;
  }

  &.success {
    color: #52c41a;
  }

  &.error {
    color: #f5222d;
  }

  &.retrying {
    color: #faad14;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #1890ff;
  transition: width 0.3s ease;

  &.success {
    background-color: #52c41a;
  }

  &.error {
    background-color: #f5222d;
  }

  &.retrying {
    background-color: #faad14;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &.primary {
    background-color: #1890ff;
    color: white;
    border: none;
    
    &:hover {
      background-color: #40a9ff;
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: #8c8c8c;
    border: 1px solid #d9d9d9;
    
    &:hover {
      background-color: #f5f5f5;
      border-color: #8c8c8c;
    }
  }
`;

const AttemptCounter = styled.div`
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
`;

const ErrorMessage = styled.div`
  font-size: 12px;
  color: #f5222d;
  margin-top: 8px;
  text-align: center;
  max-width: 100%;
  overflow-wrap: break-word;
`;

const OfflineIndicator = styled.div`
  background-color: #fffbe6;
  border: 1px solid #faad14;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 12px;
  font-size: 13px;
  color: #876800;
  display: flex;
  align-items: center;
  width: 100%;

  &::before {
    content: "⚠️";
    margin-right: 8px;
  }
`;

const ResponseContainer = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 4px;
  background-color: #f9f9f9;
  width: 100%;
  border: 1px solid #e0e0e0;
`;

const ResponseTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
`;

const ResponseItem = styled.div`
  display: flex;
  margin-bottom: 6px;
  font-size: 13px;
  
  .key {
    font-weight: 500;
    min-width: 100px;
    color: #666;
  }
  
  .value {
    flex: 1;
    word-break: break-word;
  }
`;

const FormSubmissionStatus: React.FC<FormSubmissionStatusProps> = ({ 
  status, 
  progress, 
  error, 
  currentAttempt, 
  maxAttempts, 
  onRetry, 
  onClose,
  isOffline = false,
  serverResponse,
  showServerResponse = false
}) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'idle':
        return 'Ready to submit';
      case 'submitting':
        return isOffline 
          ? 'Queuing form for later submission...' 
          : 'Submitting form...';
      case 'success':
        return isOffline 
          ? 'Form queued for submission when online!' 
          : 'Form submitted successfully!';
      case 'error':
        return 'Failed to submit form';
      case 'retrying':
        return 'Connection issue, retrying submission...';
      default:
        return '';
    }
  };

  const renderErrorDetails = () => {
    if (error && (status === 'error' || status === 'retrying')) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error instanceof Error ? error.message : 'An unknown error occurred';
      
      return <ErrorMessage>{errorMessage}</ErrorMessage>;
    }
    return null;
  };

  const renderServerResponse = () => {
    if (!serverResponse || !showServerResponse || status !== 'success') {
      return null;
    }

    return (
      <ResponseContainer>
        <ResponseTitle>Server Response:</ResponseTitle>
        {serverResponse.status && (
          <ResponseItem>
            <span className="key">Status:</span>
            <span className="value">{serverResponse.status}</span>
          </ResponseItem>
        )}
        {serverResponse.statusText && (
          <ResponseItem>
            <span className="key">Status Text:</span>
            <span className="value">{serverResponse.statusText}</span>
          </ResponseItem>
        )}
        {serverResponse.data && typeof serverResponse.data === 'object' && (
          Object.entries(serverResponse.data).map(([key, value]) => (
            <ResponseItem key={key}>
              <span className="key">{key}:</span>
              <span className="value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </ResponseItem>
          ))
        )}
        {serverResponse.data && typeof serverResponse.data !== 'object' && (
          <ResponseItem>
            <span className="key">Data:</span>
            <span className="value">{String(serverResponse.data)}</span>
          </ResponseItem>
        )}
      </ResponseContainer>
    );
  };

  return (
    <StatusContainer className={status}>
      <StatusMessage className={status}>
        {getStatusMessage()}
      </StatusMessage>
      
      <ProgressBarContainer>
        <ProgressBar 
          width={progress} 
          className={status} 
        />
      </ProgressBarContainer>
      
      {(status === 'submitting' || status === 'retrying') && currentAttempt && maxAttempts && (
        <AttemptCounter>
          Attempt {currentAttempt} of {maxAttempts}
        </AttemptCounter>
      )}
      
      {renderErrorDetails()}
      
      {isOffline && status === 'success' && (
        <OfflineIndicator>
          You're currently offline. Your form will be submitted automatically when you reconnect.
        </OfflineIndicator>
      )}
      
      {renderServerResponse()}
      
      <ButtonContainer>
        {status === 'error' && onRetry && (
          <ActionButton 
            className="primary"
            onClick={onRetry}
            disabled={isOffline}
          >
            Retry
          </ActionButton>
        )}
        
        {(status === 'success' || status === 'error') && onClose && (
          <ActionButton 
            className="secondary"
            onClick={onClose}
          >
            Close
          </ActionButton>
        )}
      </ButtonContainer>
    </StatusContainer>
  );
};

export default FormSubmissionStatus; 