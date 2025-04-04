# United Tactical Defense Testing Suite

This directory contains comprehensive tests for the United Tactical Defense application, covering both frontend and backend components.

## Testing Strategy

Our testing approach follows a multi-layered strategy:

1. **Unit Tests**: Test individual components, functions, and methods in isolation
2. **Integration Tests**: Test interactions between multiple components
3. **API Tests**: Verify API endpoints function correctly
4. **End-to-End Tests**: Test complete user flows from frontend to backend
5. **Performance Tests**: Assess application performance under load

## Directory Structure

```
tests/
├── api/                  # API endpoint tests
│   ├── auth.test.js
│   └── appointment.test.js
├── services/             # Service layer tests
│   └── formService.test.js
├── core/                 # Core business logic tests
├── integration/          # Integration tests
│   └── booking-flow.test.js
├── performance/          # Load and performance tests
│   └── api-load-test.js
├── e2e/                  # End-to-end tests
└── data/                 # Test data and fixtures
```

## Frontend Tests

Frontend components are tested using React Testing Library, with tests located in `frontend/src` alongside the components:

```
frontend/src/
├── components/
│   └── Form/
│       ├── FreeLessonFormController.tsx
│       └── FreeLessonFormController.test.tsx
├── services/
│   ├── userPreferences.ts
│   └── userPreferences.test.ts
└── mocks/                # Mock API service for testing
    ├── handlers.ts
    └── server.ts
```

## Running Tests

### Backend Tests

```bash
# Run all backend tests
npm test

# Run API tests only
npm run test:api

# Run service tests only
npm run test:services 

# Run integration tests only
npm run test:integration

# Generate test coverage
npm run test:coverage

# Run performance tests
npm run test:performance
```

### Frontend Tests

```bash
# Run all frontend tests
cd frontend && npm test

# Run with coverage
cd frontend && npm run test:coverage

# Run specific test categories
cd frontend && npm run test:components
cd frontend && npm run test:services
```

### Combined Tests

```bash
# Run all tests (backend and frontend)
npm run test:all
```

## Test Coverage Requirements

- **Backend**: Minimum 80% code coverage required
- **Frontend**: Minimum 70% code coverage required for components and services

## Mock Framework

- **Backend**: Uses Sinon for mocking dependencies
- **Frontend**: Uses Mock Service Worker (MSW) for API mocking

## Continuous Integration

Tests are automatically run on each pull request and must pass before code can be merged into the main branch.

## Test Data

Test data and fixtures are stored in the `tests/data` directory and include:
- Mock user data
- Sample form submissions
- API response templates

## Performance Testing

Performance tests use Autocannon to simulate load on API endpoints and measure:
- Request throughput
- Average latency
- Error rates

Results are stored in `tests/data/performance` for trend analysis.

## End-to-End Testing

E2E tests use Selenium WebDriver to automate browser testing and verify complete user flows through the application. 