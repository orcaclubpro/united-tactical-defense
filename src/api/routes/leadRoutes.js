/**
 * Lead Routes
 */

const express = require('express');
const leadController = require('../controllers/leadController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validators');

const router = express.Router();

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validate(schemas.lead.create),
  leadController.createLead
);

/**
 * @route   GET /api/leads
 * @desc    Get all leads with pagination and filtering
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  leadController.getLeads
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get lead by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  leadController.getLeadById
);

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead information
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  validate(schemas.lead.update),
  leadController.updateLead
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'manager']),
  leadController.deleteLead
);

/**
 * @route   PUT /api/leads/:id/status
 * @desc    Update lead status
 * @access  Private
 */
router.put(
  '/:id/status',
  authenticate,
  leadController.updateLeadStatus
);

/**
 * @route   PUT /api/leads/:id/assign
 * @desc    Assign lead to a user
 * @access  Private (Admin or Manager)
 */
router.put(
  '/:id/assign',
  authenticate,
  authorize(['admin', 'manager']),
  leadController.assignLead
);

module.exports = router; 