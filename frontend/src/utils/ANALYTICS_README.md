# Google Analytics 4 (GA4) Implementation Guide

## Overview

This document outlines the Google Analytics 4 (GA4) implementation for United Tactical Defense dashboard. The implementation focuses on:

1. Tracking conversions (successful form submissions)
2. Tracking traffic sources (where users come from)

## Setup Requirements

Before deploying to production, ensure the following environment variables are set in your `.env` file:

```
REACT_APP_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_GA4_CONVERSION_ID=AW-XXXXXXXXX/XXXXXXXXXXX
```

Where:
- `G-K2K75C681D` is your GA4 property Measurement ID (currently in use)
- `AW-XXXXXXXXX/XXXXXXXXXXX` is your Google Ads conversion ID (if applicable)

## Implementation Details

### Key Files

1. `src/utils/analytics.ts`: Core GA4 tracking functionality
2. `src/App.tsx`: GA4 initialization
3. `src/components/Form/FreeLessonFormController.tsx`: Form submission tracking
4. `src/components/dashboard/Dashboard.tsx`: Uses traffic source data from GA4

### Functionality

#### Initialization

GA4 is initialized in `App.tsx` on initial load. The initialization:
- Adds the GA4 tracking script to the page
- Sets up the data layer
- Configures default tracking parameters
- Tracks the initial traffic source

#### Page View Tracking

Page views are automatically tracked on route changes via the `RouteChangeHandler` component in `App.tsx`.

#### Form Submission Tracking (Conversions)

Form submissions are tracked in the `handleSubmit` function of `FreeLessonFormController.tsx`. When a form is successfully submitted:

1. The form submission is sent to the backend API
2. On success, the event is tracked in GA4 with:
   - Form type ('free_lesson')
   - Form ID
   - Source (where the form was filled)
   - Additional parameters like experience level and appointment details
   - Conversion value (for Google Ads)

#### Traffic Source Tracking

Traffic sources are tracked when a user first visits the site:

1. UTM parameters are checked first (utm_source, utm_medium, etc.)
2. If no UTM parameters, the referrer is analyzed to determine the source
3. The traffic source is stored in localStorage for persistence

## GA4 Events

The implementation uses the following GA4 events:

1. `page_view`: Tracked on each route change
2. `generate_lead`: Tracked when a form is successfully submitted
3. `conversion`: Also tracked for form submissions, with a conversion value for Google Ads

## Dashboard Integration

The dashboard displays traffic source data:

1. Traffic sources from GA4 are combined with backend API data
2. The real-time report includes the most recent traffic source information
3. Traffic source charts show the distribution of where visitors are coming from

## Testing

To test the implementation:

1. Add `?utm_source=test&utm_medium=email&utm_campaign=test_campaign` to any URL to simulate a campaign visit
2. Submit a form and check the browser console for the tracking event information
3. Verify in GA4 that events are being received correctly

## Troubleshooting

Common issues:

1. GA4 events not showing up: Ensure the correct Measurement ID is set in the environment variables
2. Conversions not tracking: Check that `GA4_CONVERSION_ID` is properly set
3. Traffic sources not displaying: Ensure the user has JavaScript enabled and localStorage is accessible

For further assistance, contact [your-email@example.com]
