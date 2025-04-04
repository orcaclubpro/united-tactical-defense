# Frontend-Backend Integration Testing Guide

This guide explains how to test the integration between the United Tactical Defense frontend and backend systems.

## Prerequisites

- Node.js (v14+)
- npm installed
- Git repository cloned

## Setup

1. Install all dependencies for both frontend and backend:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

2. Make sure environment variables are properly configured:

```bash
# Copy the environment file if not already done
cp .env.example .env

# Edit the .env file as needed with appropriate database and API configurations
```

## Running the Automated Integration Tests

We provide a script that automates the process of testing the frontend-backend integration:

```bash
# Make sure the script is executable
chmod +x test-frontend-backend-integration.js

# Run the automated tests
./test-frontend-backend-integration.js
```

This script will:
1. Start the backend server
2. Run the frontend integration tests 
3. Test API endpoints for form submission
4. Test API endpoints for appointment booking
5. Clean up all processes on completion

## Manual Testing

If you need to manually test the integration, follow these steps:

### Start the Backend

```bash
# Start the backend server
node src/server.js
```

### Start the Frontend

```bash
# In a separate terminal window
cd frontend
npm start
```

### Run the Integration Tests

In a third terminal window:

```bash
cd frontend
npm run test:integration
```

## Test Coverage

To generate test coverage reports:

```bash
# Backend tests
npm run test:coverage

# Frontend tests
cd frontend
npm run test:coverage
```

The coverage reports will be generated in the respective `coverage` directories.

## Key Integration Points

The frontend and backend integration focuses on these key areas:

1. **Form Submission**: The frontend components submit forms to backend API endpoints
2. **Appointment Booking**: Calendar functionality communicates with backend availability and booking endpoints
3. **User Authentication**: Login/registration features interact with backend auth services
4. **Offline Support**: Frontend components handle offline state by queueing submissions
5. **A/B Testing**: Frontend components adapt based on backend testing configuration

## Troubleshooting

### Common Issues

- **Port conflicts**: If you see "port already in use" errors, make sure no other services are using ports 3000 (frontend) or 5000 (backend)
- **Connection refused**: Ensure the backend is running before testing frontend integration
- **CORS errors**: Check that CORS is properly configured in the backend for localhost development

### Debugging

- Check the browser console for frontend errors
- Review the terminal output for backend errors
- Examine the network tab in browser dev tools to see API requests/responses

## Contact

If you encounter persistent issues, please open an issue in the project repository or contact the development team. 