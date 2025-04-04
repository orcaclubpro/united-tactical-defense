import { useState, useEffect, useCallback } from 'react';
import { useForm, FormFieldValue } from '../contexts/FormContext';
import UserPreferencesService from '../services/userPreferences';

/**
 * Custom hook for managing user preferences
 */
export function useUserPreferences() {
  const { formData, updateFormData } = useForm();
  const [hasOptedIn, setHasOptedIn] = useState<boolean>(UserPreferencesService.hasOptedIn());
  const [hasStoredData, setHasStoredData] = useState<boolean>(UserPreferencesService.hasStoredPreferences());
  const [lastVisit, setLastVisit] = useState<string | null>(UserPreferencesService.getLastVisit());
  
  // Update local state when preferences change
  useEffect(() => {
    setHasOptedIn(UserPreferencesService.hasOptedIn());
    setHasStoredData(UserPreferencesService.hasStoredPreferences());
    setLastVisit(UserPreferencesService.getLastVisit());
  }, []);
  
  /**
   * Set opt-in status for data storage
   */
  const setOptIn = useCallback((optIn: boolean) => {
    UserPreferencesService.setOptIn(optIn);
    setHasOptedIn(optIn);
  }, []);
  
  /**
   * Pre-fill form with stored preferences
   */
  const loadStoredPreferences = useCallback(() => {
    if (!hasOptedIn) return false;
    
    const preferences = UserPreferencesService.getFormPreferences();
    if (preferences) {
      Object.entries(preferences).forEach(([key, value]) => {
        // Skip undefined values
        if (value !== undefined) {
          updateFormData(key, value as FormFieldValue);
        }
      });
      return true;
    }
    
    return false;
  }, [hasOptedIn, updateFormData]);
  
  /**
   * Save current form data as preferences
   */
  const savePreferences = useCallback((specificFields?: string[]) => {
    if (!hasOptedIn) return false;
    
    UserPreferencesService.storeFormPreferences(formData, specificFields);
    setHasStoredData(UserPreferencesService.hasStoredPreferences());
    setLastVisit(UserPreferencesService.getLastVisit());
    return true;
  }, [formData, hasOptedIn]);
  
  /**
   * Clear all stored preferences
   */
  const clearPreferences = useCallback(() => {
    UserPreferencesService.clearPreferences();
    setHasOptedIn(false);
    setHasStoredData(false);
    setLastVisit(null);
  }, []);
  
  return {
    hasOptedIn,
    hasStoredData,
    lastVisit,
    setOptIn,
    loadStoredPreferences,
    savePreferences,
    clearPreferences
  };
}

export default useUserPreferences; 