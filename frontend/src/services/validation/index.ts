import FormValidator, { 
  rules, 
  createRule, 
  FieldValidation,
  createDefaultValidator
} from './formValidator';

import {
  createContactFormValidator,
  createAppointmentFormValidator,
  createRegistrationFormValidator,
  createAddressFormValidator,
  nameRules,
  emailRules,
  phoneRules,
  programRules,
  dateRules,
  timeRules,
  passwordRules,
  passwordConfirmRules,
  addressRules,
  cityRules,
  stateRules,
  zipRules,
  ageRules
} from './validationRules';

// Re-export the type separately
export type { FieldValidation };

// Export all other values
export {
  FormValidator,
  rules,
  createRule,
  createDefaultValidator,
  createContactFormValidator,
  createAppointmentFormValidator,
  createRegistrationFormValidator,
  createAddressFormValidator,
  nameRules,
  emailRules,
  phoneRules,
  programRules,
  dateRules,
  timeRules,
  passwordRules,
  passwordConfirmRules,
  addressRules,
  cityRules,
  stateRules,
  zipRules,
  ageRules
};

export default FormValidator; 