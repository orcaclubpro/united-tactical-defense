/**
 * Form Service Implementation
 * Business logic for form processing
 */

const { FormServiceInterface } = require('../../core/interfaces/services');
const { Form, FormSubmissionEvent } = require('../../core/entities');
const formRepository = require('../../data/repositories/formRepository');
const leadRepository = require('../../data/repositories/leadRepository');
const { v4: uuidv4 } = require('uuid');
const formAdapters = require('./adapters');
const axios = require('axios');
const appointmentService = require('../appointment/appointmentService');

class FormService extends FormServiceInterface {
  /**
   * Initialize with optional dependencies
   * @param {Object} deps - Dependencies
   * @param {Object} deps.eventEmitter - Event emitter for publishing form events
   */
  constructor(deps = {}) {
    super();
    this.eventEmitter = deps.eventEmitter || null;
  }

  /**
   * Process form submission
   * @param {string} formType - Form type
   * @param {Object} formData - Form data
   * @param {Object} requestInfo - Additional request information
   * @returns {Promise<Object>} - Processing result
   */
  async processFormSubmission(formType, formData, requestInfo = {}) {
    try {
      const startTime = Date.now();
      
      // Get form configuration
      const formConfig = await this.getFormConfig(formType);
      
      // Create form entity
      const form = new Form({
        id: uuidv4(),
        type: formType,
        fields: formConfig.fields,
        validationRules: formConfig.validationRules,
        data: formData,
        status: 'new',
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent
      });
      
      // Validate form data
      const validationResult = form.validate();
      if (!validationResult.isValid) {
        // If using event emitter, emit validation error event
        if (this.eventEmitter) {
          const errorEvent = new FormSubmissionEvent({
            formType,
            userId: requestInfo.userId,
            sessionId: requestInfo.sessionId,
            formData,
            metadata: {
              source: requestInfo.referer || 'direct',
            },
            ipAddress: requestInfo.ipAddress,
            userAgent: requestInfo.userAgent,
            referer: requestInfo.referer || '',
            status: 'error',
            errorDetails: {
              type: 'validation',
              errors: validationResult.errors
            },
            timestamp: new Date()
          });
          
          this.eventEmitter.emit('form.error', errorEvent);
        }
        
        return {
          success: false,
          status: 'validation_failed',
          errors: validationResult.errors
        };
      }
      
      // Save form to repository
      const savedForm = await formRepository.create(form);
      
      // Create form submission event for tracking (before processing)
      if (this.eventEmitter) {
        const submissionEvent = new FormSubmissionEvent({
          formType,
          formId: savedForm.id,
          userId: requestInfo.userId,
          sessionId: requestInfo.sessionId,
          formData,
          metadata: {
            source: requestInfo.referer || 'direct',
          },
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          referer: requestInfo.referer || '',
          status: 'submitted',
          timestamp: new Date()
        });
        
        this.eventEmitter.emit('form.submitted', submissionEvent);
      }
      
      // Process based on form type
      let processingResult;
      
      switch (formType) {
        case 'contact':
          processingResult = await this._processContactForm(savedForm);
          break;
        case 'assessment':
          processingResult = await this._processAssessmentForm(savedForm);
          break;
        case 'appointment':
          processingResult = await this._processAppointmentForm(savedForm);
          break;
        default:
          processingResult = {
            success: true,
            status: 'completed',
            message: 'Form submitted successfully'
          };
      }
      
      // Update form status
      await formRepository.update(savedForm.id, {
        status: processingResult.success ? 'completed' : 'failed',
        processingResult
      });
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Emit processed event if using event emitter
      if (this.eventEmitter && processingResult.success) {
        const processedEvent = new FormSubmissionEvent({
          formType,
          formId: savedForm.id,
          userId: requestInfo.userId,
          sessionId: requestInfo.sessionId,
          formData,
          metadata: {
            source: requestInfo.referer || 'direct',
            result: processingResult.status,
            conversionType: processingResult.data?.conversionType,
            conversionId: processingResult.data?.leadId || processingResult.data?.appointmentId
          },
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          referer: requestInfo.referer || '',
          status: 'processed',
          processingTime,
          timestamp: new Date()
        });
        
        this.eventEmitter.emit('form.processed', processedEvent);
        
        // If a conversion happened, emit a conversion event
        if (processingResult.data?.leadId || processingResult.data?.appointmentId) {
          const conversionEvent = new FormSubmissionEvent({
            formType,
            formId: savedForm.id,
            userId: requestInfo.userId,
            sessionId: requestInfo.sessionId,
            metadata: {
              conversionType: processingResult.data.leadId ? 'lead' : 'appointment',
              conversionId: processingResult.data.leadId || processingResult.data.appointmentId,
              timeToConversion: processingTime
            },
            timestamp: new Date()
          });
          
          this.eventEmitter.emit('form.converted', conversionEvent);
        }
      } else if (this.eventEmitter && !processingResult.success) {
        // Emit error event
        const errorEvent = new FormSubmissionEvent({
          formType,
          formId: savedForm.id,
          userId: requestInfo.userId,
          sessionId: requestInfo.sessionId,
          metadata: {
            source: requestInfo.referer || 'direct'
          },
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          referer: requestInfo.referer || '',
          status: 'error',
          errorDetails: {
            type: 'processing',
            message: processingResult.message || 'Processing failed',
            error: processingResult.error
          },
          timestamp: new Date()
        });
        
        this.eventEmitter.emit('form.error', errorEvent);
      }
      
      return {
        success: processingResult.success,
        formId: savedForm.id,
        message: processingResult.message,
        status: processingResult.status || (processingResult.success ? 'completed' : 'failed'),
        data: processingResult.data || {}
      };
    } catch (error) {
      console.error('Error in FormService.processFormSubmission:', error);
      throw error;
    }
  }

