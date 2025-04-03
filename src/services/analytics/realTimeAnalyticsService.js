/**
 * Real-Time Analytics Aggregation Service
 * Provides real-time aggregation and processing of form submission events
 */

const { EventSubscriberInterface } = require('../../core/interfaces/eventSystem');

class RealTimeAnalyticsService extends EventSubscriberInterface {
  /**
   * Constructor
   * @param {Object} analyticsRepository - Analytics repository instance
   * @param {Object} eventEmitter - Event emitter instance
   * @param {Object} options - Configuration options
   */
  constructor(analyticsRepository, eventEmitter, options = {}) {
    super();
    this.analyticsRepository = analyticsRepository;
    this.eventEmitter = eventEmitter;
    this.options = {
      aggregationInterval: options.aggregationInterval || 60000, // Default: 1 minute
      persistInterval: options.persistInterval || 300000, // Default: 5 minutes
      maxBufferSize: options.maxBufferSize || 1000, // Maximum events to buffer before forced persistence
      enableDebugLogging: options.enableDebugLogging || false
    };
    
    // Initialize in-memory storage for real-time stats
    this.realTimeStats = {
      formSubmissions: {
        total: 0,
        byType: {},
        byStatus: {
          submitted: 0,
          processed: 0,
          error: 0,
          converted: 0
        },
        byDevice: {
          desktop: 0,
          mobile: 0,
          tablet: 0,
          unknown: 0
        }
      },
      conversions: {
        total: 0,
        byType: {},
        conversionRate: 0
      },
      errors: {
        total: 0,
        byType: {},
        byFormType: {}
      },
      processingTime: {
        average: 0,
        min: null,
        max: 0,
        total: 0,
        count: 0
      },
      timeToConversion: {
        average: 0,
        min: null,
        max: 0,
        total: 0,
        count: 0
      }
    };
    
    // Buffer for events that will be persisted to the database
    this.eventBuffer = [];
    
    // Subscribe to events
    this.subscribe(eventEmitter);
    
    // Start the aggregation and persistence intervals
    this._startIntervals();
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
      eventEmitter.on(eventType, handler);
    }
    
