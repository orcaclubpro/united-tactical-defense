import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/landing';
import Dashboard from './components/dashboard';
import FormDemo from './components/Form/FormDemo';
import { GlobalFormProvider } from './components/Form/GlobalTrigger';
import { AdminLayout } from './components/Admin';
import ABTestingDashboard from './pages/admin/ABTestingDashboard';
import { setupConnectionListeners, processQueuedSubmissions } from './services/api';
import './App.scss';

function App() {
  // Initialize connection listeners and process any queued submissions on startup
  useEffect(() => {
    // Set up connection listeners for online/offline events
    setupConnectionListeners(
      // Online callback - process any queued form submissions
      () => {
        console.log('App is online - processing any queued submissions');
        processQueuedSubmissions();
      },
      // Offline callback
      () => {
        console.log('App is offline - form submissions will be queued');
      }
    );
    
    // Check for any queued submissions on app startup
    processQueuedSubmissions();
  }, []);

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
      </BrowserRouter>
    </GlobalFormProvider>
  );
}

export default App;
