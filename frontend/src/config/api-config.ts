/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Base API URLs
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
export const GO_HIGH_LEVEL_API_URL = 'https://backend.leadconnectorhq.com';

// Third-party API configuration
export const GO_HIGH_LEVEL_CONFIG = {
  APPOINTMENT_ENDPOINT: `${GO_HIGH_LEVEL_API_URL}/appengine/appointment`,
  FORM_SUBMISSION_ENDPOINT: `${GO_HIGH_LEVEL_API_URL}/forms/submit`,
  FORM_ID: 'bHbGRJjmTWG67GNRFqQY',
  LOCATION_ID: 'wCjIiRV3L99XP2J5wYdA',
  CALENDAR_ID: 'EwO4iAyVRl5dqwH9pi1O',
  DEFAULT_TIMEZONE: 'America/Los_Angeles'
};

// API timeouts (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 10000,
  CALENDAR: 8000,
  FORM_SUBMISSION: 15000
};

// Offline storage keys
export const STORAGE_KEYS = {
  FORM_QUEUE: 'offline_form_submission_queue',
  APPOINTMENT_QUEUE: 'offline_appointment_queue',
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences'
};

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  INITIAL_DELAY: 1000, // 1 second
  BACKOFF_FACTOR: 1.5,
  MAX_DELAY: 60000 // 1 minute
};

// Authentication configuration
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: 86400000, // 24 hours in milliseconds
  REFRESH_TOKEN_EXPIRY: 604800000 // 7 days in milliseconds
};

export default {
  API_BASE_URL,
  GO_HIGH_LEVEL_API_URL,
  GO_HIGH_LEVEL_CONFIG,
  API_TIMEOUTS,
  STORAGE_KEYS,
  RETRY_CONFIG,
  AUTH_CONFIG
}; 