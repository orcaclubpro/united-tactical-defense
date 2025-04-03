/**
 * Form Analytics Subscriber
 * Subscribes to form submission events and processes them for analytics
 */

const { EventSubscriberInterface } = require('../../core/interfaces/eventSystem');

class FormAnalyticsSubscriber extends EventSubscriberInterface {
  /**
   * Constructor
   * @param {Object} analyticsService - Analytics service instance
   */
  constructor(analyticsService) {
    super();
    this.analyticsService = analyticsService;
    this.unsubscribeFunctions = [];
  }

  /**
   * Get subscribed events
   * @returns {Object} - Map of event types to handler methods
   */
  getSubscribedEvents() {
    return {
      'form.submitted': this.handleFormSubmitted.bind(this),
      'form.processed': this.handleFormProcessed.bind(this),
      'form.error': this.handleFormError.bind(this),
      'form.converted': this.handleFormConverted.bind(this)
    };
  }

  /**
   * Subscribe to events
   * @param {Object} eventEmitter - Event emitter instance
   */
  subscribe(eventEmitter) {
    const events = this.getSubscribedEvents();
    
    // Register all event listeners
    for (const [eventType, handler] of Object.entries(events)) {
      const unsubscribe = eventEmitter.on(eventType, handler);
      this.unsubscribeFunctions.push(unsubscribe);
    }
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe() {
    // Execute all unsubscribe functions
    for (const unsubscribe of this.unsubscribeFunctions) {
      unsubscribe();
    }
    this.unsubscribeFunctions = [];
  }

  /**
   * Handle form submitted event
   * @param {Object} event - Form submission event
   */
  async handleFormSubmitted(event) {
    try {
      const startTime = Date.now();
      
      // Track the submission as an analytics event
      await this.analyticsService.trackEvent('form_submission', {
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        metadata: {
          formType: event.formType,
          formId: event.formId,
          source: event.metadata.source || 'website',
          duration: event.metadata.duration || null,
          referer: event.referer
        }
      });

      console.log(`Analytics processed form submission event in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('Error processing form submission analytics:', error);
    }
  }

  /**
   * Handle form processed event
   * @param {Object} event - Form processed event
   */
  async handleFormProcessed(event) {
    try {
      await this.analyticsService.trackEvent('form_processed', {
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: new Date(),
        metadata: {
          formType: event.formType,
          formId: event.formId,
          processingTime: event.processingTime,
          result: event.metadata.result || 'success'
        }
      });
    } catch (error) {
      console.error('Error processing form analytics event:', error);
    }
  }

  /**
   * Handle form error event
   * @param {Object} event - Form error event
   */
  async handleFormError(event) {
    try {
      await this.analyticsService.trackEvent('form_error', {
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: new Date(),
        metadata: {
          formType: event.formType,
          formId: event.formId,
          errorType: event.errorDetails?.type || 'unknown',
          errorMessage: event.errorDetails?.message || 'Unknown error'
        }
      });
    } catch (error) {
      console.error('Error processing form error analytics:', error);
    }
  }

  /**
   * Handle form converted event (when form leads to a conversion)
   * @param {Object} event - Form conversion event
   */
  async handleFormConverted(event) {
    try {
      await this.analyticsService.trackEvent('form_conversion', {
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: new Date(),
        metadata: {
          formType: event.formType,
          formId: event.formId,
          conversionType: event.metadata.conversionType || 'lead',
          conversionId: event.metadata.conversionId,
          timeToConversion: event.metadata.timeToConversion // ms between submission and conversion
        }
      });
    } catch (error) {
      console.error('Error processing form conversion analytics:', error);
    }
  }
}

module.exports = FormAnalyticsSubscriber; 