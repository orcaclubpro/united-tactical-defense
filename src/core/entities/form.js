/**
 * Form Entity
 * Core domain entity for form processing system
 */

class Form {
  /**
   * @param {Object} props - Form properties
   * @param {string} props.id - Unique identifier
   * @param {string} props.type - Form type (contact, assessment, etc.)
   * @param {Object} props.fields - Form fields configuration
   * @param {Object} props.validationRules - Validation rules for form fields
   * @param {Object} props.data - Submitted form data
   * @param {Date} props.submittedAt - Submission timestamp
   * @param {string} props.status - Processing status
   */
  constructor(props) {
    this.id = props.id;
    this.type = props.type;
    this.fields = props.fields || {};
    this.validationRules = props.validationRules || {};
    this.data = props.data || {};
    this.submittedAt = props.submittedAt || new Date();
    this.status = props.status || 'new';
  }

  /**
   * Validate form data against validation rules
   * @returns {Object} Validation result with errors if any
   */
  validate() {
    const errors = {};
    
    // Validate each field according to its rules
    Object.keys(this.validationRules).forEach(fieldName => {
      const rules = this.validationRules[fieldName];
      const value = this.data[fieldName];
      
      // Required field validation
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[fieldName] = errors[fieldName] || [];
        errors[fieldName].push('This field is required');
      }
      
      // String length validation
      if (typeof value === 'string' && rules.maxLength && value.length > rules.maxLength) {
        errors[fieldName] = errors[fieldName] || [];
        errors[fieldName].push(`Maximum length is ${rules.maxLength} characters`);
      }
      
      // Email format validation
      if (rules.type === 'email' && value && !this.#isValidEmail(value)) {
        errors[fieldName] = errors[fieldName] || [];
        errors[fieldName].push('Invalid email format');
      }
      
      // Phone format validation
      if (rules.type === 'phone' && value && !this.#isValidPhone(value)) {
        errors[fieldName] = errors[fieldName] || [];
        errors[fieldName].push('Invalid phone number format');
      }
      
      // Custom validation
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value, this.data);
        if (customError) {
          errors[fieldName] = errors[fieldName] || [];
          errors[fieldName].push(customError);
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  /**
   * Process the form data according to its type
   * @returns {Object} Processing result
   */
  process() {
    // Validation before processing
    const validation = this.validate();
    if (!validation.isValid) {
      return {
        success: false,
        status: 'validation_failed',
        errors: validation.errors
      };
    }
    
    // Set status to processing
    this.status = 'processing';
    
    // Return success result
    return {
      success: true,
      status: this.status,
      data: this.data,
      formId: this.id
    };
  }
  
  /**
   * Complete form processing
   * @param {string} status - Final status (completed, failed)
   * @param {Object} result - Processing result data
   * @returns {Object} Updated form data
   */
  complete(status, result = {}) {
    this.status = status;
    this.processingResult = result;
    
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      result: this.processingResult
    };
  }
  
  /**
   * Mark form as converted to another entity
   * @param {string} entityType - Entity type (lead, appointment)
   * @param {string} entityId - Entity ID
   * @returns {Object} Conversion result
   */
  convertTo(entityType, entityId) {
    this.convertedTo = {
      entityType,
      entityId,
      convertedAt: new Date()
    };
    
    return {
      success: true,
      conversionData: this.convertedTo
    };
  }
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid
   * @private
   */
  #isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate phone number format
   * @param {string} phone - Phone to validate
   * @returns {boolean} Is valid
   * @private
   */
  #isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
  }
}

module.exports = Form; 