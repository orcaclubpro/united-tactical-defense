import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormDemo from './FormDemo';

describe('FormDemo', () => {
  test('renders with register button', () => {
    render(<FormDemo />);
    const buttonElement = screen.getByText(/Register for Free Class/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('opens modal when button is clicked', () => {
    render(<FormDemo />);
    const buttonElement = screen.getByText(/Register for Free Class/i);
    fireEvent.click(buttonElement);
    
    const modalTitle = screen.getByText(/Free Class Registration/i);
    expect(modalTitle).toBeInTheDocument();
  });

  test('shows first step initially', () => {
    render(<FormDemo />);
    const buttonElement = screen.getByText(/Register for Free Class/i);
    fireEvent.click(buttonElement);
    
    const stepTitle = screen.getByText(/Tell Us About Yourself/i);
    expect(stepTitle).toBeInTheDocument();
    
    const firstNameField = screen.getByLabelText(/First Name/i);
    expect(firstNameField).toBeInTheDocument();
  });

  test('disables Previous button on first step', () => {
    render(<FormDemo />);
    const buttonElement = screen.getByText(/Register for Free Class/i);
    fireEvent.click(buttonElement);
    
    const previousButton = screen.getByText(/Previous/i);
    expect(previousButton).toBeDisabled();
  });

  test('can navigate to next step', async () => {
    render(<FormDemo />);
    const buttonElement = screen.getByText(/Register for Free Class/i);
    fireEvent.click(buttonElement);
    
    // Fill required fields in first step
    const firstNameField = screen.getByLabelText(/First Name/i);
    const lastNameField = screen.getByLabelText(/Last Name/i);
    const emailField = screen.getByLabelText(/Email Address/i);
    
    fireEvent.change(firstNameField, { target: { value: 'John' } });
    fireEvent.change(lastNameField, { target: { value: 'Doe' } });
    fireEvent.change(emailField, { target: { value: 'john.doe@example.com' } });
    
    // Click Next
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    // Wait for step 2 to appear
    await waitFor(() => {
      const step2Title = screen.getByText(/Your Training Preferences/i);
      expect(step2Title).toBeInTheDocument();
    });
  });

  test('closes modal when close button is clicked', () => {
    render(<FormDemo />);
    const buttonElement = screen.getByText(/Register for Free Class/i);
    fireEvent.click(buttonElement);
    
    const closeButton = screen.getByLabelText(/Close/i);
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/Free Class Registration/i)).not.toBeInTheDocument();
  });
}); 