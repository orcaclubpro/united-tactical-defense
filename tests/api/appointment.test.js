const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;

// Import server app
const app = require('../../src/app');

// Import services and repositories for mocking
const AppointmentService = require('../../src/services/appointment/appointmentService');
const AppointmentRepository = require('../../src/data/repositories/appointmentRepository');
const LeadService = require('../../src/services/lead/leadService');

chai.use(chaiHttp);

describe('Appointment API Tests', () => {
  let appointmentServiceStub;
  let appointmentRepositoryStub;
  let leadServiceStub;
  let authToken;

  beforeEach(() => {
    // Setup stubs
    appointmentServiceStub = sinon.stub(AppointmentService.prototype);
    appointmentRepositoryStub = sinon.stub(AppointmentRepository.prototype);
    leadServiceStub = sinon.stub(LeadService.prototype);
    
    // Mock JWT token
    authToken = 'Bearer mock-jwt-token';
  });

  afterEach(() => {
    // Restore stubs
    sinon.restore();
  });

  describe('GET /api/appointments/available', () => {
    it('should return available time slots for a given date', async () => {
      const mockAvailability = [
        { date: '2023-06-15', startTime: '09:00', endTime: '10:00' },
        { date: '2023-06-15', startTime: '11:00', endTime: '12:00' },
        { date: '2023-06-15', startTime: '14:00', endTime: '15:00' }
      ];
      
      appointmentServiceStub.getAvailableSlots.resolves(mockAvailability);

      const response = await chai.request(app)
        .get('/api/appointments/available')
        .query({ date: '2023-06-15' });

      expect(response).to.have.status(200);
      expect(response.body).to.be.an('array');
      expect(response.body).to.have.lengthOf(3);
      expect(response.body[0]).to.have.property('date');
      expect(response.body[0]).to.have.property('startTime');
      expect(response.body[0]).to.have.property('endTime');
    });

    it('should return 400 with invalid date format', async () => {
      const response = await chai.request(app)
        .get('/api/appointments/available')
        .query({ date: 'invalid-date' });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('errors');
    });
    
    it('should return empty array when no slots available', async () => {
      appointmentServiceStub.getAvailableSlots.resolves([]);

      const response = await chai.request(app)
        .get('/api/appointments/available')
        .query({ date: '2023-06-16' });

      expect(response).to.have.status(200);
      expect(response.body).to.be.an('array');
      expect(response.body).to.have.lengthOf(0);
    });
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment successfully', async () => {
      const mockAppointment = {
        id: 1,
        date: '2023-06-15',
        startTime: '09:00',
        endTime: '10:00',
        status: 'scheduled',
        leadId: 123,
        createdAt: new Date().toISOString()
      };
      
      appointmentServiceStub.createAppointment.resolves(mockAppointment);

      const response = await chai.request(app)
        .post('/api/appointments')
        .set('Authorization', authToken)
        .send({
          date: '2023-06-15',
          startTime: '09:00',
          endTime: '10:00',
          leadId: 123,
          notes: 'First free lesson'
        });

      expect(response).to.have.status(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('date', '2023-06-15');
      expect(response.body).to.have.property('status', 'scheduled');
    });

    it('should return 400 with incomplete appointment data', async () => {
      const response = await chai.request(app)
        .post('/api/appointments')
        .set('Authorization', authToken)
        .send({
          // Missing required fields
          leadId: 123
        });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('errors');
    });
    
    it('should return 409 when time slot is no longer available', async () => {
      appointmentServiceStub.createAppointment.rejects(new Error('Time slot not available'));

      const response = await chai.request(app)
        .post('/api/appointments')
        .set('Authorization', authToken)
        .send({
          date: '2023-06-15',
          startTime: '09:00',
          endTime: '10:00',
          leadId: 123
        });

      expect(response).to.have.status(409);
      expect(response.body).to.have.property('error');
    });
  });

  describe('POST /api/appointments/lesson-request', () => {
    it('should successfully book a free lesson', async () => {
      const mockResponse = {
        appointment: {
          id: 1,
          date: '2023-06-15',
          startTime: '09:00',
          endTime: '10:00',
          status: 'scheduled'
        },
        lead: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890'
        }
      };
      
      leadServiceStub.createLeadWithAppointment.resolves(mockResponse);

      const response = await chai.request(app)
        .post('/api/appointments/lesson-request')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          date: '2023-06-15',
          startTime: '09:00',
          endTime: '10:00',
          notes: 'Interested in self-defense'
        });

      expect(response).to.have.status(201);
      expect(response.body).to.have.property('appointment');
      expect(response.body).to.have.property('lead');
      expect(response.body.appointment).to.have.property('id');
      expect(response.body.lead).to.have.property('id');
    });

    it('should return 400 with missing contact information', async () => {
      const response = await chai.request(app)
        .post('/api/appointments/lesson-request')
        .send({
          // Missing name
          email: 'john@example.com',
          phone: '123-456-7890',
          date: '2023-06-15',
          startTime: '09:00'
        });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('errors');
    });
    
    it('should return 409 when time slot is already booked', async () => {
      leadServiceStub.createLeadWithAppointment.rejects(new Error('Time slot already booked'));

      const response = await chai.request(app)
        .post('/api/appointments/lesson-request')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          date: '2023-06-15',
          startTime: '09:00',
          endTime: '10:00'
        });

      expect(response).to.have.status(409);
      expect(response.body).to.have.property('error');
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should return appointment details for valid ID', async () => {
      const mockAppointment = {
        id: 1,
        date: '2023-06-15',
        startTime: '09:00',
        endTime: '10:00',
        status: 'scheduled',
        leadId: 123,
        createdAt: new Date().toISOString()
      };
      
      appointmentServiceStub.getAppointmentById.resolves(mockAppointment);

      const response = await chai.request(app)
        .get('/api/appointments/1')
        .set('Authorization', authToken);

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('id', 1);
      expect(response.body).to.have.property('date', '2023-06-15');
    });

    it('should return 404 for non-existent appointment', async () => {
      appointmentServiceStub.getAppointmentById.resolves(null);

      const response = await chai.request(app)
        .get('/api/appointments/999')
        .set('Authorization', authToken);

      expect(response).to.have.status(404);
      expect(response.body).to.have.property('error');
    });
  });
}); 