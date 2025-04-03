/**
 * GoHighLevel Form Adapter
 * Converts between GoHighLevel form data format and internal format
 */

const { FormAdapterInterface } = require('../../../core/interfaces/adapters/formAdapter');

class GoHighLevelAdapter extends FormAdapterInterface {
  /**
   * Convert GoHighLevel appointment form data to internal format
   * @param {Object} externalData - GoHighLevel form data
   * @returns {Object} - Internal form data
   */
  convertToInternalFormat(externalData) {
    // Extract form data from GoHighLevel format
    let formData = {};
    
    // For appointment submissions, the actual form data is nested
    const data = typeof externalData.formData === 'string' 
      ? JSON.parse(externalData.formData) 
      : externalData.formData || externalData;
    
    // Extract core appointment data
    formData = {
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      email: data.email || '',
      phone: data.phone || '',
      notes: data.notes || '',
      source: 'goHighLevel',
      
      // Appointment specific fields
      preferredDate: data.selected_slot ? new Date(data.selected_slot).toISOString().split('T')[0] : '',
      preferredTime: data.selected_slot ? new Date(data.selected_slot).toTimeString().split(' ')[0].substring(0, 5) : '',
      timezone: data.selected_timezone || data.Timezone || 'America/Los_Angeles',
      locationId: data.location_id || externalData.locationId || '',
      formId: data.formId || externalData.formId || '',
      
      // Additional metadata
      metadata: {
        sessionId: data.sessionId || '',
        sessionFingerprint: data.sessionFingerprint || '',
        eventData: data.eventData || {},
        funnelEventData: data.funneEventData || {},
        timeSpent: data.timeSpent || 0,
        originalRequest: data
      }
    };
    
    return formData;
  }

  /**
   * Convert internal form data to GoHighLevel format
   * @param {Object} internalData - Internal form data
   * @returns {Object} - GoHighLevel form data
   */
  convertToExternalFormat(internalData) {
    // Format date/time to ISO string with timezone
    const dateTimeString = `${internalData.preferredDate}T${internalData.preferredTime}:00`;
    const dateObj = new Date(dateTimeString);
    const isoString = dateObj.toISOString();
    
    const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
    
    // Prepare form data in GoHighLevel format
    const formData = {
      cLNizIhBIdwpbrfvmqH8: [],
      first_name: internalData.firstName,
      last_name: internalData.lastName,
      phone: internalData.phone,
      email: internalData.email,
      formId: internalData.formId || 'bHbGRJjmTWG67GNRFqQY',
      location_id: internalData.locationId || 'wCjIiRV3L99XP2J5wYdA',
      calendar_id: 'EwO4iAyVRl5dqwH9pi1O',
      selected_slot: isoString,
      selected_timezone: internalData.timezone || 'America/Los_Angeles',
      sessionId: internalData.metadata?.sessionId || '',
      eventData: internalData.metadata?.eventData || {},
      sessionFingerprint: internalData.metadata?.sessionFingerprint || '',
      funneEventData: internalData.metadata?.funnelEventData || {},
      dateFieldDetails: [],
      Timezone: `${internalData.timezone} (GMT-07:00)`,
      paymentContactId: {},
      timeSpent: internalData.metadata?.timeSpent || 0
    };
    
    // Create multipart form body
    let body = '';
    
    // Add formData part
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="formData"\r\n\r\n';
    body += JSON.stringify(formData) + '\r\n';
    
    // Add locationId part
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="locationId"\r\n\r\n';
    body += (internalData.locationId || 'wCjIiRV3L99XP2J5wYdA') + '\r\n';
    
    // Add formId part
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="formId"\r\n\r\n';
    body += (internalData.formId || 'bHbGRJjmTWG67GNRFqQY') + '\r\n';
    
    // Add captchaV3 part if provided
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="captchaV3"\r\n\r\n';
    body += (internalData.captchaToken || 'CAPTCHA_TOKEN_PLACEHOLDER') + '\r\n';
    
    // Close the body
    body += `--${boundary}--\r\n`;
    
    return {
      body,
      boundary,
      formData
    };
  }

  /**
   * Validate GoHighLevel form data
   * @param {Object} externalData - GoHighLevel form data
   * @returns {Object} - Validation result
   */
  validateExternalData(externalData) {
    const errors = {};
    const formData = typeof externalData.formData === 'string' 
      ? JSON.parse(externalData.formData) 
      : externalData.formData || externalData;
    
    // Validate required fields
    if (!formData.first_name) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.phone) {
      errors.phone = 'Phone is required';
    }
    
    if (!formData.selected_slot) {
      errors.selected_slot = 'Appointment time is required';
    }
    
    if (!formData.location_id && !externalData.locationId) {
      errors.location_id = 'Location ID is required';
    }
    
    if (!formData.formId && !externalData.formId) {
      errors.formId = 'Form ID is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = new GoHighLevelAdapter(); 