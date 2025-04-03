/**
 * Form Adapter Interface
 * Interface for adapters that convert between external form formats and internal form formats
 */

class FormAdapterInterface {
  /**
   * Convert external form data to internal format
   * @param {Object} externalData - External form data
   * @returns {Object} - Internal form data
   */
  convertToInternalFormat(externalData) {
    throw new Error('Method not implemented');
  }

  /**
   * Convert internal form data to external format
   * @param {Object} internalData - Internal form data
   * @returns {Object} - External form data
   */
  convertToExternalFormat(internalData) {
    throw new Error('Method not implemented');
  }

  /**
   * Validate external form data
   * @param {Object} externalData - External form data
   * @returns {Object} - Validation result
   */
  validateExternalData(externalData) {
    throw new Error('Method not implemented');
  }
}

module.exports = { FormAdapterInterface }; 