import React, { useState, useEffect } from 'react';
import Checkbox from './Checkbox';
import UserPreferencesService from '../../../services/userPreferences';
import styled from 'styled-components';

interface PreferenceOptInProps {
  onOptInChange?: (optedIn: boolean) => void;
}

const OptInContainer = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const OptInCheckbox = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptInDescription = styled.p`
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #666;
  max-width: 90%;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const ClearButton = styled.button`
  margin-top: 0.5rem;
  background: none;
  border: none;
  color: #f56565;
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #c53030;
  }
`;

/**
 * Form component that allows users to opt-in to saving their preferences
 * for pre-filling forms in the future.
 */
const PreferenceOptIn: React.FC<PreferenceOptInProps> = ({ onOptInChange }) => {
  const [hasOptedIn, setHasOptedIn] = useState<boolean>(false);
  const [showClearButton, setShowClearButton] = useState<boolean>(false);
  
  // Check if user previously opted in
  useEffect(() => {
    const hasPreferences = UserPreferencesService.hasStoredPreferences();
    const isOptedIn = UserPreferencesService.hasOptedIn();
    
    setHasOptedIn(isOptedIn);
    setShowClearButton(hasPreferences);
  }, []);
  
  // Handle opt-in state change
  const handleOptInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const optedIn = e.target.checked;
    setHasOptedIn(optedIn);
    UserPreferencesService.setOptIn(optedIn);
    
    if (onOptInChange) {
      onOptInChange(optedIn);
    }
  };
  
  // Handle clearing stored preferences
  const handleClearPreferences = () => {
    UserPreferencesService.clearPreferences();
    setShowClearButton(false);
  };
  
  return (
    <OptInContainer>
      <OptInCheckbox>
        <Checkbox
          id="preferences-opt-in"
          name="preferencesOptIn"
          checked={hasOptedIn}
          onChange={handleOptInChange}
          label="Save my information for faster booking next time"
        />
        <OptInDescription>
          Your information will be stored locally on your device and used only to pre-fill forms on this site.
          You can opt-out or clear this data at any time.
        </OptInDescription>
      </OptInCheckbox>
      
      {showClearButton && (
        <ClearButton
          type="button"
          onClick={handleClearPreferences}
        >
          Clear saved preferences
        </ClearButton>
      )}
    </OptInContainer>
  );
};

export default PreferenceOptIn; 