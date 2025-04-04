# Admin Dashboard

This directory contains components for the admin dashboard of the United Tactical Defense application.

## A/B Testing Dashboard

The A/B Testing Dashboard provides an interface for monitoring and managing A/B test performance.

### Features

- View active A/B tests and their variants
- Analyze test performance metrics including impressions, conversions, and conversion rates
- Filter results by date range
- Automatic detection of winning variants based on statistical significance
- Apply winning variants to all users

### Implementation

The A/B Testing Dashboard consists of:

1. **Dashboard UI** (`ABTestingDashboard.tsx`):
   - Test selection dropdown
   - Date range filtering
   - Tabular display of test results
   - Visual chart representation of conversion rates
   - Winning variant indicators and application

2. **ABTestingService** (`../../services/analytics/abTesting.ts`):
   - Variant assignment for users
   - Event tracking for impressions and conversions
   - Performance data retrieval
   - Statistical analysis for winner detection
   - Variant application functionality

### Usage

Access the A/B Testing Dashboard at `/admin/ab-testing`.

To create new A/B tests, update the `loadActiveTests` method in the `ABTestingService` class:

```typescript
private async loadActiveTests(): Promise<void> {
  try {
    // In production, this would fetch from an API
    this.activeTests = [
      {
        id: 'my_new_test',
        name: 'My New Test',
        description: 'Testing a new feature',
        variants: [
          { id: 'control', name: 'Control', weight: 50 },
          { id: 'variant_a', name: 'Variant A', weight: 50 }
        ],
        isActive: true,
        startDate: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Failed to load active A/B tests:', error);
  }
}
```

To use variants in components, use the `ABTestingVariant` component:

```tsx
<ABTestingVariant
  testId="my_new_test"
  variants={{
    control: <OriginalComponent />,
    variant_a: <NewComponent />
  }}
  fallback={<OriginalComponent />}
/>
```

### Future Improvements

1. Backend integration for test management (create, update, delete tests)
2. Enhanced statistical analysis with confidence intervals
3. Integration with third-party analytics services
4. Automated optimization based on performance metrics
5. Export functionality for test results 