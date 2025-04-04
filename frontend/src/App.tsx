import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/landing';
import Dashboard from './components/dashboard';
import FormDemo from './components/Form/FormDemo';
import { GlobalFormProvider } from './components/Form/GlobalTrigger';
import { AdminLayout } from './components/Admin';
import ABTestingDashboard from './pages/admin/ABTestingDashboard';
import { setupConnectionListeners, processQueuedSubmissions, isOnline, getSubmissionQueue } from './services/api';
import ConnectionStatus from './components/Form/ConnectionStatus';
import styled from 'styled-components';
import './App.scss';

// Styled component for the global connection status
const GlobalConnectionStatusWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  opacity: 0.9;
  transition: opacity 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
  }
`;

function App() {
  const [isAppOffline, setIsAppOffline] = useState(!isOnline());
  const [queueCount, setQueueCount] = useState(getSubmissionQueue().length);

  // Initialize connection listeners and process any queued submissions on startup
  useEffect(() => {
    // Set up connection listeners for online/offline events
    setupConnectionListeners(
      // Online callback - process any queued form submissions
      () => {
        console.log('App is online - processing any queued submissions');
        setIsAppOffline(false);
        processQueuedSubmissions();
        updateQueueCount();
      },
      // Offline callback
      () => {
        console.log('App is offline - form submissions will be queued');
        setIsAppOffline(true);
        updateQueueCount();
      }
    );
    
    // Check for any queued submissions on app startup
    processQueuedSubmissions();
    updateQueueCount();
    
    // Set up interval to check queue count regularly
    const queueCheckInterval = setInterval(updateQueueCount, 10000);
    
    // Listen for storage events (for when queue changes in another tab)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(queueCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const updateQueueCount = () => {
    setQueueCount(getSubmissionQueue().length);
  };
  
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'offline_form_submission_queue') {
      updateQueueCount();
    }
  };

  return (
    <GlobalFormProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/form-demo" element={<FormDemo />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="ab-testing" element={<ABTestingDashboard />} />
          </Route>
        </Routes>
        
        {/* Global connection status indicator */}
        {(isAppOffline || queueCount > 0) && (
          <GlobalConnectionStatusWrapper>
            <ConnectionStatus 
              variant={isAppOffline ? 'full' : (queueCount > 0 ? 'minimal' : 'minimal')} 
              showQueuedCount={true}
              className={isAppOffline ? 'highlighted' : ''}
            />
          </GlobalConnectionStatusWrapper>
        )}
      </BrowserRouter>
    </GlobalFormProvider>
  );
}

export default App;
