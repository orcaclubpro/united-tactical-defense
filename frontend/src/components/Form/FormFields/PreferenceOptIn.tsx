import React, { useState, useEffect } from 'react';
import { useUserPreferences } from '../../../hooks';
import Checkbox from './Checkbox';

interface PreferenceOptInProps {
  onOptInChange?: (optedIn: boolean) => void;
}

/**
 * Form component that allows users to opt-in to saving their preferences
 * for pre-filling forms in the future.
 */
const PreferenceOptIn: React.FC<PreferenceOptInProps> = ({ onOptInChange }) => {
  const { hasOptedIn, setOptIn, hasStoredData, clearPreferences } = useUserPreferences();
  const [showClearButton, setShowClearButton] = useState(false);
  
  // Show clear button if we have stored data
  useEffect(() => {
    setShowClearButton(hasStoredData);
  }, [hasStoredData]);
  
  // Handle opt-in change
  const handleOptInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const optedIn = e.target.checked;
    setOptIn(optedIn);
    
    if (onOptInChange) {
      onOptInChange(optedIn);
    }
  };
  
  // Handle clearing preferences
  const handleClearPreferences = () => {
    if (window.confirm('Are you sure you want to clear all your saved preferences?')) {
      clearPreferences();
      setShowClearButton(false);
    }
  };
  
  return (
    <div className="preference-opt-in">
      <div className="opt-in-checkbox">
        <Checkbox
          id="preferences-opt-in"
          name="preferencesOptIn"
          checked={hasOptedIn}
          onChange={handleOptInChange}
          label="Save my information for faster booking next time"
        />
        <p className="opt-in-description">
          Your information will be stored locally on your device and used only to pre-fill forms on this site.
          You can opt-out or clear this data at any time.
        </p>
      </div>
      
      {showClearButton && (
        <button 
          type="button"
          className="clear-preferences-button"
          onClick={handleClearPreferences}
        >
          Clear saved preferences
        </button>
      )}
      
      <style jsx>{`
        .preference-opt-in {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }
        
        .opt-in-checkbox {
          display: flex;
          flex-direction: column;
        }
        
        .opt-in-description {
          margin-top: 0.25rem;
          font-size: 0.8rem;
          color: #666;
          max-width: 90%;
        }
        
        .clear-preferences-button {
          margin-top: 0.5rem;
          background: none;
          border: none;
          color: #f56565;
          font-size: 0.8rem;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
        }
        
        .clear-preferences-button:hover {
          color: #c53030;
        }
        
        @media (max-width: 768px) {
          .opt-in-description {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PreferenceOptIn; 