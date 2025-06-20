/**
 * Distance calculation utilities for validating user proximity to Anaheim Hills location
 */
const zipcodes = require('zipcodes');

// Anaheim Hills location coordinates
export const ANAHEIM_HILLS_LOCATION = {
  address: '160 S. Old Springs Rd, Suite 155, Anaheim Hills, CA 92808',
  lat: 33.823385,
  lng: -117.797964
};

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distance: number; // in miles
  isWithinRange: boolean;
  requiresWarning: boolean; // 10-15 miles
  isBlocked: boolean; // >15 miles
  userZip: string;
  userCity?: string;
  businessAddress: string;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param coord1 First coordinate point
 * @param coord2 Second coordinate point
 * @returns Distance in miles
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 3959; // Earth's radius in miles
  
  const lat1Rad = coord1.lat * Math.PI / 180;
  const lat2Rad = coord2.lat * Math.PI / 180;
  const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const deltaLng = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in miles
};

/**
 * Get coordinates from a ZIP code using the zipcodes package
 * @param zipCode ZIP code to lookup
 * @returns Coordinates object or null if not found
 */
export const getCoordinatesFromZip = (zipCode: string): Coordinates | null => {
  if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
    return null;
  }

  try {
    const result = zipcodes.lookup(zipCode.substring(0, 5));
    
    if (result && result.latitude && result.longitude) {
      return {
        lat: parseFloat(result.latitude),
        lng: parseFloat(result.longitude)
      };
    }
  } catch (error) {
    console.error('Error looking up ZIP code coordinates:', error);
  }
  
  return null;
};

/**
 * Get city name from ZIP code using zipcodes package
 * @param zipCode ZIP code to lookup
 * @returns City name or null if not found
 */
export const getCityFromZipCode = (zipCode: string): string | null => {
  if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
    return null;
  }

  try {
    const result = zipcodes.lookup(zipCode.substring(0, 5));
    return result ? result.city : null;
  } catch (error) {
    console.error('Error looking up ZIP code city:', error);
    return null;
  }
};

/**
 * Check if a ZIP code is within acceptable distance range of Anaheim Hills location
 * @param zipCode ZIP code to check
 * @returns DistanceResult object with validation details
 */
export const validateZipCodeDistance = (zipCode: string): DistanceResult | null => {
  if (!zipCode) {
    return null;
  }

  const userCoords = getCoordinatesFromZip(zipCode);
  if (!userCoords) {
    return null;
  }

  const distance = calculateDistance(userCoords, ANAHEIM_HILLS_LOCATION);
  const userCity = getCityFromZipCode(zipCode);

  return {
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
    isWithinRange: distance <= 15,
    requiresWarning: distance > 15, // Show confirmation for >15 miles
    isBlocked: false, // Allow all distances to book
    userZip: zipCode,
    userCity: userCity || undefined,
    businessAddress: ANAHEIM_HILLS_LOCATION.address
  };
};

/**
 * Get a user-friendly distance message based on the validation result
 * @param result DistanceResult from validateZipCodeDistance
 * @returns Object with title and message for UI display
 */
export const getDistanceMessage = (result: DistanceResult) => {
  if (result.requiresWarning) {
    return {
      title: 'Distance Confirmation',
      message: `You are approximately ${result.distance} miles from our Anaheim Hills location. Are you comfortable making this trip for your training session?`,
      type: 'warning' as const
    };
  }
  
  return {
    title: 'Location Confirmed',
    message: `You are approximately ${result.distance} miles from our location. Perfect for in-person training!`,
    type: 'success' as const
  };
};

/**
 * Format distance for display
 * @param distance Distance in miles
 * @returns Formatted string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 10) / 10} mile`;
  }
  return `${Math.round(distance * 10) / 10} miles`;
};