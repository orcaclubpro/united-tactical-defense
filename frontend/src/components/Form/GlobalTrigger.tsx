import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// Avoid circular dependency by importing directly
import { FreeLessonFormController } from './FreeLessonFormController';
import { FormData } from '../../contexts/FormContext';

// Define an interface matching FreeLessonFormController's expected shape
interface FreeLessonFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  experience: string;
  [key: string]: any;
}

// Define the context type
interface GlobalFormContextType {
  openForm: (formType?: string, initialData?: FormData) => void;
  closeForm: () => void;
  isFormOpen: boolean;
  currentFormType: string | null;
  currentFormData: FormData | null;
}

// Create context with default values
const GlobalFormContext = createContext<GlobalFormContextType>({
  openForm: () => {},
  closeForm: () => {},
  isFormOpen: false,
  currentFormType: null,
  currentFormData: null
});

// Hook for components to use the global form context
export const useGlobalForm = () => useContext(GlobalFormContext);

interface GlobalFormProviderProps {
  children: ReactNode;
}

/**
 * GlobalFormProvider manages the state for form visibility across the application
 * and provides an interface for opening/closing the form from anywhere.
 */
export const GlobalFormProvider: React.FC<GlobalFormProviderProps> = ({ children }) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentFormType, setCurrentFormType] = useState<string | null>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  
  // Open form with optional type and initial data
  const openForm = useCallback((formType: string = 'free-class', initialData: FormData = {}) => {
    setCurrentFormType(formType);
    setCurrentFormData(initialData);
    setIsFormOpen(true);
  }, []);
  
  // Close form
  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);
  
  // Check URL for form parameters on initial load
  useEffect(() => {
    const handleUrlParameters = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const openFormParam = urlParams.get('openForm');
      
      if (openFormParam) {
        // Extract other potential parameters for pre-filling
        const initialData: FormData = {};
        
        // Common form fields to check in URL parameters
        const formFields = ['firstName', 'lastName', 'email', 'phone', 'program'];
        formFields.forEach(field => {
          const value = urlParams.get(field);
          if (value) {
            initialData[field] = value;
          }
        });
        
        // If we have UTM parameters, store them as well
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');
        
        if (utmSource) initialData.utmSource = utmSource;
        if (utmMedium) initialData.utmMedium = utmMedium;
        if (utmCampaign) initialData.utmCampaign = utmCampaign;
        
        // Open form with data from URL
        openForm(openFormParam, initialData);
      }
    };
    
    handleUrlParameters();
  }, [openForm]);
  
  // Convert FormData to FreeLessonFormData with proper defaults
  const adaptFormData = (data: FormData | null): FreeLessonFormData => {
    return {
      firstName: data?.firstName as string || '',
      lastName: data?.lastName as string || '',
      email: data?.email as string || '',
      phone: data?.phone as string || '',
      appointmentDate: data?.appointmentDate as (Date | null) || null,
      appointmentTime: data?.appointmentTime as string || '',
      experience: data?.experience as string || 'beginner',
      ...(data || {})
    };
  };
  
  return (
    <GlobalFormContext.Provider
      value={{
        openForm,
        closeForm,
        isFormOpen,
        currentFormType,
        currentFormData
      }}
    >
      {children}
      
      {/* Render the form controller when needed */}
      {isFormOpen && (
        <FreeLessonFormController
          isOpen={isFormOpen}
          onClose={closeForm}
          initialData={adaptFormData(currentFormData)}
          formSource={currentFormType || 'website'}
        />
      )}
    </GlobalFormContext.Provider>
  );
};

/**
 * GlobalFormTrigger is a component that can be placed anywhere
 * in the application to provide easy access to opening the form.
 */
interface GlobalFormTriggerProps {
  buttonText?: string;
  className?: string;
  formType?: string;
  initialData?: FormData;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
  buttonSize?: 'sm' | 'md' | 'lg';
}

const GlobalFormTrigger: React.FC<GlobalFormTriggerProps> = ({
  buttonText = 'Book Free Class',
  className = '',
  formType = 'free-class',
  initialData = {},
  buttonVariant = 'primary',
  buttonSize = 'md'
}) => {
  const { openForm } = useGlobalForm();
  
  const handleClick = () => {
    openForm(formType, initialData);
  };
  
  return (
    <button
      className={`btn btn-${buttonVariant} btn-${buttonSize} ${className}`}
      onClick={handleClick}
    >
      {buttonText}
    </button>
  );
};

export default GlobalFormTrigger; 