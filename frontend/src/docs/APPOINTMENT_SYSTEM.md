# Appointment Booking System

## Overview

The Appointment Booking System connects our frontend components with the Go High Level appointment booking service. It provides a robust interface for submitting appointments, offline support, and consistent error handling.

## Architecture

### Components

- **GoHighLevelAppointmentClient**: Central client for appointment operations
  - Handles appointment submission with retry and error handling
  - Implements offline queuing for submissions during connectivity issues
  - Provides standardized response formatting
  - **NEW**: Supports direct form submissions to forms/submit endpoint

- **GoHighLevelAdapter**: Transforms internal form data to Go High Level format
  - Adapts frontend form data to the required Go High Level schema
  - Creates properly formatted multipart form bodies
  - Maintains backward compatibility with existing form components

- **CalendarAPIClient**: Manages calendar and time slot operations
  - Handles availability checking
  - Processes booking requests via the GoHighLevelAppointmentClient
  - Supports both internal and Go High Level bookings

### Flow Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│ AppointmentStep │────▶│  CalendarAPIClient │──┬─▶│  Internal API     │
└─────────────────┘     └──────────────────┘  │ └───────────────────┘
        │                        │            │
        │                        ▼            │
        │               ┌──────────────────┐  │
        └──────────────▶│GoHighLevelClient │──┼─▶┌───────────────────┐
                        └──────────────────┘  │ │Go High Level API   │
                                │             │ └───────────────────┘
                                ▼             │
                        ┌──────────────────┐  │
                        │  GoHighLevelAdapter│─┘
                        └──────────────────┘
```

## Configuration

All appointment system configuration is managed in the centralized `api-config.ts` file:

```typescript
// Base URLs
GO_HIGH_LEVEL_API_URL = 'https://backend.leadconnectorhq.com';

// Go High Level configuration
GO_HIGH_LEVEL_CONFIG = {
  APPOINTMENT_ENDPOINT: `${GO_HIGH_LEVEL_API_URL}/appengine/appointment`,
  FORM_SUBMISSION_ENDPOINT: `${GO_HIGH_LEVEL_API_URL}/forms/submit`,
  FORM_ID: 'bHbGRJjmTWG67GNRFqQY',
  LOCATION_ID: 'wCjIiRV3L99XP2J5wYdA',
  CALENDAR_ID: 'EwO4iAyVRl5dqwH9pi1O',
  DEFAULT_TIMEZONE: 'America/Los_Angeles'
};

// Storage keys for offline support
STORAGE_KEYS = {
  FORM_QUEUE: 'offline_form_submission_queue',
  APPOINTMENT_QUEUE: 'offline_appointment_queue',
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences'
};

// Retry configuration
RETRY_CONFIG = {
  MAX_RETRIES: 5,
  INITIAL_DELAY: 1000,
  BACKOFF_FACTOR: 1.5,
  MAX_DELAY: 60000
};
```

## Implementation Details

### GoHighLevelAppointmentClient

The `GoHighLevelAppointmentClient` is the primary interface for submitting appointments:

```typescript
// Submit an appointment
const result = await goHighLevelAppointmentClient.submitAppointmentRequest({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '1234567890',
  selected_slot: '2023-10-15T10:00:00-07:00'
});
```

The client automatically:
1. Adapts the form data to Go High Level format
2. Creates the proper multipart request structure
3. Handles authentication and headers
4. Processes the response

### Direct Form Submissions

The client now supports direct form submissions to the GoHighLevel forms endpoint:

```typescript
// Submit a form directly to the forms/submit endpoint
const result = await goHighLevelAppointmentClient.submitForm({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '1234567890',
  experience: 'Beginner'
});
```

When using the form submission endpoint:
1. Data is formatted using the same adapter as appointments
2. The request is sent to the /forms/submit endpoint
3. Proper headers and multipart formatting are automatically applied
4. Response handling is consistent with appointment submissions

### Offline Support

The appointment system includes built-in offline support:

```typescript
// Submit with offline support
const result = await goHighLevelAppointmentClient.submitWithOfflineSupport({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '1234567890',
  selected_slot: '2023-10-15T10:00:00-07:00'
});
```

When offline:
1. The request is queued in local storage
2. A success response with `queued: true` is returned
3. Requests are automatically processed when connectivity is restored
4. Failed submissions are retried with exponential backoff

### AppointmentStep Component

The `AppointmentStep` component integrates the system into the form flow:

```typescript
<AppointmentStep
  step={step}
  isActive={isActive}
  onComplete={handleComplete}
  programType="defense-training"
/>
```

The component:
1. Displays the calendar and time slot picker
2. Handles date and time selection
3. Formats data correctly for submission
4. Provides error handling and loading states

## Migration Guide

To migrate from the legacy appointment system to the new system:

1. Replace direct imports of `book-appointment.js` with the new client:
   ```typescript
   // Old
   import { submitAppointmentRequest } from '../../book-appointment.js';
   
   // New
   import goHighLevelAppointmentClient from './api/GoHighLevelAppointmentClient';
   ```

2. Update submission code:
   ```typescript
   // Old
   const result = await submitAppointmentRequest(formData);
   
   // New
   const result = await goHighLevelAppointmentClient.submitWithOfflineSupport(formData);
   ```

3. For direct form submissions to the forms endpoint:
   ```typescript
   // Import the submitHighLevelForm function
   import { submitHighLevelForm } from './api';
   
   // Use it in your form submission
   const response = await submitHighLevelForm(formData);
   ```

4. Use the specialized booking method from CalendarAPIClient:
   ```typescript
   const result = await calendarAPIClient.bookTacticalDefenseAppointment({
     firstName: formData.firstName,
     lastName: formData.lastName,
     email: formData.email,
     phone: formData.phone,
     date: formattedDate,
     time: formattedTime,
     programType: programType
   });
   ```

## Troubleshooting

Common issues and solutions:

1. **Appointment submissions failing**
   - Check browser console for errors
   - Verify network connectivity
   - Ensure all required fields are provided
   - Check that date/time format is correct

2. **Offline submissions not processing**
   - Verify the online event listener is working
   - Check local storage for queued submissions
   - Ensure retry logic is functioning properly

3. **Format issues**
   - Use the GoHighLevelAdapter directly to transform data
   - Log and inspect the generated request body
   - Compare with successful requests 

4. **Form submissions to forms/submit endpoint failing**
   - Verify the endpoint configuration in api-config.ts
   - Check that all required fields are included in the form data
   - Inspect the request format in the browser developer tools
   - Ensure the multipart boundary is properly formatted 