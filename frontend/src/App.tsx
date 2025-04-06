import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.scss';

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
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Send page view to analytics
    if (process.env.NODE_ENV === 'production') {
      // Example analytics call
      // analytics.pageView(location.pathname);
      console.log('Page view:', location.pathname);
    }
  }, [location]);
  
  return null;
};

function App() {
  // Prefetch other routes after component mounts
  useEffect(() => {
    prefetchRoutes();
  }, []);
  
  return (
    <BrowserRouter>
      <RouteChangeHandler />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
