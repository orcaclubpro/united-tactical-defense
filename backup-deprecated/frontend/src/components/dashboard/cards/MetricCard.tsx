import React from 'react';
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

export default MetricCard; 