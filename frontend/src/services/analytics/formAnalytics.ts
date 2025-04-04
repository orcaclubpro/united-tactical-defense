import { FormData } from '../../contexts/FormContext';

export interface FormAnalyticsEvent {
  eventType: string;
  formType: string;
  step?: string | number;
  fieldName?: string;
  formData?: Partial<FormData>;
  timestamp: string;
  sessionId?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface StepCompletionData {
  stepId: string;
  timeSpent: number; // milliseconds
  isValid: boolean;
  completedFields: string[];
}

export interface FormCompletionData {
  formId: string;
  formType: string;
  totalTimeSpent: number; // milliseconds
  stepData: StepCompletionData[];
  completionStatus: 'completed' | 'abandoned' | 'error';
  errorDetails?: string;
  metadata?: Record<string, any>;
}

/**
 * FormAnalyticsService provides tracking capabilities for form interactions and completions.
 * This service can be extended to integrate with any analytics platform.
 */
class FormAnalyticsService {
  private sessionId: string;
  private stepTimers: Map<string, number> = new Map();
  private formStartTime: number | null = null;
  private currentFormType: string | null = null;
  private stepHistory: StepCompletionData[] = [];
  private analyticsEndpoint: string;
  
  constructor(analyticsEndpoint: string = '/api/analytics/events') {
    this.sessionId = this.generateSessionId();
    this.analyticsEndpoint = analyticsEndpoint;
  }
  
  /**
   * Generate a unique session ID for tracking
   */
  private generateSessionId(): string {
    return 'form_' + Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15) + 
      '_' + Date.now();
  }
  
  /**
   * Track when a form is opened
   */
  public trackFormOpen(formType: string, initialData?: Partial<FormData>): void {
    this.currentFormType = formType;
    this.formStartTime = Date.now();
    this.stepHistory = [];
    
    this.trackEvent({
      eventType: 'form_open',
      formType,
      formData: initialData,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      referrer: document.referrer,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });
  }
  
  /**
   * Track when a form step is started
   */
  public trackStepStart(stepId: string): void {
    this.stepTimers.set(stepId, Date.now());
    
    this.trackEvent({
      eventType: 'step_start',
      formType: this.currentFormType || 'unknown',
      step: stepId,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    });
  }
  
  /**
   * Track when a form step is completed
   */
  public trackStepComplete(
    stepId: string, 
    isValid: boolean, 
    completedFields: string[]
  ): void {
    const startTime = this.stepTimers.get(stepId);
    let timeSpent = 0;
    
    if (startTime) {
      timeSpent = Date.now() - startTime;
      this.stepTimers.delete(stepId);
    }
    
    const stepData: StepCompletionData = {
      stepId,
      timeSpent,
      isValid,
      completedFields
    };
    
    this.stepHistory.push(stepData);
    
    this.trackEvent({
      eventType: 'step_complete',
      formType: this.currentFormType || 'unknown',
      step: stepId,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata: {
        timeSpent,
        isValid,
        completedFields
      }
    });
  }
  
  /**
   * Track when a field is changed
   */
  public trackFieldChange(
    fieldName: string, 
    value: any, 
    stepId?: string
  ): void {
    this.trackEvent({
      eventType: 'field_change',
      formType: this.currentFormType || 'unknown',
      step: stepId,
      fieldName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata: {
        hasValue: value !== null && value !== undefined && value !== ''
      }
    });
  }
  
  /**
   * Track form submission attempt
   */
  public trackSubmissionAttempt(formData: FormData): void {
    this.trackEvent({
      eventType: 'form_submit_attempt',
      formType: this.currentFormType || 'unknown',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata: {
        hasRequiredFields: this.checkRequiredFields(formData)
      }
    });
  }
  
  /**
   * Track form submission success
   */
  public trackSubmissionSuccess(formData: FormData): void {
    const totalTimeSpent = this.formStartTime ? Date.now() - this.formStartTime : 0;
    
    const completionData: FormCompletionData = {
      formId: this.sessionId,
      formType: this.currentFormType || 'unknown',
      totalTimeSpent,
      stepData: this.stepHistory,
      completionStatus: 'completed'
    };
    
    this.trackFormCompletion(completionData);
    
    this.trackEvent({
      eventType: 'form_submit_success',
      formType: this.currentFormType || 'unknown',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata: {
        totalTimeSpent,
        numSteps: this.stepHistory.length
      }
    });
    
    // Reset tracking state
    this.resetState();
  }
  
  /**
   * Track form submission error
   */
  public trackSubmissionError(error: string): void {
    this.trackEvent({
      eventType: 'form_submit_error',
      formType: this.currentFormType || 'unknown',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata: {
        error
      }
    });
  }
  
  /**
   * Track form abandonment
   */
  public trackFormAbandon(reason?: string): void {
    const totalTimeSpent = this.formStartTime ? Date.now() - this.formStartTime : 0;
    
    const completionData: FormCompletionData = {
      formId: this.sessionId,
      formType: this.currentFormType || 'unknown',
      totalTimeSpent,
      stepData: this.stepHistory,
      completionStatus: 'abandoned',
      metadata: { reason }
    };
    
    this.trackFormCompletion(completionData);
    
    this.trackEvent({
      eventType: 'form_abandon',
      formType: this.currentFormType || 'unknown',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata: {
        totalTimeSpent,
        lastStep: this.stepHistory.length > 0 
          ? this.stepHistory[this.stepHistory.length - 1].stepId 
          : null,
        reason
      }
    });
    
    // Reset tracking state
    this.resetState();
  }
  
  /**
   * Send form completion data to analytics backend
   */
  private trackFormCompletion(data: FormCompletionData): void {
    fetch(`${this.analyticsEndpoint}/form-completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.error('Error sending form completion data:', error);
    });
  }
  
  /**
   * Track a generic analytics event
   */
  private trackEvent(event: FormAnalyticsEvent): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Form Analytics Event:', event);
    }
    
    // Send to backend
    fetch(this.analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }).catch(error => {
      console.error('Error sending analytics event:', error);
    });
  }
  
  /**
   * Basic check for required fields in form data
   */
  private checkRequiredFields(formData: FormData): boolean {
    // This is a basic implementation - expand based on your form requirements
    const requiredFields = ['firstName', 'lastName', 'email'];
    return requiredFields.every(field => 
      formData[field] !== undefined && 
      formData[field] !== null && 
      formData[field] !== ''
    );
  }
  
  /**
   * Reset tracking state
   */
  private resetState(): void {
    this.formStartTime = null;
    this.currentFormType = null;
    this.stepHistory = [];
    this.stepTimers.clear();
  }
}

// Export singleton instance
export const formAnalytics = new FormAnalyticsService();

export default formAnalytics; 