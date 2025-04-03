/**
 * Event Tracking Middleware
 * Captures HTTP context for event tracking
 * Enhanced for comprehensive form event tracking
 */

const { FormSubmissionEvent } = require('../../core/entities');
const { v4: uuidv4 } = require('uuid');
const url = require('url');

/**
 * Extract page information from URL
 * @param {string} requestUrl - Request URL
 * @param {string} referer - Referer URL 
 * @returns {Object} - Page information
 */
function extractPageInfo(requestUrl, referer) {
  try {
    // Get the page path without query parameters
    const parsedUrl = url.parse(requestUrl);
    const path = parsedUrl.pathname;
    
    // Get the source from referer if available
    let source = 'direct';
    if (referer) {
      const refererUrl = url.parse(referer);
      const refererHost = refererUrl.hostname;
      
      // Check if it's internal or external
      if (refererHost === parsedUrl.hostname) {
        source = 'internal';
      } else {
        // Identify common sources
        if (refererHost && refererHost.includes('google')) {
          source = 'google';
        } else if (refererHost && refererHost.includes('facebook')) {
          source = 'facebook';
        } else if (refererHost && refererHost.includes('twitter')) {
          source = 'twitter';
        } else if (refererHost && refererHost.includes('instagram')) {
          source = 'instagram';
        } else if (refererHost && refererHost.includes('linkedin')) {
          source = 'linkedin';
        } else {
          source = 'external';
        }
      }
    }
    
    return {
      path,
      source,
      fullUrl: requestUrl,
      query: parsedUrl.query || null
    };
  } catch (error) {
    console.error('Error extracting page info:', error);
    return { path: '/', source: 'unknown' };
  }
}

/**
 * Create event tracking middleware
 * @param {Object} eventEmitter - Event emitter instance
 * @returns {Function} - Middleware function
 */
function createEventTrackingMiddleware(eventEmitter) {
  return function eventTrackingMiddleware(req, res, next) {
    const originalSend = res.send;
    
    // Generate session ID if not present
    if (!req.headers['x-session-id']) {
      req.headers['x-session-id'] = uuidv4();
    }

    // Get request start time for performance tracking
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const pageInfo = extractPageInfo(fullUrl, req.headers.referer);
    
    req.eventTracking = {
      startTime: Date.now(),
      sessionId: req.headers['x-session-id'],
      path: req.path,
      method: req.method,
      isFormSubmission: req.path.includes('/forms/') && req.method === 'POST',
      pageInfo
    };

    // Override the response send method to capture form submissions
    res.send = function(body) {
      const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
      
      // Track form submissions only
      if (req.eventTracking.isFormSubmission && responseBody) {
        try {
          const formType = req.params.formType;
          const processingTime = Date.now() - req.eventTracking.startTime;
          const success = responseBody.success === true;
          
          if (success) {
            // Create form submission event with enhanced data
            const formEvent = new FormSubmissionEvent({
              formType,
              formId: responseBody.formId,
              userId: req.user ? req.user.id : null,
              sessionId: req.eventTracking.sessionId,
              formData: req.body,
              metadata: {
                source: req.headers.referer || 'direct',
                duration: processingTime,
                httpStatus: res.statusCode,
                contentType: req.headers['content-type'] || '',
                userLanguage: req.headers['accept-language'] || '',
                method: req.method
              },
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              referer: req.headers.referer || '',
              page: req.eventTracking.pageInfo.path,
              status: 'submitted',
              processingTime,
              timestamp: new Date(),
              tags: [formType, 'web-submission']
            });

            // Add additional tags based on device
            if (formEvent.device && formEvent.device.type) {
              formEvent.addTags([formEvent.device.type]);
            }

            // Emit form submitted event
            eventEmitter.emit('form.submitted', formEvent);
            
            // If response indicates processing is complete, emit processed event
            if (responseBody.status === 'completed') {
              formEvent.updateStatus('processed', { 
                processingTime, 
                metadata: {
                  ...formEvent.metadata,
                  completedAt: new Date()
                }
              });
              
              eventEmitter.emit('form.processed', formEvent);
              
              // If this form created a lead or appointment, emit conversion event
              if (responseBody.leadId || responseBody.appointmentId) {
                const conversionData = {
                  type: responseBody.leadId ? 'lead' : 'appointment',
                  id: responseBody.leadId || responseBody.appointmentId,
                  timestamp: new Date()
                };
                
                formEvent.markAsConverted(conversionData);
                eventEmitter.emit('form.converted', formEvent);
              }
            }
          } else if (responseBody.status === 'validation_failed' || responseBody.status === 'error') {
            // Handle validation errors with more detailed error tracking
            const formEvent = new FormSubmissionEvent({
              formType,
              userId: req.user ? req.user.id : null,
              sessionId: req.eventTracking.sessionId,
              formData: req.body,
              metadata: {
                source: req.headers.referer || 'direct',
                errorSource: responseBody.errorSource || 'validation',
                httpStatus: res.statusCode
              },
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              referer: req.headers.referer || '',
              page: req.eventTracking.pageInfo.path,
              status: 'error',
              errorDetails: {
                type: responseBody.status === 'validation_failed' ? 'validation' : 'processing',
                message: responseBody.message || 'Form submission failed',
                errors: responseBody.errors || [],
                code: responseBody.errorCode || 'FORM_ERROR'
              },
              timestamp: new Date(),
              tags: [formType, 'error', responseBody.status]
            });
            
            // Emit form error event
            eventEmitter.emit('form.error', formEvent);
          }
        } catch (error) {
          console.error('Error in event tracking middleware:', error);
          // Emit an internal error event for monitoring
          try {
            eventEmitter.emit('system.error', {
              source: 'eventTrackingMiddleware',
              error: error.message,
              stack: error.stack,
              timestamp: new Date()
            });
          } catch (e) {
            // Fallback logging if event emission fails
            console.error('Failed to emit system.error event:', e);
          }
        }
      }

      // Call original send method
      return originalSend.call(this, body);
    };

    next();
  };
}

module.exports = createEventTrackingMiddleware; 