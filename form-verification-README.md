# Form Submission Verification Tools

This set of tools helps you verify that your form submissions are formatted correctly and sent to the proper endpoints. The tools are designed to match the format used in `book-appointment.js`, which serves as the reference implementation.

## Available Tools

### 1. `verify-form-submission.js`

A standalone script that verifies the format of form submissions against the expected format. Now supports making actual live requests to the target endpoint.

**Features:**
- Verifies form data contains all required fields
- Validates the request format matches the reference implementation
- Checks that the correct endpoint URL is used
- Confirms that the appropriate headers are included
- Can optionally send a live request to the actual endpoint

**Usage:**
```bash
# Test mode (no actual requests sent)
node verify-form-submission.js

# Live mode (sends actual requests to the endpoint)
node verify-form-submission.js --live

# Show help
node verify-form-submission.js --help
```

**Configuration:**
You can modify the `CONFIG` object at the top of the script to adjust:
- `ENABLE_LIVE_REQUESTS`: Whether to enable live request mode
- `TARGET_ENDPOINT`: The target endpoint URL
- `REQUEST_TIMEOUT`: Timeout for live requests in milliseconds

### 2. `tests/form-submission-test.js`

A more comprehensive test suite that simulates a form submission and verifies its format.

**Features:**
- Mocks the submission process to avoid actual API calls
- Captures and analyzes the request data
- Provides detailed verification of fields and format
- Can be integrated with Jest test suites

**Usage:**
```bash
node tests/form-submission-test.js
```

### 3. `form-submission-monitor.js`

A browser-based monitoring tool that intercepts and analyzes actual form submissions in real-time. Can be configured to allow or block actual API calls.

**Features:**
- Intercepts XHR and fetch requests
- Logs and analyzes form submissions as they happen
- Checks for required fields and proper formatting
- Can be added to the page during development or testing
- Can now toggle between allowing real requests or blocking them

**Usage:**

1. Add this script to your page:
```html
<script src="form-submission-monitor.js"></script>
```

2. Or paste the contents into your browser console

3. Start monitoring (blocking actual requests by default):
```javascript
const monitor = window.monitorFormSubmission();
```

4. Start monitoring and allow real requests:
```javascript
const monitor = window.monitorFormSubmission({ ALLOW_REAL_REQUESTS: true });
```

5. Configure the monitor:
```javascript
window.configureMonitor({
  ALLOW_REAL_REQUESTS: true,  // Toggle real requests on/off
  VERBOSE_LOGGING: false,     // Reduce logging output
  TARGET_ENDPOINT: 'https://backend.leadconnectorhq.com/appengine/appointment'
});
```

6. Fill out and submit a form

7. Check the console logs for detailed analysis

8. When done, stop the monitoring:
```javascript
monitor.stop();
```

### 4. `form-monitor-loader.js`

A user-friendly UI wrapper for the form-submission-monitor that provides toggles and status indicators.

**Features:**
- Adds a floating control panel to the page
- Provides on/off toggle for monitoring
- Includes live mode toggle with visual indicators
- Shows status information and request counts
- Automatically loads the form-submission-monitor.js

**Usage:**

1. Add this script to your page:
```html
<script src="form-monitor-loader.js"></script>
```

2. The monitoring control panel will appear in the bottom-right corner of the page

3. Use the "Monitoring" toggle to start/stop the monitor

4. Use the "Live Mode" toggle to switch between test and live modes

5. The status display shows the current state and number of captured requests

## Required Form Fields

The following fields are required for proper form submission format:

- `first_name`
- `last_name`
- `phone`
- `email`
- `formId`
- `location_id`
- `calendar_id`
- `selected_slot`
- `selected_timezone`

## Expected Request Format

The form submission should be sent as a `multipart/form-data` request to `https://backend.leadconnectorhq.com/appengine/appointment` with the following parts:

1. `formData` - A JSON string containing all form fields
2. `locationId` - The location ID value
3. `formId` - The form ID value
4. `captchaV3` - A captcha token (if required)

## How to Test Live Form Submissions

1. **Using verify-form-submission.js:**
   ```bash
   # Enable live request mode
   node verify-form-submission.js --live
   ```

2. **Using form-submission-monitor.js in the browser:**
   ```javascript
   // Enable live request mode
   const monitor = window.monitorFormSubmission({ ALLOW_REAL_REQUESTS: true });
   
   // Fill out and submit the form
   // Check console for results
   
   // When done, stop the monitor
   monitor.stop();
   ```

3. **Toggle between test and live mode:**
   ```javascript
   // Start in test mode (block actual requests)
   const monitor = window.monitorFormSubmission();
   
   // Switch to live mode
   monitor.setConfig({ ALLOW_REAL_REQUESTS: true });
   
   // Switch back to test mode
   monitor.setConfig({ ALLOW_REAL_REQUESTS: false });
   ```

## How to Modify Endpoint URL

If you need to test against a different endpoint, you can change the target URL:

1. **In verify-form-submission.js:**
   - Edit the `CONFIG.TARGET_ENDPOINT` value at the top of the script

2. **In form-submission-monitor.js:**
   ```javascript
   window.configureMonitor({ 
     TARGET_ENDPOINT: 'https://your-new-endpoint.com/path' 
   });
   ```

## How to Use During Development

1. Add `form-submission-monitor.js` to your page during testing:
   ```html
   <script src="form-submission-monitor.js"></script>
   ```

2. Start monitoring (test mode):
   ```javascript
   const monitor = window.monitorFormSubmission();
   ```

3. Fill out and submit a form

4. Review the console for analysis results

5. Optionally switch to live mode for actual testing:
   ```javascript
   monitor.setConfig({ ALLOW_REAL_REQUESTS: true });
   ```

## Troubleshooting

If verification fails:

1. Check if all required fields are included in the submission
2. Verify that the form is submitted to the correct endpoint
3. Ensure that the Content-Type is set to `multipart/form-data`
4. Make sure the boundary parameter is properly set in the Content-Type header
5. If in live mode, check network issues or endpoint availability

## Security Considerations

- **CAUTION:** When using `ALLOW_REAL_REQUESTS: true` or `--live` mode, actual API calls will be made to the real endpoint
- Only use live mode with test data, never with real customer information
- Always disable live mode after testing to prevent accidental submissions
- Consider using a staging/test endpoint instead of production when possible

## Reference Implementation

The reference implementation can be found in `book-appointment.js` and serves as the baseline for all verification tests. 