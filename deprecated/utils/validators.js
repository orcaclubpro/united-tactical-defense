/**
 * Validates appointment data
 * @param {Object} data - The appointment data to validate
 * @returns {Object} Validation result with isValid boolean and errors object
 */
exports.validateAppointment = (data) => {
  const { first_name, last_name, email, phone, sel_time } = data;
  const errors = {};
  
  // Validate first name
  if (!first_name || first_name.trim() === '') {
    errors.first_name = 'First name is required';
  }
  
  // Validate last name
  if (!last_name || last_name.trim() === '') {
    errors.last_name = 'Last name is required';
  }
  
  // Validate email
  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }
  
  // Validate phone
  if (!phone || phone.trim() === '') {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Please provide a valid phone number';
  }
  
  // Validate selected time
  if (!sel_time || sel_time.trim() === '') {
    errors.sel_time = 'Appointment time is required';
  } else if (!isValidTimeFormat(sel_time)) {
    errors.sel_time = 'Please provide a valid appointment time';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates time format for appointments
 * @param {string} time - Time string to validate
 * @returns {boolean} Whether the time format is valid
 */
function isValidTimeFormat(time) {
  // Regex to match ISO 8601 format with timezone offset
  const timeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
  return timeRegex.test(time);
}

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
function isValidPhone(phone) {
  // Basic phone validation - allows digits, spaces, dashes, parentheses
  const phoneRegex = /^[\d\s\-()]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10;
}
