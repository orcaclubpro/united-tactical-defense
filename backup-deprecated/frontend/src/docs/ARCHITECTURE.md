# United Tactical Defense Frontend Architecture

## Overview

The United Tactical Defense frontend utilizes a clean and modular architecture with separation of concerns between components, services, and adapters. This architecture enables robust form processing, appointment booking, and offline support throughout the application.

## Core Architecture Principles

1. **Separation of Concerns**
   - UI components are separated from business logic
   - Data transformation is handled by dedicated adapters
   - API communication is managed by specialized clients

2. **Progressive Enhancement**
   - Core functionality works without JavaScript
   - Enhanced features are added through progressive enhancement
   - Offline support provides resilience during connectivity issues

3. **Modular Design**
   - Functionality is broken into reusable components
   - Services are organized by domain and responsibility
   - Abstractions allow easy replacement of implementations

## Directory Structure

```
/frontend
├── src/
│   ├── components/
│   │   ├── Form/
│   │   │   ├── ModernModalUI.tsx
│   │   │   ├── BookingResponseHandler.tsx
│   │   │   ├── FreeLessonFormController.tsx
│   │   │   ├── GlobalTrigger.tsx
│   │   │   ├── AppointmentStep.tsx
│   │   │   └── ...
│   │   ├── Calendar/
│   │   │   ├── BookingCalendar.tsx
│   │   │   └── TimeSlotPicker.tsx
│   │   └── ...
│   ├── contexts/
│   │   ├── FormContext.tsx
│   │   └── NavigationContext.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── api/
│   │   │   ├── FormAPIClient.ts
│   │   │   ├── CalendarAPIClient.ts
│   │   │   ├── GoHighLevelAppointmentClient.ts
│   │   │   └── adapters/
│   │   │       └── GoHighLevelAdapter.ts
│   │   ├── analytics/
│   │   │   └── formAnalytics.ts
│   │   ├── validation/
│   │   │   └── formValidator.ts
│   │   └── userPreferences.ts
│   ├── hooks/
│   │   ├── useFormStep.ts
│   │   └── useFormValidation.ts
│   ├── config/
│   │   └── api-config.ts
│   └── utils/
│       ├── formUtils.ts
│       └── dateUtils.ts
└── docs/
    ├── APPOINTMENT_SYSTEM.md
    └── ARCHITECTURE.md
```

## Key Components

### Form Processing System

The form processing system follows a multi-layer architecture:

1. **UI Layer**: React components for form presentation
   - `ModernModalUI`: Enhanced modal with improved user engagement
   - `FormStep`: Individual form steps with validation
   - `AppointmentStep`: Specialized step for appointment booking

2. **State Management Layer**: Context providers and hooks
   - `FormContext`: Centralized form state management
   - `NavigationContext`: Form navigation and step control
   - `useFormStep`: Custom hook for step management

3. **Service Layer**: Services for business logic
   - `FormAPIClient`: Handles form submission and validation
   - `CalendarAPIClient`: Manages appointment time slots
   - `GoHighLevelAppointmentClient`: Specialized client for Go High Level integration

4. **Adapter Layer**: Transforms data between formats
   - `GoHighLevelAdapter`: Adapts internal form data to Go High Level format

5. **Configuration Layer**: Centralizes configuration
   - `api-config.ts`: Centralized configuration for API endpoints and settings

## Appointment Booking System

### Architecture Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│ AppointmentStep │────▶│ CalendarAPIClient │──┬─▶│ Internal API      │
└─────────────────┘     └──────────────────┘  │ └───────────────────┘
        │                        │            │
        │                        ▼            │
        │               ┌──────────────────┐  │
        └──────────────▶│GoHighLevelClient │──┼─▶┌───────────────────┐
                        └──────────────────┘  │ │Go High Level API   │
                                │             │ └───────────────────┘
                                ▼             │
                        ┌──────────────────┐  │
                        │GoHighLevelAdapter│──┘
                        └──────────────────┘
```

### Components

1. **AppointmentStep**: React component that provides the UI for selecting a date and time for an appointment
   - Shows a calendar and time slots
   - Handles validation of selections
   - Manages loading/error states during booking

2. **CalendarAPIClient**: Service that handles calendar and appointment operations
   - Fetches available time slots
   - Checks slot availability
   - Provides booking methods for both internal API and Go High Level

3. **GoHighLevelAppointmentClient**: Specialized client for Go High Level
   - Handles appointment submission with proper formatting
   - Manages retries and error handling
   - Provides offline queueing for submissions
   - **NEW**: Supports direct form submissions to forms/submit endpoint

4. **GoHighLevelAdapter**: Transforms data between internal and external formats
   - Adapts frontend form data to Go High Level schema
   - Creates properly formatted multipart form bodies
   - Ensures consistent formatting of date/time values

### Configuration

All appointment system configuration is centralized in `api-config.ts`:

```typescript
export const GO_HIGH_LEVEL_CONFIG = {
  APPOINTMENT_ENDPOINT: `${GO_HIGH_LEVEL_API_URL}/appengine/appointment`,
  FORM_SUBMISSION_ENDPOINT: `${GO_HIGH_LEVEL_API_URL}/forms/submit`,
  FORM_ID: 'bHbGRJjmTWG67GNRFqQY',
  LOCATION_ID: 'wCjIiRV3L99XP2J5wYdA',
  CALENDAR_ID: 'EwO4iAyVRl5dqwH9pi1O',
  DEFAULT_TIMEZONE: 'America/Los_Angeles'
};

