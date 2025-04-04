import React from 'react';
import './SuggestionCard.scss';

export interface SuggestionProps {
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface SuggestionCardProps {
  suggestion: SuggestionProps;
  isLoading?: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isLoading = false
}) => {
  const { title, description, expectedImpact, difficulty, category } = suggestion;
  
  const getDifficultyColor = (difficulty: string): string => {
    switch(difficulty) {
      case 'easy':
        return 'easy-difficulty';
      case 'medium':
        return 'medium-difficulty';
      case 'hard':
        return 'hard-difficulty';
      default:
        return '';
    }
  };

  return (
    <div className="suggestion-card">
      {isLoading ? (
        <div className="suggestion-card__loading">
          <div className="suggestion-card__loading-pulse"></div>
        </div>
      ) : (
        <>
          <div className="suggestion-card__header">
            <span className={`suggestion-card__difficulty ${getDifficultyColor(difficulty)}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} to implement
            </span>
            <span className="suggestion-card__category">{category}</span>
          </div>
          <h3 className="suggestion-card__title">{title}</h3>
          <p className="suggestion-card__description">{description}</p>
          <div className="suggestion-card__impact">
            <span className="suggestion-card__impact-label">Expected Impact:</span>
            <span className="suggestion-card__impact-value">{expectedImpact}</span>
          </div>
          <div className="suggestion-card__footer">
            <button className="suggestion-card__button">Implement Suggestion</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SuggestionCard; 