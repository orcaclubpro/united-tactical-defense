/**
 * EventEmitter Service Implementation
 * Centralized event handling system
 */

const { EventEmitterInterface } = require('../../core/interfaces/eventSystem');

class EventEmitter extends EventEmitterInterface {
  /**
   * Constructor
   */
  constructor() {
    super();
    this.events = new Map();
    this.onceListeners = new Set();
  }

  /**
   * Register an event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} listener - Callback function to execute when event is emitted
   * @returns {Function} - Unsubscribe function
   */
  on(eventType, listener) {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, new Set());
    }
    
    this.events.get(eventType).add(listener);
    
    // Return an unsubscribe function
    return () => this.off(eventType, listener);
  }

  /**
   * Register a one-time event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} listener - Callback function to execute when event is emitted
   * @returns {Function} - Unsubscribe function
   */
  once(eventType, listener) {
    const onceWrapper = (...args) => {
      this.off(eventType, onceWrapper);
      listener(...args);
    };
    
    this.onceListeners.add(onceWrapper);
    return this.on(eventType, onceWrapper);
  }

  /**
   * Emit an event
   * @param {string} eventType - Type of event to emit
   * @param {Object} eventData - Data to pass to listeners
   * @returns {boolean} - True if event had listeners
   */
  emit(eventType, eventData) {
    const hasListeners = this.events.has(eventType) && this.events.get(eventType).size > 0;
    
    if (!hasListeners) {
      return false;
    }
    
    // Clone the set of listeners to avoid modification during iteration
    const listeners = [...this.events.get(eventType)];
    
    // Execute all listeners asynchronously
    setTimeout(() => {
      listeners.forEach(listener => {
        try {
          listener(eventData);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }, 0);
    
    return true;
  }

  /**
   * Remove an event listener
   * @param {string} eventType - Type of event
   * @param {Function} listener - Listener to remove
   * @returns {boolean} - True if listener was removed
   */
  off(eventType, listener) {
    if (!this.events.has(eventType)) {
      return false;
    }
    
    const listeners = this.events.get(eventType);
    const removed = listeners.delete(listener);
    
    // If this was a "once" listener, remove it from the tracking set
    if (removed) {
      this.onceListeners.delete(listener);
    }
    
    // Clean up empty event types
    if (listeners.size === 0) {
      this.events.delete(eventType);
    }
    
    return removed;
  }

  /**
   * Remove all listeners for an event type
   * @param {string} eventType - Type of event
   * @returns {boolean} - True if listeners were removed
   */
  removeAllListeners(eventType) {
    if (!eventType) {
      // Clear all events
      this.events.clear();
      this.onceListeners.clear();
      return true;
    }
    
    if (!this.events.has(eventType)) {
      return false;
    }
    
    // Remove any "once" listeners for this event type
    const listeners = this.events.get(eventType);
    for (const listener of listeners) {
      if (this.onceListeners.has(listener)) {
        this.onceListeners.delete(listener);
      }
    }
    
    this.events.delete(eventType);
    return true;
  }
}

module.exports = EventEmitter; 