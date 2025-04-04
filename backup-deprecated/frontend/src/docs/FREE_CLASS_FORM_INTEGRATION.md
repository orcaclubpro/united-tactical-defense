# Free Class Form Integration with Go High Level

This document explains how the Free Class Form integrates directly with Go High Level for appointment scheduling.

## Overview

When a user submits the free class form, the application uses the `book-appointment.js` script to send the appointment details directly to Go High Level. This bypasses our backend API and communicates directly with the Go High Level API.

## Data Flow

```
┌───────────────┐      ┌───────────────────┐     ┌────────────────────────┐
│ Free Class    │─────▶│ book-appointment.js│────▶│ Go High Level API      │
│ Form Component│      │ (direct API call)  │     │ /appengine/appointment │
└───────────────┘      └───────────────────┘     └────────────────────────┘
```

## Implementation Details

### 1. Form Submission

When the "Schedule Now" button is clicked in the `FreeClass.tsx` component:

1. The `handleSubmit` function is called
2. The form data is validated
3. The date and time are formatted to match the Go High Level format
4. The `submitAppointmentRequest` function from `book-appointment.js` is called with the form data

### 2. Data Transformation

The following form fields are mapped directly to Go High Level parameters:

| Form Field       | Go High Level Field |
|------------------|---------------------|
| firstName        | first_name          |
| lastName         | last_name           |
| email            | email               |
| phone            | phone               |
| preferredDate + preferredTime | selected_slot (formatted as 2025-04-03T13:30:00-07:00) |

All other parameters in the Go High Level request use default values defined in `book-appointment.js`.

### 3. Request Format

The request is sent as multipart form data to the Go High Level API. The main parts of the request are:

1. `formData` - JSON object with all appointment parameters
2. `locationId` - The location ID for United Tactical Defense
3. `formId` - The form ID for the free class form
4. `captchaV3` - A placeholder for captcha validation

### 4. Response Handling

The response from Go High Level is logged and processed:

- On success: Shows a success message and closes the modal after 3 seconds
- On error: Displays the error details to the user

## Code Examples

### Free Class Form Component

```typescript
// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Format date and time to match the expected format
  const selectedDate = formData.preferredDate || new Date().toISOString().split('T')[0];
  const selectedTime = formData.preferredTime || '13:00';
  const formattedSlot = `${selectedDate}T${selectedTime}:00-07:00`;
  
  // Call the appointment booking script with form data
  const result = await submitAppointmentRequest({
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone: formData.phone,
    email: formData.email,
    selected_slot: formattedSlot,
    // Additional fields remain unchanged...
  });
  
  // Handle the response...
};
```

### Book Appointment Script

```javascript
// Submit an appointment request to Go High Level
export async function submitAppointmentRequest(customData = {}) {
  // Create multipart form data with the customer's information
  // and default values for other required fields...
  
  // Send the request to Go High Level
  const response = await fetch('https://backend.leadconnectorhq.com/appengine/appointment', options);
  
  // Process and return the response...
}
```

## Testing

To test this integration:

1. Fill out the Free Class form with valid information
2. Submit the form
3. Check the browser console for detailed request/response logs
4. Verify that an appointment is created in Go High Level

## Troubleshooting

If the form submission fails:

1. Check the browser console for detailed error messages
2. Verify that the date and time format is correct (YYYY-MM-DDThh:mm:ss-07:00)
3. Ensure that all required fields are filled out
4. Verify that Go High Level API is accessible 