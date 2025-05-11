import { useState } from 'react';
import { getCityFromZip } from '../utils/zipUtils';

interface ZapierStatus {
  sent: boolean;
  error: string | null;
}

interface ZapierHookResult {
  sendToZapier: (data: any, tag?: string) => Promise<boolean>;
  status: ZapierStatus;
}

/**
 * Hook to handle sending data to Zapier with city lookup
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
      
      // Create a proper payload with all the form data
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
        tag: tag // Use the provided tag
      };
      
      console.log('📦 Zapier payload with city:', payload);
      
      // Use a more CORS-friendly approach
      await fetch('https://hooks.zapier.com/hooks/catch/22610298/2xf6xd2/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // This is key for CORS issues with webhooks
        body: JSON.stringify(payload)
      });

      // With no-cors mode, we can't access the response directly
      // But we can assume success if no error was thrown
      console.log('✅ Successfully sent data to Zapier (no-cors mode)');
      setStatus({ sent: true, error: null });
      return true;
    } catch (error: unknown) {
      console.error('❌ Error sending data to Zapier:', error);
      setStatus({
        sent: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  return { sendToZapier, status };
};

export default useZapier; 