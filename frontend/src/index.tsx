import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { detectImageSupport, createLazyImageObserver } from './utils/imageUtils';

// Lazy load the App component
const App = lazy(() => import('./App'));

// Add preconnect and preload links for critical resources
const addResourceHints = () => {
  // Add preconnect for API domain
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
  document.head.appendChild(preconnect);
  
  // Add DNS-prefetch as fallback
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
  document.head.appendChild(dnsPrefetch);
  
  // Add preload for critical fonts
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.as = 'font';
  fontPreload.href = '/fonts/main-font.woff2';
  fontPreload.type = 'font/woff2';
  fontPreload.crossOrigin = 'anonymous';
  document.head.appendChild(fontPreload);
};

// Initialize performance optimizations
const initOptimizations = () => {
  // Detect image format support
  detectImageSupport();
  
  // Setup lazy loading for images
  createLazyImageObserver();
  
  // Add resource hints
  addResourceHints();
};

// Run optimizations before mounting app
initOptimizations();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);

// Send performance metrics to analytics
reportWebVitals((metric) => {
  // Log to console during development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // You can also send to your analytics service
  // Example: sendToAnalytics(metric);
});
