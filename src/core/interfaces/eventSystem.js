/**
 * Event System Interfaces
 * These interfaces define the contracts for the event-driven architecture
 */

/**
 * EventEmitter Interface
 * Core component for publishing events
 */
class EventEmitterInterface {
  /**
   * Register an event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} listener - Callback function to execute when event is emitted
   * @returns {Function} - Unsubscribe function
   */
  on(eventType, listener) {
    throw new Error('Method not implemented');
  }

  /**
   * Register a one-time event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} listener - Callback function to execute when event is emitted
   * @returns {Function} - Unsubscribe function
   */
  once(eventType, listener) {
    throw new Error('Method not implemented');
  }

  /**
   * Emit an event
   * @param {string} eventType - Type of event to emit
   * @param {Object} eventData - Data to pass to listeners
   * @returns {boolean} - True if event had listeners
   */
  emit(eventType, eventData) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove an event listener
   * @param {string} eventType - Type of event
   * @param {Function} listener - Listener to remove
   * @returns {boolean} - True if listener was removed
   */
  off(eventType, listener) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove all listeners for an event type
   * @param {string} eventType - Type of event
   * @returns {boolean} - True if listeners were removed
   */
  removeAllListeners(eventType) {
    throw new Error('Method not implemented');
  }
}

/**
 * EventSubscriber Interface
 * Interface for components that subscribe to events
 */
class EventSubscriberInterface {
  /**
   * Get subscribed events
   * @returns {Object} - Map of event types to handler methods
   */
  getSubscribedEvents() {
    throw new Error('Method not implemented');
  }

  /**
   * Subscribe to events
   * @param {EventEmitterInterface} eventEmitter - Event emitter instance
   * @returns {void}
   */
  subscribe(eventEmitter) {
    throw new Error('Method not implemented');
  }

  /**
   * Unsubscribe from events
   * @param {EventEmitterInterface} eventEmitter - Event emitter instance
   * @returns {void}
   */
  unsubscribe(eventEmitter) {
    throw new Error('Method not implemented');
  }
}

module.exports = {
  EventEmitterInterface,
  EventSubscriberInterface
}; 