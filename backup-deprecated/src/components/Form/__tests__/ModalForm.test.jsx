import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalForm from '../ModalForm';
import FormStep from '../FormStep';
import { createStepValidator } from '../../../services/validation/formValidator';

// Mock data and handlers
const mockOnSubmit = jest.fn();
const mockOnClose = jest.fn();
const initialData = { name: 'John Doe' };

// Create test component with steps
const TestForm = ({ isOpen = true, validateBeforeNext = true }) => (
  <ModalForm
    isOpen={isOpen}
    onClose={mockOnClose}
    onSubmit={mockOnSubmit}
    title="Test Form"
    initialData={initialData}
    validateBeforeNext={validateBeforeNext}
  >
    <FormStep
      stepIndex={0}
      validate={createStepValidator({
        name: { required: true },
      })}
    >
      <div>Step 1 Content</div>
      <input 
        type="text"
        data-testid="name-input"
        onChange={(e) => {}}
      />
    </FormStep>
    <FormStep
      stepIndex={1}
      validate={createStepValidator({
        email: { required: true, email: true },
      })}
    >
      <div>Step 2 Content</div>
      <input 
        type="email"
        data-testid="email-input"
        onChange={(e) => {}}
      />
    </FormStep>
    <FormStep stepIndex={2}>
      <div>Step 3 Content</div>
    </FormStep>
  </ModalForm>
);

describe('ModalForm Component', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnClose.mockClear();
  });

  test('renders modal when isOpen is true', () => {
    render(<TestForm />);
    
    expect(screen.getByTestId('modal-container')).toBeInTheDocument();
    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(<TestForm isOpen={false} />);
    
    expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument();
  });

  test('shows first step by default', () => {
    render(<TestForm />);
    
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Step 2 Content')).not.toBeInTheDocument();
  });

  test('navigates to next step when Next button is clicked', async () => {
    render(<TestForm />);
    
    // Initial step should be visible
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    
    // Click next button to advance to step 2
    fireEvent.click(screen.getByTestId('next-button'));
    
    // Step 2 should now be visible
    await waitFor(() => {
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
      expect(screen.queryByText('Step 1 Content')).not.toBeInTheDocument();
    });
  });

  test('calls onSubmit when Submit button is clicked on last step', async () => {
    render(<TestForm validateBeforeNext={false} />);
    
    // Navigate to step 2
    fireEvent.click(screen.getByTestId('next-button'));
    
    // Navigate to step 3 (last step)
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('next-button'));
    });
    
    // Click submit button on last step
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('submit-button'));
    });
    
    // Verify onSubmit was called
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close button is clicked', () => {
    render(<TestForm />);
    
    // Click close button
    fireEvent.click(screen.getByTestId('close-button'));
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('renders step indicator for multi-step forms', () => {
    render(<TestForm />);
    
    // Step indicator should be present
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
    
    // Should have 3 step dots (one for each step)
    expect(screen.getByTestId('step-dot-0')).toBeInTheDocument();
    expect(screen.getByTestId('step-dot-1')).toBeInTheDocument();
    expect(screen.getByTestId('step-dot-2')).toBeInTheDocument();
  });

  test('allows navigation via step indicator dots', async () => {
    render(<TestForm validateBeforeNext={false} />);
    
    // Click on third step dot to jump to step 3
    fireEvent.click(screen.getByTestId('step-dot-2'));
    
    // Step 3 should now be visible
    await waitFor(() => {
      expect(screen.getByText('Step 3 Content')).toBeInTheDocument();
    });
  });
}); 