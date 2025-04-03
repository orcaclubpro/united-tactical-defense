// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (basic format)
const isValidPhone = (phone) => {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
  // Ensure there are at least some digits
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 7;
};

// Form validation
const validateFormData = (formData) => {
  const errors = {};
  
  // Validate first name
  if (!formData.first_name || formData.first_name.trim() === '') {
    errors.first_name = 'First name is required';
  }
  
  // Validate last name
  if (!formData.last_name || formData.last_name.trim() === '') {
    errors.last_name = 'Last name is required';
  }
  
  // Validate email
  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Valid email is required';
  }
  
  // Validate phone
  if (!formData.phone || !isValidPhone(formData.phone)) {
    errors.phone = 'Valid phone number is required';
  }
  
  // Validate appointment date
  if (!formData.appointment_date) {
    errors.appointment_date = 'Appointment date is required';
  } else {
    // Check if date is in the future
    const appointmentDate = new Date(`${formData.appointment_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      errors.appointment_date = 'Appointment date must be in the future';
    }
  }
  
  // Validate appointment time
  if (!formData.appointment_time) {
    errors.appointment_time = 'Appointment time is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  validateFormData
}; 