export const STORAGE_KEYS = {
  FORM_QUEUE: 'offline_form_submission_queue',
  APPOINTMENT_QUEUE: 'offline_appointment_queue',
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences'
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  INITIAL_DELAY: 1000,
  BACKOFF_FACTOR: 1.5,
  MAX_DELAY: 60000
};
```

### Offline Support

The appointment system includes comprehensive offline support:

1. **Detection**: Monitors network status using browser events
2. **Queueing**: Stores appointment submissions in local storage when offline
3. **Synchronization**: Processes queue when connection is restored
4. **Retry Logic**: Implements exponential backoff for failed submissions
5. **User Feedback**: Provides clear status updates during the process

## Form Submission System

The form submission system provides a standardized way to submit various form types:

1. **Common Interface**: All form submissions use the same API pattern
2. **Type-based Routing**: Forms are routed to the correct endpoints based on type
3. **Retry Mechanism**: Failed submissions are retried with configurable backoff
4. **Progress Tracking**: Submissions include progress callbacks for UI feedback
5. **Offline Support**: Forms are queued when offline and submitted when online
6. **Direct API Integration**: Support for submitting directly to external APIs like Go High Level

### Usage Example

```typescript
import { submitForm } from '../services/api';

// Submit a form with progress tracking
const result = await submitForm(
  'free-class',
  formData,
  { retryCount: 3, retryDelay: 2000 },
  (progress) => updateProgressUI(progress)
);
```

## API Proxy System

The API proxy system manages communication between the frontend and various backend services:

### Architecture Overview

```
┌─────────────┐      ┌───────────────┐      ┌──────────────────┐
│ Frontend    │──────▶ setupProxy.js │──┬───▶ Backend API      │
│ React App   │      └───────────────┘  │   └──────────────────┘
└─────────────┘             │           │
                            │           │   ┌──────────────────┐
                            └───────────┼──▶│ Go High Level API│
                                        │   └──────────────────┘
                                        │
                                        │   ┌──────────────────┐
                                        └──▶│ Other External   │
                                            │ APIs             │
                                            └──────────────────┘
```

### Key Components

1. **setupProxy.js**: Development proxy that routes API requests to appropriate destinations
   - Handles path rewriting to strip `/api` prefix for backend requests
   - Routes specific endpoints to external APIs like Go High Level
   - Provides logging and debugging information for API requests

2. **Axios Clients**: Configured to work seamlessly with the proxy system
   - Use request interceptors to add `/api` prefix to internal paths
   - Avoid double-prefixing by checking if path already includes `/api`
   - Provide consistent error handling and logging

3. **Path Resolution Strategy**:
   - Frontend API calls use `/api/...` paths
   - Proxy identifies external API paths and routes accordingly
   - Backend receives paths without the `/api` prefix
   - External APIs receive properly formatted paths per their requirements

### Configuration

The proxy system is configured in `setupProxy.js`:

```javascript
// Special proxy for Go High Level form submissions
const goHighLevelProxy = createProxyMiddleware({
  target: 'https://backend.leadconnectorhq.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: {
    '^/api/form/free-class': '/forms/submit'
  },
  // ... other configuration
});

// Proxy for local API endpoints
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // Remove the /api prefix when forwarding to the backend
  },
  // ... other configuration
});

// Apply proxies - order matters!
app.use('/api/form/free-class', goHighLevelProxy);
app.use('/api', apiProxy);
```

### API Client Configuration

API clients are configured to work with the proxy system:

```typescript
// Create an axios instance with default config
const api = axios.create({
  baseURL: '/',  // Don't include /api here to avoid duplicating it in requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to add /api prefix to all requests
api.interceptors.request.use(
  (config) => {
    // Only add /api prefix if the URL doesn't already have it and is not an absolute URL
    if (!config.url?.startsWith('/api') && !config.url?.startsWith('http')) {
      config.url = `/api${config.url}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Integration Testing

The frontend implements comprehensive testing at multiple levels:

1. **Unit Tests**: Test individual components and services
2. **Integration Tests**: Test interactions between multiple components
3. **E2E Tests**: Test complete user flows from start to finish

Key testing patterns:

- Tests are co-located with their implementation files
- Mock service workers simulate API responses
- Context providers are mocked for isolated testing
- Data attributes provide reliable test selectors

## Future Enhancements

1. **ABTestingDashboard**: Administrative interface for viewing test results
2. **Enhanced Offline Indicators**: Visual indicators for offline state throughout the application
3. **Offline Submission Testing**: Test framework for offline functionality validation 