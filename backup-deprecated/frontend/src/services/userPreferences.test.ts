import { userPreferencesService } from './userPreferences';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('userPreferencesService', () => {
  beforeEach(() => {
    // Clear local storage and mocks before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('savePreferences', () => {
    it('should save user preferences to localStorage', () => {
      const preferences = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      };

      userPreferencesService.savePreferences(preferences);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userPreferences',
        expect.any(String)
      );
      
      // Verify the data was serialized correctly
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveProperty('data');
      expect(savedData.data).toEqual(preferences);
      expect(savedData).toHaveProperty('timestamp');
    });

    it('should handle null or undefined values', () => {
      // @ts-ignore - Testing with invalid input
      userPreferencesService.savePreferences(null);
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      
      // @ts-ignore - Testing with invalid input
      userPreferencesService.savePreferences(undefined);
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
    
    it('should respect opt-in preferences', () => {
      const preferences = {
        name: 'John Doe',
        email: 'john@example.com',
        savePreferences: false // Explicitly opt-out
      };

      userPreferencesService.savePreferences(preferences);
      
      // Should not save when user has opted out
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      
      // Now with opt-in
      const optInPreferences = {
        ...preferences,
        savePreferences: true
      };
      
      userPreferencesService.savePreferences(optInPreferences);
      
      // Should save when user has opted in
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('getPreferences', () => {
    it('should retrieve saved preferences from localStorage', () => {
      // Set up test data
      const preferences = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      };
      
      const savedData = {
        data: preferences,
        timestamp: new Date().toISOString()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));
      
      // Get preferences
      const result = userPreferencesService.getPreferences();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('userPreferences');
      expect(result).toEqual(preferences);
    });

    it('should return null if no preferences are stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = userPreferencesService.getPreferences();
      
      expect(result).toBeNull();
    });
    
    it('should handle corrupted data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json-data');
      
      const result = userPreferencesService.getPreferences();
      
      expect(result).toBeNull();
    });
    
    it('should respect preference expiration', () => {
      // Data with expired timestamp (30 days ago)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const savedData = {
        data: { name: 'John Doe' },
        timestamp: thirtyDaysAgo.toISOString()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));
      
      // Set expiration to 7 days
      const result = userPreferencesService.getPreferences(7);
      
      // Should return null because data is too old
      expect(result).toBeNull();
      
      // Now with fresh data
      const freshData = {
        data: { name: 'John Doe' },
        timestamp: new Date().toISOString()
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(freshData));
      
      const freshResult = userPreferencesService.getPreferences(7);
      
      // Should return data because it's fresh
      expect(freshResult).toEqual(freshData.data);
    });
  });

  describe('clearPreferences', () => {
    it('should remove preferences from localStorage', () => {
      userPreferencesService.clearPreferences();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userPreferences');
    });
  });

  describe('isDataFresh', () => {
    it('should return true for fresh data', () => {
      const freshData = {
        data: { name: 'John Doe' },
        timestamp: new Date().toISOString()
      };
      
      const result = userPreferencesService.isDataFresh(freshData, 7);
      
      expect(result).toBe(true);
    });
    
    it('should return false for expired data', () => {
      // Data with expired timestamp (30 days ago)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const expiredData = {
        data: { name: 'John Doe' },
        timestamp: thirtyDaysAgo.toISOString()
      };
      
      const result = userPreferencesService.isDataFresh(expiredData, 7);
      
      expect(result).toBe(false);
    });
    
    it('should handle invalid timestamps', () => {
      const invalidData = {
        data: { name: 'John Doe' },
        timestamp: 'not-a-date'
      };
      
      const result = userPreferencesService.isDataFresh(invalidData, 7);
      
      expect(result).toBe(false);
    });
  });
}); 