/**
 * Webhook Retry Handler
 * Implements retry logic with exponential backoff for webhook reliability
 */

import { AppError, CommonErrors, HttpStatusCode, errorHandler } from './ErrorHandler';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  retryStatusCodes: number[];
  useFormData?: boolean; // Use FormData instead of JSON
  onRetry?: (attempt: number, error: Error) => void;
}

export interface WebhookPayload {
  [key: string]: any;
}

export class WebhookRetryHandler {
  private defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    retryStatusCodes: [408, 429, 500, 502, 503, 504], // Retryable HTTP status codes
  };

  constructor(public options: Partial<RetryOptions> = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Send webhook with retry logic
   */
  public async sendWithRetry(
    url: string, 
    payload: WebhookPayload,
    headers: Record<string, string> = {},
    customOptions?: Partial<RetryOptions>
  ): Promise<Response> {
    const finalOptions = { ...this.options, ...customOptions };
    let lastError: Error = new Error('Unknown webhook error');

    for (let attempt = 0; attempt <= (finalOptions.maxRetries ?? this.defaultOptions.maxRetries); attempt++) {
      try {
        console.log(`🔄 Webhook attempt ${attempt + 1}/${(finalOptions.maxRetries ?? this.defaultOptions.maxRetries) + 1} to ${url}`);

        // Determine if we should use FormData or JSON
        const useFormData = finalOptions.useFormData ?? this.options.useFormData ?? false;
        
        let requestBody: string | FormData;
        let requestHeaders: Record<string, string> = { ...headers };
        
        if (useFormData) {
          // Use FormData for webhooks that expect form submission (like Zapier)
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            formData.append(key, value != null ? String(value) : '');
          });
          requestBody = formData;
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        } else {
          // Use JSON for standard API calls
          requestHeaders['Content-Type'] = 'application/json';
          requestBody = JSON.stringify(payload);
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: requestHeaders,
          body: requestBody,
        });

        // Check if response is successful
        if (response.ok) {
          console.log(`✅ Webhook succeeded on attempt ${attempt + 1}`);
          return response;
        }

        // Check if this status code should trigger a retry
        const retryStatusCodes = finalOptions.retryStatusCodes ?? this.defaultOptions.retryStatusCodes;
        if (!retryStatusCodes.includes(response.status)) {
          throw new AppError(
            CommonErrors.WEBHOOK_FAILED,
            response.status as HttpStatusCode,
            `Webhook failed with non-retryable status: ${response.status} ${response.statusText}`,
            true,
            { 
              url, 
              status: response.status, 
              statusText: response.statusText,
              attempt: attempt + 1,
              payload: JSON.stringify(payload)
            }
          );
        }

        // Create error for retry
        lastError = new AppError(
          CommonErrors.WEBHOOK_FAILED,
          response.status as HttpStatusCode,
          `Webhook failed with retryable status: ${response.status} ${response.statusText}`,
          true,
          { 
            url, 
            status: response.status, 
            statusText: response.statusText,
            attempt: attempt + 1 
          }
        );

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // For network errors, create an AppError
        if (!(error instanceof AppError)) {
          lastError = new AppError(
            CommonErrors.NETWORK_ERROR,
            HttpStatusCode.SERVICE_UNAVAILABLE,
            `Network error during webhook call: ${lastError.message}`,
            true,
            { url, attempt: attempt + 1, originalError: lastError.message }
          );
        }
      }

      // If this was the last attempt, don't wait
      if (attempt === (finalOptions.maxRetries ?? this.defaultOptions.maxRetries)) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = this.calculateDelay(attempt, finalOptions);
      console.log(`⏳ Retrying webhook in ${delay}ms...`);

      // Call retry callback if provided
      if (finalOptions.onRetry) {
        finalOptions.onRetry(attempt + 1, lastError);
      }

      // Wait before retry
      await this.sleep(delay);
    }

    // All retries failed, log and throw the last error
    await errorHandler.handleError(lastError);
    throw lastError;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, options: Partial<RetryOptions>): number {
    // Exponential backoff: baseDelay * 2^attempt
    const baseDelay = options.baseDelay ?? this.defaultOptions.baseDelay;
    const maxDelay = options.maxDelay ?? this.defaultOptions.maxDelay;
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    
    // Add jitter (random factor to avoid thundering herd)
    const jitter = Math.random() * 0.1 * exponentialDelay;
    
    // Apply maximum delay limit
    const delay = Math.min(exponentialDelay + jitter, maxDelay);
    
    return Math.floor(delay);
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    if (error instanceof AppError) {
      return this.options.retryStatusCodes?.includes(error.httpCode) || false;
    }

    // Network errors are generally retryable
    return error.name === 'TypeError' || error.message.includes('fetch');
  }
}

// Default webhook retry handler instance
export const webhookRetryHandler = new WebhookRetryHandler();

// Specialized handlers for different webhook types
export const zapierRetryHandler = new WebhookRetryHandler({
  maxRetries: 2, // Zapier webhooks are generally reliable
  baseDelay: 500,
  maxDelay: 5000,
  useFormData: true, // Zapier expects FormData, not JSON
});

export const leadConnectorRetryHandler = new WebhookRetryHandler({
  maxRetries: 3, // More retries for external service
  baseDelay: 1000,
  maxDelay: 15000,
});