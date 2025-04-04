# Mock API Implementation

This document explains the mock API implementation in the frontend. All backend API calls have been replaced with mock implementations that return realistic sample data.

## Why We're Using Mock APIs

- **Frontend-Only Development**: Allows frontend development to proceed independently without needing the backend to be running.
- **Reliable Testing**: Provides consistent data for UI testing without worrying about backend changes or failures.
- **Fast Development Cycles**: Eliminates waiting for API responses or dealing with network issues during development.

## Implementation Details

The mock API implementation can be found in `frontend/src/services/api.ts`. Key features:

1. **Preserved API Interfaces**: All function signatures and return types match the original API implementation.
2. **Static Data**: Mock data is generated on-demand rather than fetched from a server.
3. **Realistic Data Patterns**: Random data is generated within realistic ranges.

## Structure

Each API function is clearly labeled with a `// PLACEHOLDER` comment to indicate it's a mock implementation. The file is also wrapped with begin/end comments to make it clear which sections contain mock implementations.

## Dashboard Component Support

The Dashboard component has specific data structure requirements. The mock API implementations have been designed to return data in the exact format expected by the Dashboard component, including:

- Extended MetricsSnapshot fields
- Additional fields on API responses (dailyVisits, conversionData)
- Array-like interfaces with length and map properties 

## Using The Mock APIs

Your components can continue to use all API functions exactly as they did before. The difference is:

- No network requests will be made
- All responses will be mock data
- Responses will be nearly instantaneous

## Adding New Mock Implementations

When adding a new mock API function:

1. Add a `// PLACEHOLDER` comment explaining what the function does
2. Return a Promise that resolves to mock data matching the expected format
3. If the function would store data on the backend, simply return a success response
4. Keep the same function signature as the original API function

## Reintroducing Backend Integration

When you're ready to reconnect with the backend:

1. Remove the mock implementations
2. Restore the actual API calls using the axios instance
3. No component code should need to change if interfaces have been properly maintained

## Example

```typescript
// Original API call
export const getLeads = async () => {
  return await api.get('/leads');
};

// Mock implementation
export const getLeads = async () => {
  // PLACEHOLDER: Returns mock lead data
  return Promise.resolve({ data: mockLeads });
};
``` 