import React, { useState, useEffect } from 'react';
import './DateRangePicker.scss';

export type DateRange = {
  startDate: string;
  endDate: string;
};

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  dateRange,
  onDateRangeChange
}) => {
  const today = new Date();
  
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const [localDateRange, setLocalDateRange] = useState<DateRange>(dateRange);
  const [isOpen, setIsOpen] = useState(false);
  
  // Update local state when props change
  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setLocalDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleApply = () => {
    onDateRangeChange(localDateRange);
    setIsOpen(false);
  };
  
  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    const newRange = {
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end)
    };
    
    setLocalDateRange(newRange);
    onDateRangeChange(newRange);
    setIsOpen(false);
  };
  
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="date-range-picker">
      <button 
        className="date-range-picker__button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="date-range-picker__icon">
          {/* Calendar icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          </svg>
        </span>
        <span className="date-range-picker__date-display">
          {formatDisplayDate(localDateRange.startDate)} - {formatDisplayDate(localDateRange.endDate)}
        </span>
        <span className="date-range-picker__dropdown-icon">
          {/* Dropdown icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="date-range-picker__dropdown">
          <div className="date-range-picker__presets">
            <button onClick={() => setPresetRange(7)}>Last 7 days</button>
            <button onClick={() => setPresetRange(14)}>Last 14 days</button>
            <button onClick={() => setPresetRange(30)}>Last 30 days</button>
            <button onClick={() => setPresetRange(90)}>Last 90 days</button>
          </div>
          
          <div className="date-range-picker__custom">
            <div className="date-range-picker__input-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={localDateRange.startDate}
                onChange={handleInputChange}
                max={localDateRange.endDate}
              />
            </div>
            
            <div className="date-range-picker__input-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={localDateRange.endDate}
                onChange={handleInputChange}
                min={localDateRange.startDate}
                max={formatDateForInput(today)}
              />
            </div>
          </div>
          
          <div className="date-range-picker__actions">
            <button 
              className="date-range-picker__cancel"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="date-range-picker__apply"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 