    this._debugLog('Subscribed to form events');
  }
  
  /**
   * Unsubscribe from events
   */
  unsubscribe() {
    // Clean up intervals
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }
    
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
    
    // Persist any remaining events before shutting down
    this._persistEvents();
  }
  
  /**
   * Handle form submitted event
   * @param {Object} event - Form submission event
   */
  handleFormSubmitted(event) {
    // Add to buffer for persistence
    this.eventBuffer.push({
      type: 'form.submitted',
      event,
      timestamp: new Date()
    });
    
    // Update real-time stats
    this.realTimeStats.formSubmissions.total++;
    
    // Update by form type
    const formType = event.formType || 'unknown';
    this.realTimeStats.formSubmissions.byType[formType] = 
      (this.realTimeStats.formSubmissions.byType[formType] || 0) + 1;
    
    // Update by status
    this.realTimeStats.formSubmissions.byStatus.submitted++;
    
    // Update by device
    const deviceType = event.device?.type || 'unknown';
    this.realTimeStats.formSubmissions.byDevice[deviceType] = 
      (this.realTimeStats.formSubmissions.byDevice[deviceType] || 0) + 1;
    
    // Check if buffer is full, and persist if necessary
    if (this.eventBuffer.length >= this.options.maxBufferSize) {
      this._persistEvents();
    }
    
    // Emit real-time update event
    this._emitStatsUpdate();
  }
  
  /**
   * Handle form processed event
   * @param {Object} event - Form processed event
   */
  handleFormProcessed(event) {
    // Add to buffer for persistence
    this.eventBuffer.push({
      type: 'form.processed',
      event,
      timestamp: new Date()
    });
    
    // Update status counts
    this.realTimeStats.formSubmissions.byStatus.processed++;
    
    // Update processing time stats
    if (event.processingTime) {
      const time = event.processingTime;
      this.realTimeStats.processingTime.total += time;
      this.realTimeStats.processingTime.count++;
      this.realTimeStats.processingTime.average = 
        this.realTimeStats.processingTime.total / this.realTimeStats.processingTime.count;
        
      // Update min/max
      if (this.realTimeStats.processingTime.min === null || time < this.realTimeStats.processingTime.min) {
        this.realTimeStats.processingTime.min = time;
      }
      
      if (time > this.realTimeStats.processingTime.max) {
        this.realTimeStats.processingTime.max = time;
      }
    }
    
    // Emit real-time update event
    this._emitStatsUpdate();
  }
  
  /**
   * Handle form error event
   * @param {Object} event - Form error event
   */
  handleFormError(event) {
    // Add to buffer for persistence
    this.eventBuffer.push({
      type: 'form.error',
      event,
      timestamp: new Date()
    });
    
    // Update error stats
    this.realTimeStats.errors.total++;
    this.realTimeStats.formSubmissions.byStatus.error++;
    
    // Update by error type
    const errorType = event.errorDetails?.type || 'unknown';
    this.realTimeStats.errors.byType[errorType] = 
      (this.realTimeStats.errors.byType[errorType] || 0) + 1;
    
    // Update by form type
    const formType = event.formType || 'unknown';
    if (!this.realTimeStats.errors.byFormType[formType]) {
      this.realTimeStats.errors.byFormType[formType] = {};
    }
    
    this.realTimeStats.errors.byFormType[formType][errorType] = 
      (this.realTimeStats.errors.byFormType[formType][errorType] || 0) + 1;
    
    // Emit real-time update event
    this._emitStatsUpdate();
  }
  
  /**
   * Handle form converted event
   * @param {Object} event - Form conversion event
   */
  handleFormConverted(event) {
    // Add to buffer for persistence
    this.eventBuffer.push({
      type: 'form.converted',
      event,
      timestamp: new Date()
    });
    
    // Update conversion stats
    this.realTimeStats.conversions.total++;
    this.realTimeStats.formSubmissions.byStatus.converted++;
    
    // Update by conversion type
    const conversionType = event.conversionData?.type || 'unknown';
    this.realTimeStats.conversions.byType[conversionType] = 
      (this.realTimeStats.conversions.byType[conversionType] || 0) + 1;
    
    // Calculate conversion rate
    if (this.realTimeStats.formSubmissions.total > 0) {
      this.realTimeStats.conversions.conversionRate = 
        (this.realTimeStats.conversions.total / this.realTimeStats.formSubmissions.total) * 100;
    }
    
    // Update time to conversion
    if (event.metadata?.timeToConversion) {
      const time = event.metadata.timeToConversion;
      this.realTimeStats.timeToConversion.total += time;
      this.realTimeStats.timeToConversion.count++;
      this.realTimeStats.timeToConversion.average = 
        this.realTimeStats.timeToConversion.total / this.realTimeStats.timeToConversion.count;
      
      // Update min/max
      if (this.realTimeStats.timeToConversion.min === null || time < this.realTimeStats.timeToConversion.min) {
        this.realTimeStats.timeToConversion.min = time;
      }
      
      if (time > this.realTimeStats.timeToConversion.max) {
        this.realTimeStats.timeToConversion.max = time;
      }
    }
    
    // Emit real-time update event
    this._emitStatsUpdate();
  }
  
  /**
   * Get current real-time statistics
   * @returns {Object} - Current statistics
   */
  getStats() {
    return {
      ...this.realTimeStats,
      lastUpdated: new Date(),
      bufferSize: this.eventBuffer.length
    };
  }
  
  /**
   * Reset statistics
   * Clears all aggregated stats but doesn't affect buffered events
   */
  resetStats() {
    // Initialize in-memory storage for real-time stats
    this.realTimeStats = {
      formSubmissions: {
        total: 0,
        byType: {},
        byStatus: {
          submitted: 0,
          processed: 0,
          error: 0,
          converted: 0
        },
        byDevice: {
          desktop: 0,
          mobile: 0,
          tablet: 0,
          unknown: 0
        }
      },
      conversions: {
        total: 0,
        byType: {},
        conversionRate: 0
      },
      errors: {
        total: 0,
        byType: {},
        byFormType: {}
      },
      processingTime: {
        average: 0,
        min: null,
        max: 0,
        total: 0,
        count: 0
      },
      timeToConversion: {
        average: 0,
        min: null,
        max: 0,
        total: 0,
        count: 0
      }
    };
    
    // Emit update event
    this._emitStatsUpdate();
  }
  
  /**
   * Start the aggregation and persistence intervals
   * @private
   */
  _startIntervals() {
    // Aggregation interval - can be used for time-based stats like events per minute
    this.aggregationInterval = setInterval(() => {
      this._aggregateTimeSeries();
    }, this.options.aggregationInterval);
    
    // Persistence interval - save buffered events to database
    this.persistInterval = setInterval(() => {
      this._persistEvents();
    }, this.options.persistInterval);
    
    this._debugLog('Started aggregation and persistence intervals');
  }
  
  /**
   * Aggregate time series data
   * @private
   */
  _aggregateTimeSeries() {
    // This could be extended to maintain time-series data for charts
    // e.g., events per minute for the last hour
    
    // For now, just emit the current stats
    this._emitStatsUpdate();
  }
  
  /**
   * Persist buffered events to database
   * @private
   */
  async _persistEvents() {
    if (this.eventBuffer.length === 0) {
      return;
    }
    
    const eventsToProcess = [...this.eventBuffer];
    this.eventBuffer = [];
    
    this._debugLog(`Persisting ${eventsToProcess.length} events`);
    
    try {
      // Process events in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < eventsToProcess.length; i += batchSize) {
        const batch = eventsToProcess.slice(i, i + batchSize);
        await this._processBatch(batch);
      }
      
      this._debugLog(`Successfully persisted ${eventsToProcess.length} events`);
    } catch (error) {
      console.error('Error persisting analytics events:', error);
      
      // Return events to buffer to try again next time
      this.eventBuffer = [...eventsToProcess, ...this.eventBuffer];
      
      // Cap buffer size to avoid memory issues
      if (this.eventBuffer.length > this.options.maxBufferSize * 2) {
        console.warn(`Analytics event buffer overflow. Dropping oldest ${this.eventBuffer.length - this.options.maxBufferSize} events.`);
        this.eventBuffer = this.eventBuffer.slice(-(this.options.maxBufferSize));
      }
    }
  }
  
  /**
   * Process a batch of events for persistence
   * @param {Array} batch - Batch of events to process
   * @private
   */
  async _processBatch(batch) {
    // Process each event type appropriately
    const promises = batch.map(item => {
      const { type, event } = item;
      
      try {
        // Different event types might need different processing
        switch (type) {
          case 'form.submitted':
            return this._processFormSubmission(event);
          case 'form.processed':
            return this._processFormProcessed(event);
          case 'form.error':
            return this._processFormError(event);
          case 'form.converted':
            return this._processFormConversion(event);
          default:
            console.warn(`Unknown event type: ${type}`);
            return Promise.resolve();
        }
      } catch (err) {
        console.error(`Error processing event of type ${type}:`, err);
        return Promise.resolve(); // Continue with other events
      }
    });
    
    await Promise.all(promises);
  }
  
  /**
   * Process form submission for persistence
   * @param {Object} event - Form submission event
   * @private
   */
  async _processFormSubmission(event) {
    // Store event in analytics repository
    return this.analyticsRepository.create({
      type: 'event',
      eventType: 'form_submission',
      userId: event.userId,
      sessionId: event.sessionId,
      data: {
        formType: event.formType,
        formId: event.formId,
        metadata: event.metadata,
        device: event.device,
        tags: event.tags,
        page: event.page
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.timestamp
    });
  }
  
  /**
   * Process form processed event for persistence
   * @param {Object} event - Form processed event
   * @private
   */
  async _processFormProcessed(event) {
    // Store event in analytics repository
    return this.analyticsRepository.create({
      type: 'event',
      eventType: 'form_processed',
      userId: event.userId,
      sessionId: event.sessionId,
      data: {
        formType: event.formType,
        formId: event.formId,
        metadata: event.metadata,
        processingTime: event.processingTime,
        tags: event.tags
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.timestamp
    });
  }
  
  /**
   * Process form error event for persistence
   * @param {Object} event - Form error event
   * @private
   */
  async _processFormError(event) {
    // Store event in analytics repository
    return this.analyticsRepository.create({
      type: 'event',
      eventType: 'form_error',
      userId: event.userId,
      sessionId: event.sessionId,
      data: {
        formType: event.formType,
        formId: event.formId,
        errorDetails: event.errorDetails,
        metadata: event.metadata,
        tags: event.tags
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.timestamp
    });
  }
  
  /**
   * Process form conversion event for persistence
   * @param {Object} event - Form conversion event
   * @private
   */
  async _processFormConversion(event) {
    // Store event in analytics repository
    return this.analyticsRepository.create({
      type: 'event',
      eventType: 'form_conversion',
      userId: event.userId,
      sessionId: event.sessionId,
      data: {
        formType: event.formType,
        formId: event.formId,
        conversionData: event.conversionData,
        metadata: event.metadata,
        timeToConversion: event.metadata?.timeToConversion,
        tags: event.tags
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.timestamp
    });
  }
  
  /**
   * Emit stats update event
   * @private
   */
  _emitStatsUpdate() {
    this.eventEmitter.emit('analytics.stats.updated', this.getStats());
  }
  
  /**
   * Debug log helper
   * @param {string} message - Debug message
   * @private
   */
  _debugLog(message) {
    if (this.options.enableDebugLogging) {
      console.log(`[RealTimeAnalyticsService] ${message}`);
    }
  }
}

module.exports = RealTimeAnalyticsService; 