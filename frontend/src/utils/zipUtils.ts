/**
 * Utility functions for ZIP code operations
 */

interface ZipLookupResponse {
  city: string;
  state: string;
  country: string;
}

// Simple cache to avoid repeat lookups for the same zip code
const zipCache: Record<string, ZipLookupResponse> = {};

/**
 * Lookup city/state information from a ZIP code
 * @param zipCode ZIP code to lookup
 * @returns Promise resolving to city, state, and country data
 */
export const lookupZipInfo = async (zipCode: string): Promise<ZipLookupResponse | null> => {
  // Return cached result if available
  if (zipCache[zipCode]) {
    return zipCache[zipCode];
  }
  
  // Validate ZIP code format
  if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
    return null;
  }
  
  try {
    // Use ZIP code API - multiple options available:
    // 1. Free option: api.zippopotam.us (chosen here, no auth required)
    // 2. Paid options with more reliable service would be better for production
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    
    if (!response.ok) {
      console.error('ZIP lookup error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // Extract city and state information
    const result: ZipLookupResponse = {
      city: data.places[0]['place name'],
      state: data.places[0]['state'],
      country: 'US'
    };
    
    // Cache the result
    zipCache[zipCode] = result;
    
    return result;
  } catch (error) {
    console.error('Error looking up ZIP code:', error);
    return null;
  }
};

/**
 * Fallback city names for common area codes we serve
 * This is used if the API lookup fails
 */
const fallbackZipMapping: Record<string, ZipLookupResponse> = {
  '92618': { city: 'Irvine', state: 'CA', country: 'US' },
  '92602': { city: 'Irvine', state: 'CA', country: 'US' },
  '92603': { city: 'Irvine', state: 'CA', country: 'US' },
  '92604': { city: 'Irvine', state: 'CA', country: 'US' },
  '92606': { city: 'Irvine', state: 'CA', country: 'US' },
  '92612': { city: 'Irvine', state: 'CA', country: 'US' },
  '92614': { city: 'Irvine', state: 'CA', country: 'US' },
  '92617': { city: 'Irvine', state: 'CA', country: 'US' },
  '92620': { city: 'Irvine', state: 'CA', country: 'US' },
  '92707': { city: 'Santa Ana', state: 'CA', country: 'US' },
  '92780': { city: 'Tustin', state: 'CA', country: 'US' },
  // Add more common ZIP codes as needed
};

/**
 * Get city information from a ZIP code with fallback support
 * This function will:
 * 1. Try to get the city from the API
 * 2. If that fails, try to get it from our fallback mapping
 * 3. If both fail, return "Unknown"
 * 
 * @param zipCode ZIP code to lookup
 * @returns Promise resolving to city name
 */
export const getCityFromZip = async (zipCode: string): Promise<string> => {
  // Try API lookup first
  const apiResult = await lookupZipInfo(zipCode);
  if (apiResult) {
    return apiResult.city;
  }
  
  // Try fallback mapping
  if (fallbackZipMapping[zipCode]) {
    return fallbackZipMapping[zipCode].city;
  }
  
  // Return a default if all else fails
  return "Unknown";
}; 