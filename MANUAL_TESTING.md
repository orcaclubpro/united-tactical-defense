# Manual Testing Guide for Frontend/Backend Integration

This guide provides step-by-step instructions for manually testing the integration between the United Tactical Defense frontend and backend components.

## Setup

1. Start the backend server:
   ```bash
   cd src && node server.js
   ```
   The backend should start on port 5050. Verify by checking the console output for "Server listening on port 5050".

2. Start the frontend development server:
   ```bash
   cd frontend && npm start
   ```
   The frontend should start on port 3000. Your browser should automatically open to http://localhost:3000.

## Test 1: Form Submission Flow

### Test Steps
1. On the landing page, click the "Book Your Free Class" button.
2. The modal form should open with the first step (contact information).
3. Fill in the required fields:
   - Name: Test User
   - Email: test@example.com
   - Phone: 555-123-4567
4. Click "Next".
5. The second step (appointment selection) should appear.
6. Select a date and time slot.
7. Click "Next".
8. The summary page should show your selected information.
9. Click "Confirm Booking".
10. You should see a success message.

### Expected Results
- The form should progress smoothly through all steps
- Validation should prevent empty fields or invalid inputs
- The backend should receive the form submission (check console logs)
- A success message should be displayed after submission

## Test 2: Offline Functionality

### Test Steps
1. Disable your internet connection (turn off Wi-Fi or use browser dev tools to simulate offline mode).
2. Repeat the form submission process as described in Test 1.
3. When you submit the form, you should see an indication that the form was saved for later submission.
4. Re-enable your internet connection.
5. You should see an indication that the queued form was submitted.

### Expected Results
- Form should be stored locally when offline
- A visual indicator should show offline status
- Form should be submitted automatically when back online
- Success notification should appear after reconnection

## Test 3: Error Handling

### Test Steps
1. Stop the backend server (Ctrl+C in the terminal where it's running).
2. With the frontend still running, try to submit a form.
3. You should see an error message.
4. Restart the backend server.
5. Try to submit the form again.

### Expected Results
- User-friendly error message should be displayed
- The form should maintain the entered data
- After server restart, submission should succeed

## Test 4: A/B Testing Variants

### Test Steps
1. Open the browser in incognito/private mode to start with a fresh session.
2. Navigate to http://localhost:3000.
3. Note the appearance of the booking form.
4. Close the browser and reopen in incognito/private mode.
5. Navigate again to http://localhost:3000.
6. Note if there are any variations in the form presentation.

### Expected Results
- Different users might see different form variants
- All variants should function correctly
- Data should be properly tracked for each variant

## Reporting Issues

If you encounter any issues during manual testing, please document them with the following information:
- Test case that failed
- Steps to reproduce
- Expected behavior
- Actual behavior
- Any error messages shown
- Browser and OS information

Submit the issues on our project tracker or contact the development team. 