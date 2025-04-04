import { FormAnalyticsEvent } from './formAnalytics';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage for random assignment
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  isActive: boolean;
  startDate: string;
  endDate?: string; // Optional end date
}

export interface VariantAssignment {
  testId: string;
  variantId: string;
  assignedAt: string;
}

export interface VariantPerformance {
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

export interface TestPerformance {
  testId: string;
  startDate: string;
  endDate?: string;
  variants: VariantPerformance[];
}

/**
 * ABTestingService provides functionality for running A/B tests in the application
 * and tracking the performance of different variants.
 */
class ABTestingService {
  private activeTests: ABTest[] = [];
  private userAssignments: Map<string, VariantAssignment> = new Map();
  private storageKey = 'utd_ab_test_assignments';
  private analyticsEndpoint: string;
  
  constructor(analyticsEndpoint: string = '/api/analytics/ab-tests') {
    this.analyticsEndpoint = analyticsEndpoint;
    this.loadActiveTests();
    this.loadUserAssignments();
  }
  
  /**
   * Load active tests from the backend or local configuration
   */
  private async loadActiveTests(): Promise<void> {
    try {
      // This would typically fetch from an API, but we're simulating for now
      this.activeTests = [
        {
          id: 'form_layout_test',
          name: 'Form Layout Test',
          description: 'Testing different form layouts for the booking form',
          variants: [
            { id: 'control', name: 'Original Layout', weight: 50 },
            { id: 'compact', name: 'Compact Layout', weight: 50 }
          ],
          isActive: true,
          startDate: new Date().toISOString()
        },
        {
          id: 'cta_color_test',
          name: 'CTA Color Test',
          description: 'Testing different colors for the booking buttons',
          variants: [
            { id: 'blue', name: 'Blue Buttons', weight: 33 },
            { id: 'green', name: 'Green Buttons', weight: 33 },
            { id: 'orange', name: 'Orange Buttons', weight: 34 }
          ],
          isActive: true,
          startDate: new Date().toISOString()
        },
        {
          id: 'form_steps_test',
          name: 'Form Steps Test',
          description: 'Testing different form step sequences for higher completion',
          variants: [
            { id: 'standard', name: 'Standard Flow', weight: 50 },
            { id: 'simplified', name: 'Simplified Flow', weight: 50 }
          ],
          isActive: true,
          startDate: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Failed to load active A/B tests:', error);
    }
  }
  
  /**
   * Load user's variant assignments from localStorage
   */
  private loadUserAssignments(): void {
    try {
      const savedAssignments = localStorage.getItem(this.storageKey);
      if (savedAssignments) {
        const assignments = JSON.parse(savedAssignments) as VariantAssignment[];
        assignments.forEach(assignment => {
          this.userAssignments.set(assignment.testId, assignment);
        });
      }
    } catch (error) {
      console.error('Failed to load A/B test assignments:', error);
    }
  }
  
  /**
   * Save user's variant assignments to localStorage
   */
  private saveUserAssignments(): void {
    try {
      const assignments = Array.from(this.userAssignments.values());
      localStorage.setItem(this.storageKey, JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save A/B test assignments:', error);
    }
  }
  
  /**
   * Get all active A/B tests
   */
  public getActiveTests(): ABTest[] {
    return this.activeTests.filter(test => test.isActive);
  }
  
  /**
   * Get the assigned variant for a specific test
   * If the user doesn't have an assignment yet, one will be created
   */
  public getAssignedVariant(testId: string): ABTestVariant | null {
    const test = this.activeTests.find(t => t.id === testId);
    if (!test || !test.isActive) return null;
    
    // Check if user already has an assignment
    if (this.userAssignments.has(testId)) {
      const assignment = this.userAssignments.get(testId);
      const variant = test.variants.find(v => v.id === assignment?.variantId);
      return variant || null;
    }
    
    // Assign user to a variant based on weights
    const variant = this.assignUserToVariant(test);
    if (variant) {
      const assignment: VariantAssignment = {
        testId,
        variantId: variant.id,
        assignedAt: new Date().toISOString()
      };
      this.userAssignments.set(testId, assignment);
      this.saveUserAssignments();
      this.trackVariantAssignment(test, variant);
    }
    
    return variant;
  }
  
  /**
   * Assign user to a variant based on variant weights
   */
  private assignUserToVariant(test: ABTest): ABTestVariant | null {
    const { variants } = test;
    
    // Generate a random number between 0-100
    const random = Math.floor(Math.random() * 100);
    
    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant;
      }
    }
    
    // Fallback to the last variant if weights don't add up to 100
    return variants[variants.length - 1];
  }
  
  /**
   * Track when a user is assigned to a variant
   */
  private trackVariantAssignment(test: ABTest, variant: ABTestVariant): void {
    const eventData: FormAnalyticsEvent = {
      eventType: 'ab_test_assignment',
      formType: 'system',
      timestamp: new Date().toISOString(),
      metadata: {
        testId: test.id,
        testName: test.name,
        variantId: variant.id,
        variantName: variant.name
      }
    };
    
    this.trackEvent(eventData);
  }
  
  /**
   * Track an A/B test conversion event
   */
  public trackConversion(testId: string, eventType: string, metadata?: Record<string, any>): void {
    const assignment = this.userAssignments.get(testId);
    if (!assignment) return;
    
    const test = this.activeTests.find(t => t.id === testId);
    if (!test) return;
    
    const variant = test.variants.find(v => v.id === assignment.variantId);
    if (!variant) return;
    
    const eventData: FormAnalyticsEvent = {
      eventType: `ab_test_${eventType}`,
      formType: 'system',
      timestamp: new Date().toISOString(),
      metadata: {
        testId: test.id,
        testName: test.name,
        variantId: variant.id,
        variantName: variant.name,
        ...metadata
      }
    };
    
    this.trackEvent(eventData);
  }
  
  /**
   * Send event data to analytics endpoint
   */
  private trackEvent(event: FormAnalyticsEvent): void {
    // For now, just console log the event
    console.log('AB Test Event:', event);
    
    // In a production environment, this would send the data to your analytics system
    try {
      fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to track A/B test event:', error);
    }
  }
  
  /**
   * Add CSS variable classes based on variant assignments
   * for styling components differently in each variant
   */
  public applyVariantStyling(): void {
    this.userAssignments.forEach((assignment, testId) => {
      const test = this.activeTests.find(t => t.id === testId);
      if (!test || !test.isActive) return;
      
      const variant = test.variants.find(v => v.id === assignment.variantId);
      if (!variant) return;
      
      // Add class to body for CSS targeting
      document.body.classList.add(`ab-test-${testId}-${variant.id}`);
    });
  }
  
  /**
   * Track an impression for a specific test variant
   */
  public trackImpression(testId: string, metadata?: Record<string, any>): void {
    const assignment = this.userAssignments.get(testId);
    if (!assignment) return;
    
    this.trackEvent({
      eventType: 'ab_test_impression',
      formType: 'system',
      timestamp: new Date().toISOString(),
      metadata: {
        testId,
        variantId: assignment.variantId,
        ...metadata
      }
    });
  }
  
  /**
   * Track multiple conversions for a single test
   */
  public trackMultipleConversions(
    testId: string,
    eventTypes: string[],
    metadata?: Record<string, any>
  ): void {
    eventTypes.forEach(eventType => {
      this.trackConversion(testId, eventType, metadata);
    });
  }
  
  /**
   * Get performance data for a test within a date range
   */
  public async getTestPerformance(
    testId: string,
    startDate: string,
    endDate: string
  ): Promise<TestPerformance | null> {
    try {
      // In a real implementation, this would call the analytics API
      // For now, we'll just return mock data
      const test = this.activeTests.find(t => t.id === testId);
      if (!test) return null;
      
      // Generate mock performance data
      const variantPerformance: VariantPerformance[] = test.variants.map(variant => {
        const impressions = Math.floor(Math.random() * 1000) + 500;
        const conversions = Math.floor(Math.random() * impressions * 0.2);
        return {
          variantId: variant.id,
          impressions,
          conversions,
          conversionRate: (conversions / impressions) * 100
        };
      });
      
      return {
        testId,
        startDate,
        endDate,
        variants: variantPerformance
      };
    } catch (error) {
      console.error('Failed to get test performance:', error);
      return null;
    }
  }
  
  /**
   * Determine if there's a statistically significant winner in a test
   */
  public getTestWinner(performance: TestPerformance): string | null {
    if (performance.variants.length < 2) return null;
    
    // Sort variants by conversion rate
    const sortedVariants = [...performance.variants].sort(
      (a, b) => b.conversionRate - a.conversionRate
    );
    
    // Check if the best variant is significantly better (simplified)
    const bestVariant = sortedVariants[0];
    const secondBestVariant = sortedVariants[1];
    
    // Simple threshold-based significance test (not statistically rigorous)
    // In a real implementation, use proper statistical significance tests
    const significanceThreshold = 10; // 10% relative improvement
    
    if (bestVariant.conversions > 30 && // Need enough conversions
        secondBestVariant.conversions > 30 &&
        (bestVariant.conversionRate - secondBestVariant.conversionRate) / 
        secondBestVariant.conversionRate > significanceThreshold / 100) {
      return bestVariant.variantId;
    }
    
    return null; // No clear winner yet
  }
  
  /**
   * Apply the winning variant to all users
   */
  public applyWinningVariant(testId: string, variantId: string): void {
    // In a real implementation, this would update the test configuration
    console.log(`Applying winning variant '${variantId}' for test '${testId}'`);
    
    // Update the local test configuration
    const testIndex = this.activeTests.findIndex(t => t.id === testId);
    if (testIndex >= 0) {
      const updatedTest = { ...this.activeTests[testIndex] };
      
      // Set the winning variant to 100% weight and others to 0%
      updatedTest.variants = updatedTest.variants.map(v => ({
        ...v,
        weight: v.id === variantId ? 100 : 0
      }));
      
      this.activeTests[testIndex] = updatedTest;
    }
  }
}

// Create singleton instance and export
const abTestingService = new ABTestingService();
export default abTestingService; 