/**
 * Analytics Tracker Script Generator
 * Generates a JavaScript code snippet to be injected into HTML pages for frontend tracking
 */

const generateTrackerScript = (options = {}) => {
  const {
    apiEndpoint = '/api/analytics',
    trackScrollDepth = true,
    trackClicks = true,
    trackForms = true,
    sessionTimeout = 30,
    sampleRate = 100,
    cookieDomain = '',
    excludePaths = []
  } = options;
  
  return `
  // United Tactical Defense Analytics Tracker
  (function() {
    // Configuration
    const config = {
      apiEndpoint: '${apiEndpoint}',
      trackScrollDepth: ${trackScrollDepth},
      trackClicks: ${trackClicks},
      trackForms: ${trackForms},
      sessionTimeout: ${sessionTimeout},
      sampleRate: ${sampleRate},
      cookieDomain: '${cookieDomain}',
      excludePaths: ${JSON.stringify(excludePaths)}
    };
    
    // Skip tracking for excluded paths
    if (config.excludePaths.some(path => location.pathname.match(new RegExp(path)))) {
      return;
    }
    
    // Skip tracking based on sample rate
    if (Math.random() * 100 > config.sampleRate) {
      return;
    }
    
    // Utility functions
    const getCookie = (name) => {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    
    const setCookie = (name, value, minutes) => {
      let expires = '';
      if (minutes) {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + value + expires + '; path=/';
      if (config.cookieDomain) {
        document.cookie = name + '=' + value + expires + '; path=/; domain=' + config.cookieDomain;
      }
    };
    
    const getQueryParams = () => {
      const params = {};
      const queryString = window.location.search.substring(1);
      
      if (queryString) {
        queryString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
      }
      
      return params;
    };
    
    // Initialize session
    let sessionId = getCookie('utd_session');
    let visitId = null;
    
    // Track current page visit
    const trackPageVisit = () => {
      const isLandingPage = !document.referrer || 
                           !document.referrer.includes(location.hostname);
      
      const queryParams = getQueryParams();
      
      const data = {
        pageUrl: location.pathname,
        referrer: document.referrer,
        utmSource: queryParams.utm_source,
        utmMedium: queryParams.utm_medium,
        utmCampaign: queryParams.utm_campaign,
        sessionId
      };
      
      const endpoint = isLandingPage ? '/track/landing-visit' : '/track/visit';
      
      fetch(config.apiEndpoint + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          visitId = result.visitId;
          
          // Update session if needed
          if (result.sessionId) {
            sessionId = result.sessionId;
            setCookie('utd_session', sessionId, config.sessionTimeout);
          }
          
          // Track engagement after page load is complete
          startEngagementTracking();
        }
      })
      .catch(error => console.error('Analytics error:', error));
    };
    
    // Track engagement metrics
    const startEngagementTracking = () => {
      if (!visitId) return;
      
      let maxScrollDepth = 0;
      let clickCount = 0;
      let formInteractions = 0;
      let engagementTimer = null;
      let lastEngagementTime = Date.now();
      let timeOnPage = 0;
      
      // Function to send engagement data
      const sendEngagementData = () => {
        fetch(config.apiEndpoint + '/track/engagement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visitId,
            timeOnPage: Math.round(timeOnPage),
            scrollDepth: Math.round(maxScrollDepth),
            clickCount,
            formInteractions
          })
        }).catch(error => console.error('Analytics error:', error));
      };
      
      // Update time on page
      const updateTimeOnPage = () => {
        const now = Date.now();
        // Only count time if user was active in the last minute
        if (now - lastEngagementTime < 60000) {
          timeOnPage += (now - lastEngagementTime) / 1000;
        }
        lastEngagementTime = now;
      };
      
      // Scroll depth tracking
      if (config.trackScrollDepth) {
        window.addEventListener('scroll', () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrollDepth = scrollTop / scrollHeight * 100;
          
          if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
          }
          
          lastEngagementTime = Date.now();
        });
      }
      
      // Click tracking
      if (config.trackClicks) {
        document.addEventListener('click', () => {
          clickCount++;
          lastEngagementTime = Date.now();
        });
      }
      
      // Form interaction tracking
      if (config.trackForms) {
        const formElements = document.querySelectorAll('form');
        
        formElements.forEach(form => {
          const inputs = form.querySelectorAll('input, select, textarea');
          
          inputs.forEach(input => {
            input.addEventListener('focus', () => {
              formInteractions++;
              lastEngagementTime = Date.now();
            });
          });
          
          form.addEventListener('submit', e => {
            // Track form submission as a conversion
            const conversionData = {
              formId: form.id || form.action || 'unknown-form',
              formData: Array.from(form.elements)
                .filter(el => el.name && el.type !== 'password')
                .map(el => ({ name: el.name, value: el.value }))
            };
            
            trackConversion('form_submission', 1, conversionData);
          });
        });
      }
      
      // Periodic engagement tracking (every 15 seconds)
      engagementTimer = setInterval(() => {
        updateTimeOnPage();
        sendEngagementData();
      }, 15000);
      
      // Track engagement when page is unloaded
      window.addEventListener('beforeunload', () => {
        clearInterval(engagementTimer);
        updateTimeOnPage();
        
        // Use sendBeacon for better reliability on page exit
        if (navigator.sendBeacon) {
          const blob = new Blob([
            JSON.stringify({
              visitId,
              timeOnPage: Math.round(timeOnPage),
              scrollDepth: Math.round(maxScrollDepth),
              clickCount,
              formInteractions
            })
          ], { type: 'application/json' });
          
          navigator.sendBeacon(config.apiEndpoint + '/track/engagement', blob);
        } else {
          // Fallback to sync XHR if sendBeacon not available
          sendEngagementData();
        }
      });
    };
    
    // Track conversion events
    const trackConversion = (conversionType, conversionValue = 0, conversionData = {}, attributionModel = 'last') => {
      if (!visitId) return;
      
      fetch(config.apiEndpoint + '/track/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visitId,
          conversionType,
          conversionValue,
          conversionData,
          attributionModel
        })
      }).catch(error => console.error('Analytics error:', error));
    };
    
    // Expose tracking API to the global scope
    window.UTDAnalytics = {
      trackEvent: (category, action, label, value = 0) => {
        trackConversion('event', value, { category, action, label });
      },
      trackConversion: trackConversion,
      trackPageView: trackPageVisit
    };
    
    // Start tracking
    trackPageVisit();
  })();
  `;
};

// Function to generate minified version of the tracker script
const generateMinifiedTracker = (options = {}) => {
  const script = generateTrackerScript(options);
  
  // Very basic minification (remove comments, extra spaces, and line breaks)
  return script
    .replace(/\/\/.*$/gm, '')      // Remove single-line comments
    .replace(/\s{2,}/g, ' ')       // Replace 2+ spaces with a single space
    .replace(/[\n\r]/g, '')        // Remove line breaks
    .replace(/\/\*.*?\*\//g, '')   // Remove multi-line comments
    .replace(/\s+([,{}:])/g, '$1') // Remove spaces before commas, braces, and colons
    .replace(/([,{}:])\s+/g, '$1') // Remove spaces after commas, braces, and colons
    .trim();
};

// Function to get the tracker script tag for injection
const getTrackerScriptTag = (options = {}) => {
  const minified = options.minified !== false;
  const script = minified ? generateMinifiedTracker(options) : generateTrackerScript(options);
  
  return `<script>${script}</script>`;
};

module.exports = {
  generateTrackerScript,
  getTrackerScriptTag,
  generateMinifiedTracker
}; 