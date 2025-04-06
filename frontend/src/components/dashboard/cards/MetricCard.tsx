import React, { memo } from 'react';
import './MetricCard.scss';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

// Create a comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: MetricCardProps, nextProps: MetricCardProps) => {
  // If loading state changes, re-render
  if (prevProps.isLoading !== nextProps.isLoading) {
    return false;
  }
  
  // If value changes, re-render
  if (prevProps.value !== nextProps.value) {
    return false;
  }
  
  // If title changes, re-render
  if (prevProps.title !== nextProps.title) {
    return false;
  }
  
  // If change object changes, re-render
  if (prevProps.change?.value !== nextProps.change?.value || 
      prevProps.change?.isPositive !== nextProps.change?.isPositive) {
    return false;
  }
  
  // Otherwise, don't re-render
  return true;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  isLoading = false
}) => {
  return (
    <div className="metric-card">
      {isLoading ? (
        <div className="metric-card__loading">
          <div className="metric-card__loading-pulse"></div>
        </div>
      ) : (
        <>
          <div className="metric-card__header">
            <h3 className="metric-card__title">{title}</h3>
            {icon && <div className="metric-card__icon">{icon}</div>}
          </div>
          <div className="metric-card__value">{value}</div>
          {change && (
            <div className={`metric-card__change ${change.isPositive ? 'positive' : 'negative'}`}>
              <span>
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="metric-card__period">vs previous period</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Export memoized component for better performance
export default memo(MetricCard, areEqual); 