  /**
   * Validate form data
   * @param {string} formType - Form type
   * @param {Object} formData - Form data
   * @returns {Promise<Object>} - Validation result with errors if any
   */
  async validateForm(formType, formData) {
    try {
      // Get form configuration
      const formConfig = await this.getFormConfig(formType);
      
      // Create form entity without saving
      const form = new Form({
        type: formType,
        fields: formConfig.fields,
        validationRules: formConfig.validationRules,
        data: formData
      });
      
      // Validate the form
      return form.validate();
    } catch (error) {
      console.error('Error in FormService.validateForm:', error);
      throw error;
    }
  }

  /**
   * Get form configuration
   * @param {string} formType - Form type
   * @returns {Promise<Object>} - Form configuration
   */
  async getFormConfig(formType) {
    try {
      // In a real system, this might be fetched from a database or config file
      const formConfigs = {
        contact: {
          fields: {
            firstName: { type: 'text', label: 'First Name' },
            lastName: { type: 'text', label: 'Last Name' },
            email: { type: 'email', label: 'Email' },
            phone: { type: 'tel', label: 'Phone' },
            message: { type: 'textarea', label: 'Message' }
          },
          validationRules: {
            firstName: { required: true, maxLength: 50 },
            lastName: { required: true, maxLength: 50 },
            email: { required: true, type: 'email', maxLength: 100 },
            phone: { required: false, type: 'phone', maxLength: 20 },
            message: { required: true, maxLength: 1000 }
          }
        },
        assessment: {
          fields: {
            firstName: { type: 'text', label: 'First Name' },
            lastName: { type: 'text', label: 'Last Name' },
            email: { type: 'email', label: 'Email' },
            phone: { type: 'tel', label: 'Phone' },
            securityConcerns: { type: 'textarea', label: 'Security Concerns' },
            propertyType: { type: 'select', label: 'Property Type' },
            budget: { type: 'select', label: 'Budget Range' }
          },
          validationRules: {
            firstName: { required: true, maxLength: 50 },
            lastName: { required: true, maxLength: 50 },
            email: { required: true, type: 'email', maxLength: 100 },
            phone: { required: true, type: 'phone', maxLength: 20 },
            securityConcerns: { required: true, maxLength: 1000 },
            propertyType: { required: true },
            budget: { required: true }
          }
        },
        appointment: {
          fields: {
            firstName: { type: 'text', label: 'First Name' },
            lastName: { type: 'text', label: 'Last Name' },
            email: { type: 'email', label: 'Email' },
            phone: { type: 'tel', label: 'Phone' },
            preferredDate: { type: 'date', label: 'Preferred Date' },
            preferredTime: { type: 'select', label: 'Preferred Time' },
            notes: { type: 'textarea', label: 'Additional Notes' }
          },
          validationRules: {
            firstName: { required: true, maxLength: 50 },
            lastName: { required: true, maxLength: 50 },
            email: { required: true, type: 'email', maxLength: 100 },
            phone: { required: true, type: 'phone', maxLength: 20 },
            preferredDate: { required: true },
            preferredTime: { required: true },
            notes: { required: false, maxLength: 500 }
          }
        }
      };
      
      // Return configuration for requested form type
      if (!formConfigs[formType]) {
        throw new Error(`Form type ${formType} not found`);
      }
      
      return formConfigs[formType];
    } catch (error) {
      console.error('Error in FormService.getFormConfig:', error);
      throw error;
    }
  }
  
