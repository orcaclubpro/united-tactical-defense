import { rules, createRule, FormValidator, FieldValidation } from './formValidator';

// Predefined rule sets for common form fields
export const nameRules: FieldValidation = {
  fieldName: 'name',
  displayName: 'Full Name',
  rules: [
    rules.required,
    createRule(rules.minLength(2), 'Name must be at least 2 characters')
  ]
};

export const emailRules: FieldValidation = {
  fieldName: 'email',
  displayName: 'Email Address',
  rules: [
    rules.required,
    createRule(rules.email, 'Please enter a valid email address')
  ]
};

export const phoneRules: FieldValidation = {
  fieldName: 'phone',
  displayName: 'Phone Number',
  rules: [
    rules.required,
    createRule(rules.phone, 'Please enter a valid phone number (format: XXX-XXX-XXXX)')
  ]
};

export const programRules: FieldValidation = {
  fieldName: 'program',
  displayName: 'Program',
  rules: [rules.required]
};

export const dateRules: FieldValidation = {
  fieldName: 'date',
  displayName: 'Appointment Date',
  rules: [
    rules.required,
    createRule(rules.future, 'Please select a future date')
  ]
};

export const timeRules: FieldValidation = {
  fieldName: 'time',
  displayName: 'Appointment Time',
  rules: [rules.required]
};

export const passwordRules: FieldValidation = {
  fieldName: 'password',
  displayName: 'Password',
  rules: [
    rules.required,
    createRule(rules.minLength(8), 'Password must be at least 8 characters')
  ]
};

export const passwordConfirmRules = (passwordField: string = 'password'): FieldValidation => ({
  fieldName: 'passwordConfirm',
  displayName: 'Confirm Password',
  rules: [
    rules.required,
    createRule(rules.match(passwordField), 'Passwords must match')
  ]
});

export const addressRules: FieldValidation = {
  fieldName: 'address',
  displayName: 'Street Address',
  rules: [rules.required]
};

export const cityRules: FieldValidation = {
  fieldName: 'city', 
  displayName: 'City',
  rules: [rules.required]
};

export const stateRules: FieldValidation = {
  fieldName: 'state',
  displayName: 'State',
  rules: [rules.required]
};

export const zipRules: FieldValidation = {
  fieldName: 'zip',
  displayName: 'ZIP Code',
  rules: [
    rules.required,
    createRule(rules.numeric, 'ZIP code must be numeric'),
    createRule(
      value => !value || (String(value).length >= 5 && String(value).length <= 10),
      'ZIP code must be between 5 and 10 characters'
    )
  ]
};

export const ageRules: FieldValidation = {
  fieldName: 'age',
  displayName: 'Age',
  rules: [
    rules.required,
    createRule(rules.numeric, 'Age must be a number'),
    createRule(
      value => !value || parseInt(String(value)) >= 18,
      'You must be at least 18 years old'
    )
  ]
};

// Create validators for common form types
export const createContactFormValidator = (): FormValidator => {
  return new FormValidator([
    nameRules,
    emailRules,
    phoneRules
  ]);
};

export const createAppointmentFormValidator = (): FormValidator => {
  return new FormValidator([
    nameRules,
    emailRules,
    phoneRules,
    programRules,
    dateRules,
    timeRules
  ]);
};

export const createRegistrationFormValidator = (): FormValidator => {
  return new FormValidator([
    nameRules,
    emailRules,
    phoneRules,
    passwordRules,
    passwordConfirmRules()
  ]);
};

export const createAddressFormValidator = (): FormValidator => {
  return new FormValidator([
    addressRules,
    cityRules,
    stateRules,
    zipRules
  ]);
};

export default {
  createContactFormValidator,
  createAppointmentFormValidator,
  createRegistrationFormValidator,
  createAddressFormValidator
}; 