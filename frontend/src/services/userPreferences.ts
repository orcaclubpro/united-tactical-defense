import { FormData } from '../contexts/FormContext';

/**
 * Interface for user preferences data
 */
export interface UserPreferences {
  formPreferences: Partial<FormData>;
  lastVisit: string;
  prefersDarkMode?: boolean;
  hasOptedInToDataStorage: boolean;
}

/**
 * User Preferences Service
 * 
 * Manages storage and retrieval of user form preferences with privacy controls.
 * Includes expiration mechanism to prevent using stale data.
 */

interface StoredPreferences {
  data: Record<string, any>;
  timestamp: string;
}

/**
 * User preferences service for storing and retrieving user data
 */
export const userPreferencesService = {
  /**
   * Save user preferences to localStorage
   * @param preferences - Object containing user preferences
   */
  savePreferences(preferences: Record<string, any>): void {
    if (!preferences) {
      return;
    }
    
    // If user has explicitly opted out, don't save
    if (preferences.savePreferences === false) {
      return;
    }
    
    try {
      const dataToStore: StoredPreferences = {
        data: preferences,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('userPreferences', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  },
  
  /**
   * Get stored user preferences from localStorage
   * @param maxAgeDays - Maximum age in days for valid preferences
   * @returns User preferences object or null if not available/expired
   */
  getPreferences(maxAgeDays: number = 30): Record<string, any> | null {
    try {
      const storedData = localStorage.getItem('userPreferences');
      
      if (!storedData) {
        return null;
      }
      
      const parsedData = JSON.parse(storedData) as StoredPreferences;
      
      // Check if data is still fresh
      if (!this.isDataFresh(parsedData, maxAgeDays)) {
        this.clearPreferences();
        return null;
      }
      
      return parsedData.data;
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return null;
    }
  },
  
  /**
   * Clear stored user preferences
   */
  clearPreferences(): void {
    localStorage.removeItem('userPreferences');
  },
  
  /**
   * Check if stored data is still fresh based on timestamp
   * @param data - Stored preferences data with timestamp
   * @param maxAgeDays - Maximum age in days
   * @returns Boolean indicating if data is still fresh
   */
  isDataFresh(data: StoredPreferences, maxAgeDays: number): boolean {
    try {
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      
      return now.getTime() - timestamp.getTime() < maxAgeMs;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Service for managing user preferences storage
 */
class UserPreferencesService {
  private storageKey = 'utd_user_preferences';
  private preferences: UserPreferences | null = null;
  
  constructor() {
    this.loadPreferences();
  }
  
  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const savedPreferences = localStorage.getItem(this.storageKey);
      if (savedPreferences) {
        this.preferences = JSON.parse(savedPreferences);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      this.preferences = null;
    }
  }
  
  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    if (!this.preferences) return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }
  
  /**
   * Check if user has opted in to data storage
   */
  public hasOptedIn(): boolean {
    return this.preferences?.hasOptedInToDataStorage === true;
  }
  
  /**
   * Set user opt-in status for data storage
   */
  public setOptIn(optIn: boolean): void {
    if (!this.preferences) {
      this.preferences = {
        formPreferences: {},
        lastVisit: new Date().toISOString(),
        hasOptedInToDataStorage: optIn
      };
    } else {
      this.preferences.hasOptedInToDataStorage = optIn;
    }
    
    this.savePreferences();
  }
  
  /**
   * Get stored form preferences if user has opted in
   */
  public getFormPreferences(): Partial<FormData> | null {
    if (!this.hasOptedIn() || !this.preferences) {
      return null;
    }
    
    return this.preferences.formPreferences;
  }
  
  /**
   * Store form preference data
   * @param data Partial form data to store
   * @param fields Optional array of field names to restrict which fields are stored
   */
  public storeFormPreferences(data: Partial<FormData>, fields?: string[]): void {
    if (!this.hasOptedIn()) return;
    
    if (!this.preferences) {
      this.preferences = {
        formPreferences: {},
        lastVisit: new Date().toISOString(),
        hasOptedInToDataStorage: true
      };
    }
    
    // Update last visit timestamp
    this.preferences.lastVisit = new Date().toISOString();
    
    // If fields are specified, only store those fields
    if (fields && fields.length > 0) {
      fields.forEach(field => {
        if (field in data) {
          this.preferences!.formPreferences[field] = data[field as keyof FormData];
        }
      });
    } else {
      // Otherwise store all data (except sensitive fields)
      this.preferences.formPreferences = {
        ...this.preferences.formPreferences,
        ...this.filterSensitiveData(data)
      };
    }
    
    this.savePreferences();
  }
  
  /**
   * Clear all stored preferences
   */
  public clearPreferences(): void {
    this.preferences = null;
    localStorage.removeItem(this.storageKey);
  }
  
  /**
   * Filter out sensitive data that shouldn't be stored
   */
  private filterSensitiveData(data: Partial<FormData>): Partial<FormData> {
    const filtered: Partial<FormData> = { ...data };
    
    // Define sensitive fields that shouldn't be stored
    const sensitiveFields = ['password', 'creditCard', 'securityCode', 'ssn'];
    
    // Remove sensitive fields
    sensitiveFields.forEach(field => {
      if (field in filtered) {
        delete filtered[field as keyof FormData];
      }
    });
    
    return filtered;
  }
  
  /**
   * Check if there are stored preferences for pre-filling
   */
  public hasStoredPreferences(): boolean {
    return this.hasOptedIn() && 
           this.preferences !== null && 
           Object.keys(this.preferences.formPreferences).length > 0;
  }
  
  /**
   * Get when preferences were last updated
   */
  public getLastVisit(): string | null {
    return this.preferences?.lastVisit || null;
  }
  
  /**
   * Set user dark mode preference
   */
  public setDarkModePreference(prefersDarkMode: boolean): void {
    if (!this.preferences) {
      this.preferences = {
        formPreferences: {},
        lastVisit: new Date().toISOString(),
        hasOptedInToDataStorage: false,
        prefersDarkMode
      };
    } else {
      this.preferences.prefersDarkMode = prefersDarkMode;
    }
    
    this.savePreferences();
  }
  
  /**
   * Get user dark mode preference
   */
  public getDarkModePreference(): boolean | undefined {
    return this.preferences?.prefersDarkMode;
  }
}

// Export a singleton instance
export default new UserPreferencesService(); 