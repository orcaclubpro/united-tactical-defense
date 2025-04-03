/**
 * Lead Controller
 * Handles HTTP requests for lead management endpoints
 */

/**
 * Dependency Injection Container
 * Will be set during application bootstrap
 */
let leadService = null;

/**
 * Set the lead service implementation
 * @param {Object} service - Lead service implementation
 */
const setLeadService = (service) => {
  leadService = service;
};

/**
 * Create a new lead
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createLead = async (req, res, next) => {
  try {
    if (!leadService) {
      throw new Error('Lead service not initialized');
    }

    const leadData = req.body;
    const lead = await leadService.createLead(leadData);

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all leads with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeads = async (req, res, next) => {
  try {
    if (!leadService) {
      throw new Error('Lead service not initialized');
    }

    const { page = 1, limit = 10, status, source, assignedTo } = req.query;
    
    // Build filter object from query params
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    const result = await leadService.getLeads(filter, parseInt(page), parseInt(limit));

    res.status(200).json({
      success: true,
      data: result.leads,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get lead by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getLeadById = async (req, res, next) => {
  try {
    if (!leadService) {
      throw new Error('Lead service not initialized');
    }

    const { id } = req.params;
    const lead = await leadService.getLeadById(id);

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lead status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateLeadStatus = async (req, res, next) => {
  try {
    if (!leadService) {
      throw new Error('Lead service not initialized');
    }

    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const lead = await leadService.updateStatus(id, status);

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign lead to a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const assignLead = async (req, res, next) => {
  try {
    if (!leadService) {
      throw new Error('Lead service not initialized');
    }

    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const lead = await leadService.assignLead(id, userId);

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lead information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateLead = async (req, res, next) => {
  try {
    if (!leadService) {
      throw new Error('Lead service not initialized');
    }

    const { id } = req.params;
    const data = req.body;

    const lead = await leadService.updateLead(id, data);

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a lead
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteLead = async (req, res, next) => {
  try {
    if (!leadService) {
      throw new Error('Lead service not initialized');
    }

    const { id } = req.params;
    await leadService.deleteLead(id);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setLeadService,
  createLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  assignLead,
  updateLead,
  deleteLead
}; 