import React, { useState, useEffect, ReactNode } from 'react';
import { ABTestingService } from '../../services/analytics';

interface ABTestingVariantProps {
  testId: string;
  variants: Record<string, ReactNode>;
  fallback?: ReactNode;
  onVariantSelected?: (variantId: string) => void;
}

/**
 * A component that conditionally renders one of multiple variants based on A/B test assignment.
 * 
 * @param testId - The ID of the A/B test to use for variant selection
 * @param variants - A map of variant IDs to React nodes to render
 * @param fallback - Optional fallback content to render if no variant is assigned
 * @param onVariantSelected - Optional callback when a variant is selected
 */
const ABTestingVariant: React.FC<ABTestingVariantProps> = ({
  testId,
  variants,
  fallback = null,
  onVariantSelected
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the assigned variant for this test
    const variant = ABTestingService.getAssignedVariant(testId);
    
    if (variant && variant.id in variants) {
      setSelectedVariantId(variant.id);
      
      if (onVariantSelected) {
        onVariantSelected(variant.id);
      }
    }
    
    setIsLoading(false);
  }, [testId, variants, onVariantSelected]);

  // While loading, render nothing or a minimal placeholder
  if (isLoading) {
    return null;
  }

  // If we have a selected variant and it exists in our variants map, render it
  if (selectedVariantId && variants[selectedVariantId]) {
    return <>{variants[selectedVariantId]}</>;
  }

  // Otherwise render the fallback
  return <>{fallback}</>;
};

export default ABTestingVariant; 