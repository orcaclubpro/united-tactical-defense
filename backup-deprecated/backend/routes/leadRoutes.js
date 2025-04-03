const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// GET all leads
router.get('/', leadController.getAllLeads);

// GET lead by ID
router.get('/:id', leadController.getLeadById);

// POST create new lead
router.post('/', leadController.createLead);

// PUT update lead
router.put('/:id', leadController.updateLead);

// DELETE lead
router.delete('/:id', leadController.deleteLead);

module.exports = router; 