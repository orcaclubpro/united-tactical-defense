import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import './App.scss';
import { initializeGA4 } from './utils/analytics';
import useAnalytics from './utils/useAnalytics';
import { app, analytics } from './services/firebase';

// Loading fallback with better user experience
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Lazy load components with prefetching capability
const LandingPage = lazy(() => import('./components/landing').then(module => ({ default: module.LandingPage })));
const Dashboard = lazy(() => import('./components/dashboard'));
const BookingPage = lazy(() => import('./components/booking').then(module => ({ default: module.BookingPage })));

// Prefetch components for upcoming routes
const prefetchRoutes = () => {
  // We can manually trigger prefetching of other routes
  // that are likely to be visited soon
  const prefetchDashboard = () => {
    import('./components/dashboard');
  };
  
  // Prefetch after initial load when idle
  if ('requestIdleCallback' in window) {
    // Use requestIdleCallback in browsers that support it
    window.requestIdleCallback(prefetchDashboard, { timeout: 2000 });
  } else {
    // Fallback to setTimeout for unsupported browsers
    setTimeout(prefetchDashboard, 2000);
  }
};

// Component to handle route change events
const RouteChangeHandler = () => {
  const location = useLocation();
  
  // Use our custom analytics hook with the current path
  useAnalytics(location.pathname);
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
};

function App() {
  // Initialize analytics and prefetch routes after component mounts
  useEffect(() => {
    // Initialize Google Analytics 4
    const measurementId = process.env.REACT_APP_GA4_MEASUREMENT_ID;
    if (measurementId && process.env.NODE_ENV === 'production') {
      // Set the conversion ID for tracking
      window.GA4_CONVERSION_ID = process.env.REACT_APP_GA4_CONVERSION_ID || '';
      
      // Initialize GA4
      initializeGA4(measurementId);
    }
    
    // Prefetch routes
    prefetchRoutes();
  }, []);
  
  // Use analytics hook at the App level (will track traffic sources on mount)
  useAnalytics();
  
  return (
    <BrowserRouter>
      <RouteChangeHandler />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
        <FloatingButton />
      </Suspense>
    </BrowserRouter>
  );
}

function FloatingButton() {
  const location = useLocation();
  
  // Don't show the floating button on the booking page
  if (location.pathname === '/booking') {
    return null;
  }
  
  return (
    <Link to="/booking" className="floating-button">
      Book
    </Link>
  );
}

export default App;