  /**
   * Process contact form
   * @param {Form} form - Form entity
   * @returns {Promise<Object>} - Processing result
   * @private
   */
  async _processContactForm(form) {
    try {
      // Convert form to lead
      const leadData = {
        firstName: form.data.firstName,
        lastName: form.data.lastName,
        email: form.data.email,
        phone: form.data.phone || '',
        source: 'contact_form',
        status: 'new',
        notes: form.data.message || ''
      };
      
      // Create lead
      const lead = await leadRepository.create(leadData);
      
      // Update form with conversion information
      form.convertTo('lead', lead.id);
      await formRepository.update(form.id, { convertedTo: form.convertedTo });
      
      return {
        success: true,
        status: 'completed',
        message: 'Contact form processed successfully',
        data: {
          leadId: lead.id
        }
      };
    } catch (error) {
      console.error('Error in FormService._processContactForm:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to process contact form',
        error: error.message
      };
    }
  }
  
  /**
   * Process assessment form
   * @param {Form} form - Form entity
   * @returns {Promise<Object>} - Processing result
   * @private
   */
  async _processAssessmentForm(form) {
    try {
      // Convert form to lead with assessment information
      const leadData = {
        firstName: form.data.firstName,
        lastName: form.data.lastName,
        email: form.data.email,
        phone: form.data.phone || '',
        source: 'assessment_form',
        status: 'qualified',
        notes: `Security Concerns: ${form.data.securityConcerns}\nProperty Type: ${form.data.propertyType}\nBudget: ${form.data.budget}`
      };
      
      // Create lead
      const lead = await leadRepository.create(leadData);
      
      // Update form with conversion information
      form.convertTo('lead', lead.id);
      await formRepository.update(form.id, { convertedTo: form.convertedTo });
      
      return {
        success: true,
        status: 'completed',
        message: 'Assessment form processed successfully',
        data: {
          leadId: lead.id,
          priority: this._calculatePriority(form.data)
        }
      };
    } catch (error) {
      console.error('Error in FormService._processAssessmentForm:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to process assessment form',
        error: error.message
      };
    }
  }
  
  /**
   * Process appointment form
   * @param {Form} form - Form entity
   * @returns {Promise<Object>} - Processing result
   * @private
   */
  async _processAppointmentForm(form) {
    try {
      // First, convert form to lead if not existing
      const existingLead = await leadRepository.findByEmail(form.data.email);
      
      let leadId;
      
      if (existingLead) {
        leadId = existingLead.id;
        
        // Update existing lead
        await leadRepository.update(leadId, {
          status: 'appointment_scheduled',
          notes: `${existingLead.notes}\n\nAppointment requested: ${form.data.preferredDate} at ${form.data.preferredTime}. Notes: ${form.data.notes || 'None'}`
        });
      } else {
        // Create new lead
        const leadData = {
          firstName: form.data.firstName,
          lastName: form.data.lastName,
          email: form.data.email,
          phone: form.data.phone || '',
          source: 'appointment_form',
          status: 'appointment_scheduled',
          notes: `Appointment requested: ${form.data.preferredDate} at ${form.data.preferredTime}. Notes: ${form.data.notes || 'None'}`
        };
        
        const lead = await leadRepository.create(leadData);
        leadId = lead.id;
      }
      
      // Update form with conversion information
      form.convertTo('lead', leadId);
      await formRepository.update(form.id, { convertedTo: form.convertedTo });
      
      // Appointment creation would normally go here, but we're keeping the implementation focused on form processing
      
      return {
        success: true,
        status: 'completed',
        message: 'Appointment form processed successfully',
        data: {
          leadId: leadId,
          appointmentDate: form.data.preferredDate,
          appointmentTime: form.data.preferredTime
        }
      };
    } catch (error) {
      console.error('Error in FormService._processAppointmentForm:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Failed to process appointment form',
        error: error.message
      };
    }
  }
  
