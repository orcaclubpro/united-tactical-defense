/**
 * Global type definitions for United Tactical Defense
 */

// Global window interface extensions
interface Window {
  // Google Analytics 4 data layer and function
  dataLayer: any[];
  gtag: (...args: any[]) => void;
  GA4_CONVERSION_ID: string;
  
  // Other global properties
  fs?: { readFile: (path: string, options?: { encoding?: string }) => Promise<any> };
}
