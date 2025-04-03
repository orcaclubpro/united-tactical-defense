/**
 * Lead Service Unit Tests
 */

const { expect } = require('chai');
const sinon = require('sinon');
const LeadService = require('../../src/services/lead/leadService');
const Lead = require('../../src/core/entities/lead');

describe('LeadService', () => {
  let leadService;
  let mockLeadRepository;
  
  beforeEach(() => {
    // Create mock repository with stubbed methods
    mockLeadRepository = {
      create: sinon.stub(),
      findById: sinon.stub(),
      findAll: sinon.stub(),
      update: sinon.stub(),
      delete: sinon.stub(),
      findByStatus: sinon.stub(),
      assignTo: sinon.stub()
    };
    
    // Initialize service with mock repository
    leadService = new LeadService(mockLeadRepository);
  });
  
  afterEach(() => {
    // Reset all stubs after each test
    sinon.restore();
  });
  
  describe('createLead', () => {
    it('should create a new lead', async () => {
      // Setup
      const leadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        source: 'website'
      };
      
      const createdLead = new Lead({
        id: 1,
        ...leadData,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      mockLeadRepository.create.resolves(createdLead);
      
      // Execute
      const result = await leadService.createLead(leadData);
      
      // Verify
      expect(mockLeadRepository.create.calledOnce).to.be.true;
      expect(mockLeadRepository.create.calledWith(leadData)).to.be.true;
      expect(result).to.deep.equal(createdLead);
    });
    
    it('should throw an error if repository fails', async () => {
      // Setup
      const leadData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        source: 'website'
      };
      
      const error = new Error('Repository error');
      mockLeadRepository.create.rejects(error);
      
      // Execute and verify
      try {
        await leadService.createLead(leadData);
        // Should not reach here
        expect.fail('Expected error was not thrown');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });
  
  describe('updateStatus', () => {
    it('should update lead status', async () => {
      // Setup
      const leadId = 1;
      const status = 'qualified';
      
      const lead = new Lead({
        id: leadId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        source: 'website',
        status: 'new'
      });
      
      const updatedLead = new Lead({
        ...lead,
        status,
        updatedAt: new Date().toISOString()
      });
      
      mockLeadRepository.findById.resolves(lead);
      mockLeadRepository.update.resolves(updatedLead);
      
      // Execute
      const result = await leadService.updateStatus(leadId, status);
      
      // Verify
      expect(mockLeadRepository.findById.calledOnce).to.be.true;
      expect(mockLeadRepository.findById.calledWith(leadId)).to.be.true;
      expect(mockLeadRepository.update.calledOnce).to.be.true;
      expect(mockLeadRepository.update.calledWith(leadId, { status })).to.be.true;
      expect(result).to.deep.equal(updatedLead);
    });
    
    it('should throw an error if lead not found', async () => {
      // Setup
      const leadId = 999;
      const status = 'qualified';
      
      mockLeadRepository.findById.resolves(null);
      
      // Execute and verify
      try {
        await leadService.updateStatus(leadId, status);
        // Should not reach here
        expect.fail('Expected error was not thrown');
      } catch (err) {
        expect(err.message).to.equal('Lead not found');
      }
    });
  });
  
  describe('assignLead', () => {
    it('should assign lead to user', async () => {
      // Setup
      const leadId = 1;
      const userId = 10;
      
      const lead = new Lead({
        id: leadId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        source: 'website',
        status: 'new'
      });
      
      const updatedLead = new Lead({
        ...lead,
        assignedTo: userId,
        updatedAt: new Date().toISOString()
      });
      
      mockLeadRepository.assignTo.resolves(updatedLead);
      
      // Execute
      const result = await leadService.assignLead(leadId, userId);
      
      // Verify
      expect(mockLeadRepository.assignTo.calledOnce).to.be.true;
      expect(mockLeadRepository.assignTo.calledWith(leadId, userId)).to.be.true;
      expect(result).to.deep.equal(updatedLead);
    });
  });
  
  describe('getLeadsByStatus', () => {
    it('should get leads by status', async () => {
      // Setup
      const status = 'new';
      const leads = [
        new Lead({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          source: 'website',
          status
        }),
        new Lead({
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          source: 'social_media',
          status
        })
      ];
      
      mockLeadRepository.findByStatus.resolves(leads);
      
      // Execute
      const result = await leadService.getLeadsByStatus(status);
      
      // Verify
      expect(mockLeadRepository.findByStatus.calledOnce).to.be.true;
      expect(mockLeadRepository.findByStatus.calledWith(status)).to.be.true;
      expect(result).to.deep.equal(leads);
    });
  });
}); 