const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

// Import service and repositories
const FormService = require('../../src/services/form/formService');
const FormRepository = require('../../src/data/repositories/formRepository');
const LeadService = require('../../src/services/lead/leadService');
const EventSystem = require('../../src/utils/eventSystem');

describe('Form Service Tests', () => {
  let formService;
  let formRepositoryStub;
  let leadServiceStub;
  let eventSystemStub;

  beforeEach(() => {
    // Setup stubs
    formRepositoryStub = sinon.createStubInstance(FormRepository);
    leadServiceStub = sinon.createStubInstance(LeadService);
    eventSystemStub = sinon.stub(EventSystem);
    
    // Create service instance with stubbed dependencies
    formService = new FormService(formRepositoryStub, leadServiceStub, eventSystemStub);
  });

  afterEach(() => {
    // Restore stubs
    sinon.restore();
  });

  describe('processFormSubmission', () => {
    it('should save form submission and return the saved form', async () => {
      // Arrange
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        message: 'Test message'
      };
      
      const formType = 'contact';
      
      const savedForm = {
        id: 1,
        formType,
        formData,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };
      
      formRepositoryStub.saveForm.resolves(savedForm);
      eventSystemStub.publish.resolves();
      
      // Act
      const result = await formService.processFormSubmission(formType, formData);
      
      // Assert
      expect(formRepositoryStub.saveForm.calledOnce).to.be.true;
      expect(formRepositoryStub.saveForm.firstCall.args[0]).to.equal(formType);
      expect(formRepositoryStub.saveForm.firstCall.args[1]).to.deep.equal(formData);
      
      expect(eventSystemStub.publish.calledOnce).to.be.true;
      expect(eventSystemStub.publish.firstCall.args[0]).to.equal('form.submitted');
      
      expect(result).to.deep.equal(savedForm);
    });
    
    it('should create a lead when form type is "lead"', async () => {
      // Arrange
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        source: 'website'
      };
      
      const formType = 'lead';
      
      const savedForm = {
        id: 1,
        formType,
        formData,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };
      
      const createdLead = {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        source: 'website',
        status: 'new'
      };
      
      formRepositoryStub.saveForm.resolves(savedForm);
      leadServiceStub.createLead.resolves(createdLead);
      eventSystemStub.publish.resolves();
      
      // Act
      const result = await formService.processFormSubmission(formType, formData);
      
      // Assert
      expect(formRepositoryStub.saveForm.calledOnce).to.be.true;
      expect(leadServiceStub.createLead.calledOnce).to.be.true;
      expect(leadServiceStub.createLead.firstCall.args[0]).to.deep.equal({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: formData.source
      });
      
      expect(eventSystemStub.publish.calledTwice).to.be.true;
      expect(eventSystemStub.publish.firstCall.args[0]).to.equal('form.submitted');
      expect(eventSystemStub.publish.secondCall.args[0]).to.equal('lead.created');
      
      expect(result).to.deep.equal({
        form: savedForm,
        lead: createdLead
      });
    });
    
    it('should handle errors during form processing', async () => {
      // Arrange
      const formData = {
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      const formType = 'contact';
      const errorMessage = 'Database connection error';
      
      formRepositoryStub.saveForm.rejects(new Error(errorMessage));
      
      // Act & Assert
      try {
        await formService.processFormSubmission(formType, formData);
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(errorMessage);
        expect(eventSystemStub.publish.calledOnce).to.be.true;
        expect(eventSystemStub.publish.firstCall.args[0]).to.equal('form.error');
        expect(eventSystemStub.publish.firstCall.args[1]).to.have.property('error');
        expect(eventSystemStub.publish.firstCall.args[1].error.message).to.equal(errorMessage);
      }
    });
  });

  describe('getFormById', () => {
    it('should return form data for valid ID', async () => {
      // Arrange
      const formId = 1;
      const formData = {
        id: formId,
        formType: 'contact',
        formData: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        status: 'submitted',
        createdAt: new Date().toISOString()
      };
      
      formRepositoryStub.getFormById.resolves(formData);
      
      // Act
      const result = await formService.getFormById(formId);
      
      // Assert
      expect(formRepositoryStub.getFormById.calledOnce).to.be.true;
      expect(formRepositoryStub.getFormById.firstCall.args[0]).to.equal(formId);
      expect(result).to.deep.equal(formData);
    });
    
    it('should return null for non-existent form ID', async () => {
      // Arrange
      const formId = 999;
      formRepositoryStub.getFormById.resolves(null);
      
      // Act
      const result = await formService.getFormById(formId);
      
      // Assert
      expect(formRepositoryStub.getFormById.calledOnce).to.be.true;
      expect(result).to.be.null;
    });
  });

  describe('convertFormToLead', () => {
    it('should convert a form submission to a lead', async () => {
      // Arrange
      const formId = 1;
      const formData = {
        id: formId,
        formType: 'contact',
        formData: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          message: 'Interested in services'
        },
        status: 'submitted',
        createdAt: new Date().toISOString()
      };
      
      const createdLead = {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        source: 'website-form',
        notes: 'Interested in services',
        status: 'new'
      };
      
      formRepositoryStub.getFormById.resolves(formData);
      leadServiceStub.createLead.resolves(createdLead);
      formRepositoryStub.updateFormStatus.resolves({
        ...formData,
        status: 'processed',
        leadId: createdLead.id
      });
      eventSystemStub.publish.resolves();
      
      // Act
      const result = await formService.convertFormToLead(formId);
      
      // Assert
      expect(formRepositoryStub.getFormById.calledOnce).to.be.true;
      expect(leadServiceStub.createLead.calledOnce).to.be.true;
      expect(formRepositoryStub.updateFormStatus.calledOnce).to.be.true;
      expect(eventSystemStub.publish.calledOnce).to.be.true;
      
      expect(result).to.deep.equal({
        lead: createdLead,
        form: {
          ...formData,
          status: 'processed',
          leadId: createdLead.id
        }
      });
    });
    
    it('should throw error when form is not found', async () => {
      // Arrange
      const formId = 999;
      formRepositoryStub.getFormById.resolves(null);
      
      // Act & Assert
      try {
        await formService.convertFormToLead(formId);
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Form not found');
      }
    });
    
    it('should throw error when form is already processed', async () => {
      // Arrange
      const formId = 1;
      const formData = {
        id: formId,
        formType: 'contact',
        formData: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        status: 'processed',
        leadId: 123,
        createdAt: new Date().toISOString()
      };
      
      formRepositoryStub.getFormById.resolves(formData);
      
      // Act & Assert
      try {
        await formService.convertFormToLead(formId);
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('already processed');
      }
    });
  });
}); 