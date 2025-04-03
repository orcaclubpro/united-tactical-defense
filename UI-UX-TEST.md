# UI/UX Testing Guide for United Tactical Defense

This document provides comprehensive guidance for testing the user interface and user experience of the United Tactical Defense application.

## System Configuration

- Backend Server: Running on port 3004
- Frontend Development Server: Running on port 3000
- API Endpoint: Proxied through `/api` path

## Prerequisites

1. Ensure the backend server is running: `npm start` (from project root)
2. Ensure the frontend server is running: `npm run client` (from project root)
3. Alternatively, run both simultaneously: `npm run dev` (from project root)

## Automated Testing (Basic)

Run the integration test to verify that the basic system components are working:

```bash
node test-integration.js
```

## Manual UI/UX Testing Checklist

### 1. Cross-Browser Testing

Test the application in the following browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge (if available)

### 2. Responsive Design Testing

Test the application on the following viewport sizes:
- [ ] Mobile (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] Large Desktop (1440px+)

### 3. Navigation Testing

- [ ] Verify all navigation links work correctly
- [ ] Ensure active navigation state is properly highlighted
- [ ] Check that back/forward browser navigation works as expected
- [ ] Verify that the logo links back to the homepage

### 4. Form Testing

For each form in the application:
- [ ] Test form validation (required fields, format validation)
- [ ] Test form submission with valid data
- [ ] Test form submission with invalid data
- [ ] Verify form error messages are clear and helpful
- [ ] Check that success confirmation is shown after submission

### 5. API Integration Testing

- [ ] Verify that data is loaded correctly from the API
- [ ] Check loading states are displayed appropriately
- [ ] Verify error handling for API requests
- [ ] Test refreshing data functionality

### 6. Accessibility Testing

- [ ] Ensure proper heading hierarchy (h1, h2, h3, etc.)
- [ ] Verify all images have alt text
- [ ] Check keyboard navigation works properly
- [ ] Test with screen reader if possible
- [ ] Verify sufficient color contrast for text
- [ ] Check for proper focus states on interactive elements

### 7. Performance Testing

- [ ] Check initial load time
- [ ] Verify smooth interactions (no lag when clicking buttons, etc.)
- [ ] Test performance with large data sets if applicable

### 8. Specific Features Testing

#### Lead Management
- [ ] Add a new lead
- [ ] Edit an existing lead
- [ ] Delete a lead
- [ ] Filter and search leads

#### Appointment Management
- [ ] Create a new appointment
- [ ] Reschedule an appointment
- [ ] Cancel an appointment
- [ ] View appointment details

#### Analytics Dashboard
- [ ] Verify charts and graphs render correctly
- [ ] Check filtering of analytics data
- [ ] Test date range selection
- [ ] Verify data accuracy in reports

#### Forms
- [ ] Submit a contact form
- [ ] Request a free class
- [ ] Complete an assessment form

## Bug Reporting

For any issues found during testing, please document the following:
1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Browser/device information

## Sign-off Checklist

Before considering the UI/UX testing complete, ensure:
- [ ] All critical user flows have been tested
- [ ] All major browsers are supported
- [ ] Mobile responsiveness is verified
- [ ] Accessibility requirements are met
- [ ] Performance is acceptable
- [ ] All bugs have been documented or fixed 