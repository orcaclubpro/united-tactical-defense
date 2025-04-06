# United Tactical Defense - Appointment System

This repository contains the implementation for the United Tactical Defense appointment system. The system allows users to book free tactical defense training sessions through a frontend form that submits data to an external API.

## System Architecture

### Frontend
- React-based form component (`FreeLessonFormController.tsx`)
- API service for data submission (`api.ts`)
- Form validation and data formatting logic

### Backend
- Express server handling form submissions
- Middleware for data validation and transformation
- External API integration with leadconnectorhq.com

## Installation and Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on http://localhost:3001 by default.

### Frontend Setup

The frontend is already integrated with the backend. Make sure your frontend development server is configured to proxy API requests to the backend server.

## Form Submission Flow

1. User fills out personal information (First name, Last name, Email, Phone)
2. User selects appointment date and time
3. User reviews and confirms appointment details
4. Form data is submitted to the backend at `/submit-appointment`
5. Backend formats data and forwards to external API
6. User receives confirmation of successful booking

## Testing

Run the test script to verify the form submission process:

```bash
cd backend
npm test
```

This will execute the test-form-submission.js script that simulates a form submission.

## Implementation Details

### Data Format

The external API expects the following data structure:

```javascript
{
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "5551234567",
  sel_time: "2023-06-15T14:30:00-07:00",
  duration: 90
}
```

### Error Handling

The system implements:
- Client-side form validation
- Data persistence with localStorage to prevent data loss
- Retry logic for API submissions
- Detailed error messages for users

### Security Considerations

- Phone numbers are validated and formatted consistently
- Email format validation
- Date and time validation to prevent past bookings

## Maintenance

To update the external API integration:
1. Modify the `submit-appointment.js` file in the backend/routes directory
2. Update the request format in the submitFreeClassForm function in api.ts if needed

## Troubleshooting

If you encounter issues with form submission:
1. Check browser console for frontend errors
2. Verify backend server is running
3. Check network requests in browser dev tools
4. Verify the external API endpoint is correct and accessible

## Quick Deployment with Docker

We've added Docker support for easy deployment of the United Tactical Defense application. Just follow these simple steps:

### Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

### Running the Application

1. Clone the repository
2. Navigate to the project root directory
3. Run the following command:

```bash
docker-compose up
```

This will build and start both the frontend and backend services.

- Frontend will be available at: http://localhost:3000
- Backend API will be available at: http://localhost:5000

### Stopping the Application

To stop the application, press `Ctrl+C` in the terminal, or run:

```bash
docker-compose down
```
