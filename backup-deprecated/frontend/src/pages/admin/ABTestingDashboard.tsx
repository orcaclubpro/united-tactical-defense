import React, { useState, useEffect } from 'react';
import { ABTestingService } from '../../services/analytics';
import { VariantPerformance, TestPerformance } from '../../services/analytics/abTesting';
import './ABTestingDashboard.scss';

// Import interfaces from abTesting.ts
interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: Array<{
    id: string;
    name: string;
    weight: number;
  }>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

interface TestResult {
  testId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

const ABTestingDashboard: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [results, setResults] = useState<Record<string, TestResult[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [winningVariants, setWinningVariants] = useState<Record<string, string | null>>({});
  const [isApplyingWinner, setIsApplyingWinner] = useState(false);

  useEffect(() => {
    // Initialize with the last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });

    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadTestResults(selectedTest);
    }
  }, [selectedTest, dateRange]);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const activeTests = ABTestingService.getActiveTests();
      setTests(activeTests);
      
      if (activeTests.length > 0) {
        setSelectedTest(activeTests[0].id);
      }
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestResults = async (testId: string) => {
    setIsLoading(true);
    try {
      // Use the enhanced getTestPerformance method
      const performance = await ABTestingService.getTestPerformance(
        testId,
        dateRange.start,
        dateRange.end
      );
      
      if (performance) {
        const testResults = performance.variants.map((variant: VariantPerformance) => ({
          testId,
          variantId: variant.variantId,
          impressions: variant.impressions,
          conversions: variant.conversions,
          conversionRate: variant.conversionRate
        }));
        
        setResults(prev => ({ ...prev, [testId]: testResults }));
        
        // Check if there's a winner
        const winner = ABTestingService.getTestWinner(performance);
        setWinningVariants(prev => ({ ...prev, [testId]: winner }));
      }
    } catch (error) {
      console.error('Failed to load test results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const applyWinningVariant = (testId: string, variantId: string) => {
    setIsApplyingWinner(true);
    try {
      ABTestingService.applyWinningVariant(testId, variantId);
      // Refresh the test list
      loadTests();
    } catch (error) {
      console.error('Failed to apply winning variant:', error);
    } finally {
      setIsApplyingWinner(false);
    }
  };

  const renderTestSelector = () => (
    <div className="test-selector">
      <h2>Select Test</h2>
      <select
        value={selectedTest || ''}
        onChange={(e) => setSelectedTest(e.target.value)}
        disabled={isLoading}
      >
        {tests.map(test => (
          <option key={test.id} value={test.id}>
            {test.name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderDateRangeSelector = () => (
    <div className="date-range-selector">
      <h3>Date Range</h3>
      <div className="date-inputs">
        <div>
          <label htmlFor="start">Start Date:</label>
          <input
            type="date"
            id="start"
            name="start"
            value={dateRange.start}
            onChange={handleDateRangeChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="end">End Date:</label>
          <input
            type="date"
            id="end"
            name="end"
            value={dateRange.end}
            onChange={handleDateRangeChange}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );

  const renderTestResults = () => {
    if (!selectedTest || !results[selectedTest]) {
      return <div className="no-results">Select a test to view results</div>;
    }

    const testData = results[selectedTest];
    const selectedTestObj = tests.find(t => t.id === selectedTest);
    const winningVariant = winningVariants[selectedTest];

    return (
      <div className="test-results">
        <h2>{selectedTestObj?.name} Results</h2>
        <p className="test-description">{selectedTestObj?.description}</p>
        
        {winningVariant && (
          <div className="winning-variant-banner">
            <h3>Winning Variant Detected!</h3>
            <p>
              The variant "{selectedTestObj?.variants.find(v => v.id === winningVariant)?.name}" 
              is performing significantly better.
            </p>
            <button 
              className="apply-winner-btn"
              onClick={() => applyWinningVariant(selectedTest, winningVariant)}
              disabled={isApplyingWinner}
            >
              {isApplyingWinner ? 'Applying...' : 'Apply Winning Variant to All Users'}
            </button>
          </div>
        )}
        
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Variant</th>
                <th>Impressions</th>
                <th>Conversions</th>
                <th>Conversion Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {testData.map(result => (
                <tr 
                  key={result.variantId}
                  className={winningVariant === result.variantId ? 'winning-row' : ''}
                >
                  <td>{selectedTestObj?.variants.find((v: { id: string }) => v.id === result.variantId)?.name}</td>
                  <td>{result.impressions}</td>
                  <td>{result.conversions}</td>
                  <td>{result.conversionRate.toFixed(2)}%</td>
                  <td>
                    {winningVariant === result.variantId ? (
                      <span className="winner-badge">Winner</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="results-chart">
          <h3>Conversion Rate Comparison</h3>
          <div className="chart-placeholder">
            {testData.map(result => (
              <div 
                key={result.variantId} 
                className={`chart-bar ${winningVariant === result.variantId ? 'winning-bar' : ''}`}
                style={{ 
                  width: `${result.conversionRate * 3}px`,
                  backgroundColor: getVariantColor(result.variantId)
                }}
              >
                <span className="variant-name">
                  {selectedTestObj?.variants.find((v: { id: string }) => v.id === result.variantId)?.name}
                </span>
                <span className="conversion-rate">{result.conversionRate.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getVariantColor = (variantId: string): string => {
    // Generate a deterministic color based on the variant ID
    const colors = [
      '#4285F4', // Google Blue
      '#34A853', // Google Green
      '#FBBC05', // Google Yellow
      '#EA4335', // Google Red
      '#8AB4F8', // Light Blue
      '#81C995', // Light Green
      '#FDD663', // Light Yellow
      '#F28B82'  // Light Red
    ];
    
    // Simple hash function to pick a color
    const index = variantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="ab-testing-dashboard">
      <header>
        <h1>A/B Testing Dashboard</h1>
      </header>
      
      <div className="dashboard-controls">
        {renderTestSelector()}
        {renderDateRangeSelector()}
      </div>
      
      {isLoading ? (
        <div className="loading">Loading test results...</div>
      ) : (
        renderTestResults()
      )}
    </div>
  );
};

export default ABTestingDashboard; 