const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;

// Import server app
const app = require('../../src/app');

// Import services and repositories for mocking
const AuthService = require('../../src/services/auth/authService');
const UserRepository = require('../../src/data/repositories/userRepository');

chai.use(chaiHttp);

describe('Authentication API Tests', () => {
  let authServiceStub;
  let userRepositoryStub;

  beforeEach(() => {
    // Setup stubs
    authServiceStub = sinon.stub(AuthService.prototype);
    userRepositoryStub = sinon.stub(UserRepository.prototype);
  });

  afterEach(() => {
    // Restore stubs
    sinon.restore();
  });

  describe('POST /api/auth/login', () => {
    it('should return a JWT token when valid credentials are provided', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user'
      };
      
      authServiceStub.authenticateUser.resolves({
        user: mockUser,
        accessToken: 'valid-access-token',
        refreshToken: 'valid-refresh-token'
      });

      const response = await chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('accessToken');
      expect(response.body).to.have.property('refreshToken');
      expect(response.body.user).to.deep.equal(mockUser);
    });

    it('should return 401 when invalid credentials are provided', async () => {
      authServiceStub.authenticateUser.rejects(new Error('Invalid credentials'));

      const response = await chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        });

      expect(response).to.have.status(401);
      expect(response.body).to.have.property('error');
    });

    it('should return 400 when email is missing', async () => {
      const response = await chai.request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('errors');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user and return tokens', async () => {
      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        role: 'user'
      };
      
      userRepositoryStub.findByEmail.resolves(null);
      authServiceStub.registerUser.resolves({
        user: mockUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });

      const response = await chai.request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(response).to.have.status(201);
      expect(response.body).to.have.property('accessToken');
      expect(response.body).to.have.property('refreshToken');
      expect(response.body.user).to.deep.equal(mockUser);
    });

    it('should return 409 when user already exists', async () => {
      userRepositoryStub.findByEmail.resolves({ id: 1, email: 'existing@example.com' });

      const response = await chai.request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User'
        });

      expect(response).to.have.status(409);
      expect(response.body).to.have.property('error');
    });

    it('should validate input fields', async () => {
      const response = await chai.request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        });

      expect(response).to.have.status(400);
      expect(response.body).to.have.property('errors');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should issue a new access token with valid refresh token', async () => {
      authServiceStub.refreshToken.resolves({
        accessToken: 'new-access-token'
      });

      const response = await chai.request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'valid-refresh-token'
        });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property('accessToken', 'new-access-token');
    });

    it('should return 401 with invalid refresh token', async () => {
      authServiceStub.refreshToken.rejects(new Error('Invalid refresh token'));

      const response = await chai.request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        });

      expect(response).to.have.status(401);
      expect(response.body).to.have.property('error');
    });
  });
}); 