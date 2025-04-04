const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const sinon = require('sinon');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Import server app for API testing
const app = require('../../src/app');

// Import services that might need mocking
const AppointmentService = require('../../src/services/appointment/appointmentService');
const LeadService = require('../../src/services/lead/leadService');

chai.use(chaiHttp);

describe('Booking Flow Integration Tests', () => {
  let apiDriver;
  let appointmentServiceStub;
  let leadServiceStub;
  
  before(() => {
    // Initialize stubs
    appointmentServiceStub = sinon.stub(AppointmentService.prototype);
    leadServiceStub = sinon.stub(LeadService.prototype);
  });
  
  after(() => {
    // Clean up stubs
    sinon.restore();
  });
  
  beforeEach(() => {
    // Set up clean state before each test
    apiDriver = chai.request(app);
  });
  
  describe('API Flow Tests', () => {
    it('should complete the full booking process via API endpoints', async () => {
      // Step 1: Check available time slots
      const mockAvailability = [
        { date: '2023-06-15', startTime: '09:00', endTime: '10:00' },
        { date: '2023-06-15', startTime: '11:00', endTime: '12:00' },
        { date: '2023-06-15', startTime: '14:00', endTime: '15:00' }
      ];
      
      appointmentServiceStub.getAvailableSlots.resolves(mockAvailability);
      
      const availabilityResponse = await apiDriver
        .get('/api/appointments/available')
        .query({ date: '2023-06-15' });
      
      expect(availabilityResponse).to.have.status(200);
      expect(availabilityResponse.body).to.be.an('array');
      expect(availabilityResponse.body).to.have.lengthOf(3);
      
      // Step 2: Submit lead information with booking
      const mockLessonResponse = {
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
      
      leadServiceStub.createLeadWithAppointment.resolves(mockLessonResponse);
      
      const bookingResponse = await apiDriver
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
      
      expect(bookingResponse).to.have.status(201);
      expect(bookingResponse.body).to.have.property('appointment');
      expect(bookingResponse.body).to.have.property('lead');
      expect(bookingResponse.body.appointment).to.have.property('id');
      expect(bookingResponse.body.lead).to.have.property('id');
      
      // Step 3: Verify booking details
      const appointmentId = bookingResponse.body.appointment.id;
      
      appointmentServiceStub.getAppointmentById.resolves(mockLessonResponse.appointment);
      
      const verificationResponse = await apiDriver
        .get(`/api/appointments/${appointmentId}`);
      
      expect(verificationResponse).to.have.status(200);
      expect(verificationResponse.body).to.have.property('id', appointmentId);
      expect(verificationResponse.body).to.have.property('date', '2023-06-15');
      expect(verificationResponse.body).to.have.property('startTime', '09:00');
    });
    
    it('should handle validation errors in the booking process', async () => {
      // Submit incomplete lead information
      const bookingResponse = await apiDriver
        .post('/api/appointments/lesson-request')
        .send({
          // Missing required fields
          email: 'john@example.com',
          date: '2023-06-15',
          startTime: '09:00'
        });
      
      expect(bookingResponse).to.have.status(400);
      expect(bookingResponse.body).to.have.property('errors');
    });
    
    it('should handle unavailable time slots', async () => {
      // Mock time slot conflict
      leadServiceStub.createLeadWithAppointment.rejects(new Error('Time slot already booked'));
      
      const bookingResponse = await apiDriver
        .post('/api/appointments/lesson-request')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          date: '2023-06-15',
          startTime: '10:00', // already booked time
          endTime: '11:00',
          notes: 'Interested in self-defense'
        });
      
      expect(bookingResponse).to.have.status(409);
      expect(bookingResponse.body).to.have.property('error');
    });
  });
  
  describe('UI Flow Tests (Selenium)', function() {
    // These tests will run a real browser and interact with the UI
    // They require the application to be running
    this.timeout(30000); // Increase timeout for Selenium tests
    
    let driver;
    
    before(async () => {
      // Set up headless Chrome
      const options = new chrome.Options();
      options.addArguments('--headless');
      options.addArguments('--disable-gpu');
      options.addArguments('--no-sandbox');
      options.addArguments('--window-size=1920,1080');
      
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    });
    
    after(async () => {
      // Cleanup
      if (driver) {
        await driver.quit();
      }
    });
    
    // This is marked as skipped by default as it requires a running application
    // Remove the 'skip' to run this test when the app is deployed
    it.skip('should complete booking flow through the UI', async () => {
      try {
        // Navigate to landing page
        await driver.get('http://localhost:3000');
        
        // Find and click the booking button
        const bookButton = await driver.findElement(By.xpath("//button[contains(text(), 'Book Your Free Class')]"));
        await bookButton.click();
        
        // Wait for modal to appear
        await driver.wait(until.elementLocated(By.css('[data-testid="modal-form"]')), 5000);
        
        // Fill out contact form
        await driver.findElement(By.name('name')).sendKeys('John Doe');
        await driver.findElement(By.name('email')).sendKeys('john@example.com');
        await driver.findElement(By.name('phone')).sendKeys('123-456-7890');
        
        // Click next button
        const nextButton = await driver.findElement(By.xpath("//button[text()='Next']"));
        await nextButton.click();
        
        // Wait for calendar to load
        await driver.wait(until.elementLocated(By.css('[data-testid="booking-calendar"]')), 5000);
        
        // Select a date from the calendar
        const availableDate = await driver.findElement(By.css('.calendar-day.available'));
        await availableDate.click();
        
        // Select a time slot
        const timeSlot = await driver.findElement(By.css('.time-slot.available'));
        await timeSlot.click();
        
        // Click next to proceed to summary
        const calendarNextButton = await driver.findElement(By.xpath("//button[text()='Next']"));
        await calendarNextButton.click();
        
        // Wait for summary page
        await driver.wait(until.elementLocated(By.css('[data-testid="booking-summary"]')), 5000);
        
        // Confirm booking
        const confirmButton = await driver.findElement(By.xpath("//button[contains(text(), 'Confirm')]"));
        await confirmButton.click();
        
        // Wait for success message
        await driver.wait(until.elementLocated(By.css('[data-testid="booking-success"]')), 5000);
        
        // Verify success message is displayed
        const successMessage = await driver.findElement(By.css('[data-testid="booking-success"]'));
        const successText = await successMessage.getText();
        
        expect(successText).to.include('successfully booked');
      } catch (error) {
        console.error('Selenium test failed:', error);
        throw error;
      }
    });
  });
}); 