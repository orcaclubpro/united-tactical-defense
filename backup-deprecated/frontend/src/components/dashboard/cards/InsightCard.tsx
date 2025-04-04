import React from 'react';
import './InsightCard.scss';

export interface InsightProps {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  date: string;
}

interface InsightCardProps {
  insight: InsightProps;
  isLoading?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  isLoading = false
}) => {
  const { title, description, impact, category, date } = insight;
  
  const getImpactColor = (impact: string): string => {
    switch(impact) {
      case 'high':
        return 'high-impact';
      case 'medium':
        return 'medium-impact';
      case 'low':
        return 'low-impact';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="insight-card">
      {isLoading ? (
        <div className="insight-card__loading">
          <div className="insight-card__loading-pulse"></div>
        </div>
      ) : (
        <>
          <div className="insight-card__header">
            <span className={`insight-card__impact ${getImpactColor(impact)}`}>
              {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
            </span>
            <span className="insight-card__category">{category}</span>
          </div>
          <h3 className="insight-card__title">{title}</h3>
          <p className="insight-card__description">{description}</p>
          <div className="insight-card__footer">
            <span className="insight-card__date">Generated on {formatDate(date)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default InsightCard; 