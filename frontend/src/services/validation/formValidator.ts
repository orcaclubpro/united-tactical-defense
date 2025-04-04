import { FormData, FormErrors } from '../../contexts/FormContext';

// Validation rule types
type ValidationRule = (value: any, formData?: FormData) => boolean;
type ValidationRuleWithMessage = {
  rule: ValidationRule;
  message: string | ((value: any, fieldName: string) => string);
};

// Define validation rules
export const rules = {
  required: (value: any) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (value instanceof Date) return true;
    return !!value;
  },
  
  email: (value: any) => {
    if (!value) return true; // Empty is handled by required rule
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value));
  },
  
  phone: (value: any) => {
    if (!value) return true; // Empty is handled by required rule
    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(String(value));
  },
  
  minLength: (minLength: number) => (value: any) => {
    if (!value) return true; // Empty is handled by required rule
    return String(value).length >= minLength;
  },
  
  maxLength: (maxLength: number) => (value: any) => {
    if (!value) return true;
    return String(value).length <= maxLength;
  },
  
  pattern: (pattern: RegExp) => (value: any) => {
    if (!value) return true;
    return pattern.test(String(value));
  },
  
  match: (fieldToMatch: string) => (value: any, formData?: FormData) => {
    if (!value || !formData) return true;
    return value === formData[fieldToMatch];
  },
  
  future: (value: any) => {
    if (!value) return true;
    const date = value instanceof Date ? value : new Date(value);
    return date > new Date();
  },
  
  past: (value: any) => {
    if (!value) return true;
    const date = value instanceof Date ? value : new Date(value);
    return date < new Date();
  },
  
  numeric: (value: any) => {
    if (!value) return true;
    return /^\d+$/.test(String(value));
  }
};

// Error message templates
const errorMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  email: () => 'Please enter a valid email address',
  phone: () => 'Please enter a valid phone number',
  minLength: (minLength: number) => (fieldName: string) => 
    `${fieldName} must be at least ${minLength} characters`,
  maxLength: (maxLength: number) => (fieldName: string) => 
    `${fieldName} must be no more than ${maxLength} characters`,
  pattern: (fieldName: string) => `${fieldName} format is invalid`,
  match: (matchField: string) => (fieldName: string) => 
    `${fieldName} must match ${matchField}`,
  future: (fieldName: string) => `${fieldName} must be a future date`,
  past: (fieldName: string) => `${fieldName} must be a past date`,
  numeric: (fieldName: string) => `${fieldName} must contain only numbers`
};

// Field validator configuration
export interface FieldValidation {
  fieldName: string;
  displayName?: string;
  rules: Array<ValidationRule | ValidationRuleWithMessage>;
}

// Format field name for display
const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
};

// Create validation rule with default error message
export const createRule = (
  rule: ValidationRule,
  errorMessageOrFn: string | ((value: any, fieldName: string) => string)
): ValidationRuleWithMessage => {
  return {
    rule,
    message: errorMessageOrFn
  };
};

// Main validator class
export class FormValidator {
  private validations: FieldValidation[];
  
  constructor(validations: FieldValidation[]) {
    this.validations = validations;
  }
  
  // Add new validation rule
  addValidation(validation: FieldValidation): void {
    this.validations.push(validation);
  }
  
  // Remove validation rule by field name
  removeValidation(fieldName: string): void {
    this.validations = this.validations.filter(v => v.fieldName !== fieldName);
  }
  
  // Validate a single field
  validateField(fieldName: string, formData: FormData): string | null {
    const fieldValidation = this.validations.find(v => v.fieldName === fieldName);
    
    if (!fieldValidation) return null;
    
    const value = formData[fieldName];
    const displayName = fieldValidation.displayName || formatFieldName(fieldName);
    
    for (const ruleItem of fieldValidation.rules) {
      // Handle simple rule (function only)
      if (typeof ruleItem === 'function') {
        if (!ruleItem(value, formData)) {
          return errorMessages.required(displayName);
        }
      } 
      // Handle rule with custom message
      else {
        const { rule, message } = ruleItem;
        if (!rule(value, formData)) {
          return typeof message === 'function' 
            ? message(value, displayName) 
            : message;
        }
      }
    }
    
    return null;
  }
  
  // Validate all fields
  validate(formData: FormData, fields?: string[]): FormErrors {
    const errors: FormErrors = {};
    
    // Filter validations if specific fields are provided
    const validationsToCheck = fields 
      ? this.validations.filter(v => fields.includes(v.fieldName))
      : this.validations;
    
    for (const validation of validationsToCheck) {
      const error = this.validateField(validation.fieldName, formData);
      if (error) {
        errors[validation.fieldName] = error;
      }
    }
    
    return errors;
  }
  
  // Validate specific step fields
  validateStep(stepFields: string[], formData: FormData): FormErrors {
    return this.validate(formData, stepFields);
  }
  
  // Check if all fields are valid
  isValid(formData: FormData, fields?: string[]): boolean {
    const errors = this.validate(formData, fields);
    return Object.keys(errors).length === 0;
  }
}

// Create a validator with common form rules
export const createDefaultValidator = (): FormValidator => {
  return new FormValidator([
    {
      fieldName: 'name',
      rules: [rules.required]
    },
    {
      fieldName: 'email',
      rules: [
        rules.required,
        createRule(rules.email, errorMessages.email())
      ]
    },
    {
      fieldName: 'phone',
      rules: [
        createRule(rules.phone, errorMessages.phone())
      ]
    }
  ]);
};

export default FormValidator; 