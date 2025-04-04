/**
 * Form Validation Service
 * 
 * Provides validation functions for form fields and steps
 */

// Common validation rules
const validationRules = {
  /**
   * Validates that a field is not empty
   * @param {string} value - The field value to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  required: (value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    return Object.keys(value).length > 0;
  },

  /**
   * Validates a field with minimum length
   * @param {string} value - The field value to validate
   * @param {number} minLength - Minimum required length
   * @returns {boolean} - True if valid, false otherwise
   */
  minLength: (value, minLength) => {
    if (!value) return false;
    return value.toString().length >= minLength;
  },

  /**
   * Validates that a field is a valid email address
   * @param {string} value - The field value to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  email: (value) => {
    if (!value) return false;
    // Basic email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  },

  /**
   * Validates that a field is a valid phone number
   * @param {string} value - The field value to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  phone: (value) => {
    if (!value) return false;
    // Basic phone validation - at least 10 digits
    const phonePattern = /^\+?[\d\s()-]{10,}$/;
    return phonePattern.test(value);
  },

  /**
   * Validates that a field is a valid date
   * @param {string} value - The field value to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  date: (value) => {
    if (!value) return true; // Optional by default
    return !isNaN(Date.parse(value));
  },

  /**
   * Validates a field with maximum length
   * @param {string} value - The field value to validate
   * @param {number} maxLength - Maximum allowed length
   * @returns {boolean} - True if valid, false otherwise
   */
  maxLength: (value, maxLength) => {
    if (!value) return true; // Optional by default
    return value.length <= maxLength;
  },

  /**
   * Validates a field with custom validation
   * @param {string} value - The field value to validate
   * @param {function} validationFn - The custom validation function
   * @returns {boolean} - True if valid, false otherwise
   */
  custom: (value, validationFn) => {
    return validationFn(value);
  }
};

// Error messages for validation rules
const defaultErrorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min) => `Please enter at least ${min} characters`,
  maxLength: (max) => `Please enter no more than ${max} characters`,
  date: 'Please enter a valid date',
  custom: 'This field is invalid'
};

/**
 * Creates a validator function for a step based on field rules
 * @param {Object} fieldRules - Validation rules for each field
 * @returns {Function} - Validator function that takes formData and returns boolean
 */
export const createStepValidator = (fieldRules) => {
  return (formData) => {
    // Short-circuit if no rules or no form data
    if (!fieldRules || !formData) return false;

    // Check each field against its rules
    for (const [field, rules] of Object.entries(fieldRules)) {
      const value = formData[field];
      
      // Apply each rule to the field
      for (const [rule, param] of Object.entries(rules)) {
        // Skip if rule function doesn't exist
        if (!validationRules[rule]) continue;
        
        // Apply the validation rule
        const isValid = param === true 
          ? validationRules[rule](value)
          : validationRules[rule](value, param);
        
        // Return false on first validation failure
        if (!isValid) return false;
      }
    }
    
    // All validations passed
    return true;
  };
};

/**
 * Validates a single field against specified rules
 * @param {string} value - The field value to validate
 * @param {Object} rules - Validation rules to apply
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateField = (value, rules) => {
  if (!rules) return true;
  
  for (const [rule, param] of Object.entries(rules)) {
    if (!validationRules[rule]) continue;
    
    const isValid = param === true 
      ? validationRules[rule](value)
      : validationRules[rule](value, param);
    
    if (!isValid) return false;
  }
  
  return true;
};

/**
 * Generates validation errors for form fields
 * @param {Object} formData - The form data to validate
 * @param {Object} fieldRules - Validation rules for each field
 * @returns {Object} - Object containing validation errors by field
 */
export const generateValidationErrors = (formData, fieldRules) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(fieldRules)) {
    const value = formData[field];
    
    for (const [rule, param] of Object.entries(rules)) {
      if (!validationRules[rule]) continue;
      
      const isValid = param === true 
        ? validationRules[rule](value)
        : validationRules[rule](value, param);
      
      if (!isValid) {
        errors[field] = errors[field] || [];
        errors[field].push(rule);
        break; // Only capture first error for each field
      }
    }
  }
  
  return errors;
};

/**
 * Validate a single field
 * @param {*} value - Field value to validate
 * @param {Object} fieldRules - Validation rules for the field
 * @returns {Object} - Validation result (isValid, errors)
 */
const validateField = (value, fieldRules) => {
  const errors = [];
  
  // Process each rule
  Object.entries(fieldRules).forEach(([ruleName, ruleConfig]) => {
    // Handle rule parameters and error message
    let ruleParams = null;
    let errorMessage = defaultErrorMessages[ruleName];
    
    // Different configurations for rules (value or object with params and message)
    if (typeof ruleConfig === 'object' && !Array.isArray(ruleConfig)) {
      ruleParams = ruleConfig.params;
      errorMessage = ruleConfig.message || errorMessage;
    } else {
      ruleParams = ruleConfig;
    }
    
    // If the rule function exists, run validation
    if (validationRules[ruleName]) {
      const isValid = validationRules[ruleName](value, ruleParams);
      
      if (!isValid) {
        // Format error message if it's a function
        if (typeof errorMessage === 'function') {
          errorMessage = errorMessage(ruleParams);
        }
        
        errors.push(errorMessage);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate a form object against validation schema
 * @param {Object} formData - Form data
 * @param {Object} validationSchema - Schema defining validation rules
 * @returns {Object} - Validation results (isValid, fieldErrors)
 */
const validateForm = (formData, validationSchema) => {
  const fieldErrors = {};
  let isValid = true;
  
  // Validate each field in the schema
  Object.entries(validationSchema).forEach(([fieldName, fieldRules]) => {
    const value = formData[fieldName];
    const result = validateField(value, fieldRules);
    
    if (!result.isValid) {
      fieldErrors[fieldName] = result.errors;
      isValid = false;
    }
  });
  
  return {
    isValid,
    fieldErrors,
  };
};

export default {
  rules: validationRules,
  createStepValidator,
  validateField,
  generateValidationErrors,
  validateForm,
  defaultErrorMessages,
}; 