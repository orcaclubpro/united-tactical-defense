import React, { useState, useEffect } from 'react';
import { 
  isOnline, 
  setupConnectionListeners, 
  getSubmissionQueue,
  processQueuedSubmissions,
  clearSubmissionQueue
} from '../../services/api';
import './ConnectionStatus.scss';

interface ConnectionStatusProps {
  showQueuedCount?: boolean;
  variant?: 'minimal' | 'full';
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showQueuedCount = true,
  variant = 'minimal',
  className = ''
}) => {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [queuedSubmissions, setQueuedSubmissions] = useState<number>(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    // Update initial queue count
    updateQueueCount();

    // Setup listeners for connection changes
    setupConnectionListeners(
      // Online callback
      () => {
        setOnline(true);
        updateQueueCount();
      },
      // Offline callback
      () => {
        setOnline(false);
        updateQueueCount();
      }
    );

    // Listen for storage events (for when queue changes in another tab)
    window.addEventListener('storage', handleStorageChange);

    // Clean up listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateQueueCount = () => {
    const queue = getSubmissionQueue();
    setQueuedSubmissions(queue.length);
  };

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'offline_form_submission_queue') {
      updateQueueCount();
    }
  };

  const handleRetryNow = () => {
    if (online) {
      processQueuedSubmissions();
      // Queue count will update via storage event or we can force it
      setTimeout(updateQueueCount, 500);
    }
  };

  const handleClearQueue = () => {
    if (window.confirm('Are you sure you want to clear all queued submissions? This cannot be undone.')) {
      clearSubmissionQueue();
      updateQueueCount();
    }
  };

  // If minimal variant and no queued submissions, we might not need to show anything
  if (variant === 'minimal' && queuedSubmissions === 0 && online) {
    return null;
  }

  return (
    <div className={`connection-status ${className} ${online ? 'online' : 'offline'}`}>
      <div className="status-indicator">
        <div className={`status-dot ${online ? 'online' : 'offline'}`} />
        <span className="status-text">{online ? 'Online' : 'Offline'}</span>
        
        {showQueuedCount && queuedSubmissions > 0 && (
          <span className="queued-count" onClick={() => setShowDetails(!showDetails)}>
            {queuedSubmissions} form{queuedSubmissions !== 1 ? 's' : ''} queued
          </span>
        )}
      </div>

      {variant === 'full' && showDetails && queuedSubmissions > 0 && (
        <div className="queued-details">
          <p>
            {queuedSubmissions} form submission{queuedSubmissions !== 1 ? 's' : ''} waiting to be sent.
            {online ? ' They will be submitted automatically.' : ' They will be submitted when you are back online.'}
          </p>
          
          <div className="queued-actions">
            {online && (
              <button 
                className="retry-button" 
                onClick={handleRetryNow}
              >
                Retry Now
              </button>
            )}
            <button 
              className="clear-button" 
              onClick={handleClearQueue}
            >
              Clear Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus; 