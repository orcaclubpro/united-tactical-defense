/**
 * Lead Service
 * Business logic implementation for lead management
 */

const { LeadServiceInterface } = require('../../core/interfaces/services');
const Lead = require('../../core/entities/lead');

class LeadService extends LeadServiceInterface {
  /**
   * Initialize service with repository
   * @param {Object} leadRepository - Lead repository instance
   */
  constructor(leadRepository) {
    super();
    this.leadRepository = leadRepository;
  }

  /**
   * Create a new lead
   * @param {Object} leadData - Lead data
   * @returns {Promise<Object>} - Created lead
   */
  async createLead(leadData) {
    try {
      // Validation is performed in the repository
      const lead = await this.leadRepository.create(leadData);
      
      // You might want to trigger some events here (e.g., email notifications)
      // this.eventEmitter.emit('lead.created', lead);
      
      return lead;
    } catch (error) {
      console.error('Error creating lead in service:', error);
      throw error;
    }
  }

  /**
   * Update lead status
   * @param {string|number} leadId - Lead ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated lead
   */
  async updateStatus(leadId, status) {
    try {
      const lead = await this.leadRepository.findById(leadId);
      
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      // Use domain logic to update status
      lead.updateStatus(status);
      
      // Persist changes
      const updatedLead = await this.leadRepository.update(leadId, { status });
      
      // Trigger events based on status change
      // this.eventEmitter.emit('lead.statusChanged', { 
      //   leadId, 
      //   previousStatus: lead.status, 
      //   newStatus: status 
      // });
      
      return updatedLead;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  }

  /**
   * Assign lead to user
   * @param {string|number} leadId - Lead ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} - Updated lead
   */
  async assignLead(leadId, userId) {
    try {
      // Repository method handles the domain logic
      const lead = await this.leadRepository.assignTo(leadId, userId);
      
      // Trigger events for assignment
      // this.eventEmitter.emit('lead.assigned', { 
      //   leadId, 
      //   userId 
      // });
      
      return lead;
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw error;
    }
  }

  /**
   * Get leads by status
   * @param {string} status - Lead status
   * @returns {Promise<Array>} - Array of leads
   */
  async getLeadsByStatus(status) {
    try {
      return await this.leadRepository.findByStatus(status);
    } catch (error) {
      console.error('Error getting leads by status:', error);
      throw error;
    }
  }

  /**
   * Get all leads with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Object with leads and pagination info
   */
  async getLeads(filter = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const leads = await this.leadRepository.findAll({
        ...filter,
        limit,
        offset
      });
      
      // You might want to get the total count for pagination
      // const total = await this.leadRepository.count(filter);
      
      return {
        leads,
        pagination: {
          page,
          limit,
          // total,
          // totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting leads:', error);
      throw error;
    }
  }

  /**
   * Get lead details by ID
   * @param {string|number} leadId - Lead ID
   * @returns {Promise<Object>} - Lead details
   */
  async getLeadById(leadId) {
    try {
      const lead = await this.leadRepository.findById(leadId);
      
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      return lead;
    } catch (error) {
      console.error('Error getting lead by ID:', error);
      throw error;
    }
  }

  /**
   * Update lead information
   * @param {string|number} leadId - Lead ID
   * @param {Object} data - Updated lead data
   * @returns {Promise<Object>} - Updated lead
   */
  async updateLead(leadId, data) {
    try {
      const lead = await this.leadRepository.findById(leadId);
      
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      // Update lead using repository
      const updatedLead = await this.leadRepository.update(leadId, data);
      
      return updatedLead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  /**
   * Delete a lead
   * @param {string|number} leadId - Lead ID
   * @returns {Promise<boolean>} - Success flag
   */
  async deleteLead(leadId) {
    try {
      return await this.leadRepository.delete(leadId);
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }
}

module.exports = LeadService; 