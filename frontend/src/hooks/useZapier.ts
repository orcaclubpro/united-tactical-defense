import { useState } from 'react';
import { getCityFromZip } from '../utils/zipUtils';
import { AppError, CommonErrors, HttpStatusCode, errorHandler } from '../utils/ErrorHandler';
import { zapierRetryHandler } from '../utils/WebhookRetryHandler';

interface ZapierStatus {
  sent: boolean;
  error: string | null;
  lastAttempt?: Date;
  attempts?: number;
}

interface ZapierHookResult {
  sendToZapier: (data: any, tag?: string) => Promise<boolean>;
  status: ZapierStatus;
}

/**
 * Hook to handle sending data to Zapier with proper CORS handling and retry logic
 * @returns Object containing sendToZapier function and status
 */
const useZapier = (): ZapierHookResult => {
  const [status, setStatus] = useState<ZapierStatus>({ sent: false, error: null });

  const sendToZapier = async (data: any, tag: string = 'default'): Promise<boolean> => {
    console.log('🔄 Sending data to Zapier webhook:', data);
    
    try {
      // Get city from ZIP code (using the synchronous utility function)
      let city = "Unknown";
      
      // Support for different field names (zipCode or zip)
      const zipCode = data.zipCode || data.zip;
      if (zipCode) {
        // The new implementation is synchronous
        city = getCityFromZip(zipCode);
      }
      
      // Create a proper payload with all the form data including appointment details
      const payload = {
        // Support various field names and formats
        firstName: data.firstName || data.first_name,
        lastName: data.lastName || data.last_name,
        zip: zipCode,
        city: city, // Add city information based on ZIP lookup
        email: data.email,
        phone: data.phone,
        experience: data.experience,
        source: data.source || 'website',
        timestamp: new Date().toISOString(),
        tag: tag, // Use the provided tag
        // New appointment-specific fields
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        selectedSlot: data.selectedSlot, // Full formatted datetime string
        timezone: data.timezone || 'America/Los_Angeles'
      };
      
      console.log('📦 Zapier payload with city:', payload);
      
      let attemptCount = 0;
      
      // Use proper CORS with retry logic - NO MORE no-cors mode!
      const response = await zapierRetryHandler.sendWithRetry(
        'https://hooks.zapier.com/hooks/catch/22610298/2xf6xd2/',
        payload,
        {}, // headers
        {
          onRetry: (attempt, error) => {
            attemptCount = attempt;
            console.log(`🔄 Zapier retry attempt ${attempt}:`, error.message);
          }
        }
      );

      // Now we can actually check the response!
      if (!response.ok) {
        throw new AppError(
          CommonErrors.WEBHOOK_FAILED,
          response.status as HttpStatusCode,
          `Zapier webhook failed: ${response.status} ${response.statusText}`,
          true,
          { 
            url: 'zapier_webhook',
            status: response.status,
            statusText: response.statusText,
            payload: JSON.stringify(payload)
          }
        );
      }

      console.log('✅ Zapier webhook actually succeeded!');
      setStatus({ 
        sent: true, 
        error: null, 
        lastAttempt: new Date(),
        attempts: attemptCount + 1
      });
      return true;

    } catch (error: unknown) {
      console.error('❌ Zapier webhook failed after all retries:', error);
      
      // Handle the error properly
      const appError = error instanceof AppError ? error : new AppError(
        CommonErrors.NETWORK_ERROR,
        HttpStatusCode.SERVICE_UNAVAILABLE,
        error instanceof Error ? error.message : 'Unknown Zapier webhook error',
        true,
        { tag, payload: JSON.stringify(data) }
      );

      await errorHandler.handleError(appError);

      setStatus({
        sent: false, 
        error: appError.message,
        lastAttempt: new Date(),
        attempts: (zapierRetryHandler.options.maxRetries ?? 2) + 1
      });
      return false;
    }
  };

  return { sendToZapier, status };
};

export default useZapier; 