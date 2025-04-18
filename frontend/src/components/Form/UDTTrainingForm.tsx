import React, { useEffect } from 'react';
import styled from 'styled-components';
import ModernModalUI from './ModernModalUI';

interface UDTTrainingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const IframeContainer = styled.div`
  width: 100%;
  height: 632px;
  border-radius: 4px;
  overflow: hidden;
`;

const UDTTrainingForm: React.FC<UDTTrainingFormProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    // Load the UDT Training form script when the component mounts
    const script = document.createElement('script');
    script.src = 'https://go.udttraining.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <ModernModalUI
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Capture"
      darkMode={true}
    >
      <IframeContainer>
        <iframe
          src="https://go.udttraining.com/widget/form/TEKBM3ACn5q9MxWAjsL8"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }}
          id="inline-TEKBM3ACn5q9MxWAjsL8"
          data-layout="{'id':'INLINE'}"
          data-trigger-type="alwaysShow"
          data-trigger-value=""
          data-activation-type="alwaysActivated"
          data-activation-value=""
          data-deactivation-type="neverDeactivate"
          data-deactivation-value=""
          data-form-name="Lead Capture"
          data-height="632"
          data-layout-iframe-id="inline-TEKBM3ACn5q9MxWAjsL8"
          data-form-id="TEKBM3ACn5q9MxWAjsL8"
          title="Lead Capture"
        />
      </IframeContainer>
    </ModernModalUI>
  );
};

export default UDTTrainingForm; 