  /**
   * Calculate priority score for assessment
   * @param {Object} formData - Assessment form data
   * @returns {string} - Priority level (high, medium, low)
   * @private
   */
  _calculatePriority(formData) {
    // Simple priority calculation based on budget and property type
    let score = 0;
    
    // Budget score
    if (formData.budget === 'Over $10,000') {
      score += 5;
    } else if (formData.budget === '$5,000 - $10,000') {
      score += 3;
    } else {
      score += 1;
    }
    
    // Property type score
    if (formData.propertyType === 'Commercial') {
      score += 5;
    } else if (formData.propertyType === 'Residential (Large)') {
      score += 3;
    } else {
      score += 1;
    }
    
    // Determine priority level
    if (score >= 8) {
      return 'high';
    } else if (score >= 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Process external appointment form submission using a specific adapter
   * @param {string} adapterName - Name of the adapter to use
   * @param {Object} externalData - External form data
   * @param {Object} requestInfo - Additional request information
   * @returns {Promise<Object>} - Processing result
   */
  async processExternalAppointmentSubmission(adapterName, externalData, requestInfo = {}) {
    try {
      // Get the appropriate adapter
      const adapter = formAdapters[adapterName];
      if (!adapter) {
        throw new Error(`Adapter ${adapterName} not found`);
      }
      
      // Validate external data using the adapter
      const validationResult = adapter.validateExternalData(externalData);
      if (!validationResult.isValid) {
        return {
          success: false,
          status: 'validation_failed',
          errors: validationResult.errors
        };
      }
      
      // Convert external data to internal format
      const internalData = adapter.convertToInternalFormat(externalData);
      
      // Save as form submission
      const form = new Form({
        id: uuidv4(),
        type: 'appointment',
        fields: await this.getFormConfig('appointment').fields,
        validationRules: await this.getFormConfig('appointment').validationRules,
        data: internalData,
        status: 'new',
        ipAddress: requestInfo.ipAddress || internalData.metadata?.ipAddress,
        userAgent: requestInfo.userAgent || internalData.metadata?.userAgent
      });
      
      // Save form to repository
      const savedForm = await formRepository.create(form);
      
      // Process as appointment
      const processingResult = await this._processAppointmentForm(savedForm);
      
      // Forward to external system if configuration is available
      let forwardingResult = null;
      if (process.env.FORWARD_APPOINTMENTS === 'true') {
        forwardingResult = await this._forwardAppointmentToExternalSystem(adapter, internalData);
      }
      
      // Update form status and add forwarding result
      await formRepository.update(savedForm.id, {
        status: processingResult.success ? 'completed' : 'failed',
        processingResult,
        forwardingResult
      });
      
      return {
        success: processingResult.success,
        formId: savedForm.id,
        message: processingResult.message,
        data: processingResult.data || {},
        forwarded: forwardingResult ? forwardingResult.success : false
      };
    } catch (error) {
      console.error('Error in FormService.processExternalAppointmentSubmission:', error);
      throw error;
    }
  }
  
  /**
   * Forward appointment to external system
   * @param {Object} adapter - Form adapter to use
   * @param {Object} internalData - Internal form data
   * @returns {Promise<Object>} - Forwarding result
   * @private
   */
  async _forwardAppointmentToExternalSystem(adapter, internalData) {
    try {
      // Convert internal data back to external format
      const externalFormat = adapter.convertToExternalFormat(internalData);
      
      // Configuration for the external API
      const externalApiUrl = process.env.EXTERNAL_APPOINTMENT_API || 'https://backend.leadconnectorhq.com/appengine/appointment';
      
      // Prepare headers
      const headers = {
        'Content-Type': `multipart/form-data; boundary=${externalFormat.boundary}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': 'https://anaheimhills.uniteddefensetactical.com/',
        'fullurl': 'https://anaheimhills.uniteddefensetactical.com/calendar-free-pass',
        'timezone': internalData.timezone || 'America/Los_Angeles',
        'Origin': 'https://anaheimhills.uniteddefensetactical.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      };
      
      // Make the actual request
      const response = await axios.post(externalApiUrl, externalFormat.body, { headers });
      
      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('Error forwarding appointment to external system:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status || 500
      };
    }
  }
}

module.exports = FormService; 