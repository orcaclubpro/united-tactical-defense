/**
 * Form Service Module
 * Exports the form service implementation
 */

const FormService = require('./formService');

// The formService instance will be initialized in app.js
// with the eventEmitter dependency injected
let formService = null;

/**
 * Initialize the form service with dependencies
 * @param {Object} deps - Dependencies
 * @returns {Object} - Form service instance
 */
const initFormService = (deps = {}) => {
  formService = new FormService(deps);
  return formService;
};

/**
 * Get the form service instance
 * @returns {Object} - Form service instance
 */
const getFormService = () => {
  if (!formService) {
    // Create a default instance without event emitter if not initialized
    formService = new FormService();
  }
  return formService;
};

module.exports = {
  FormService,
  initFormService,
  getFormService
}; 