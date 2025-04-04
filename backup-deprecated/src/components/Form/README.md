# ModalForm Component

A flexible multi-step form container component for United Tactical Defense Frontend.

## Features

- **Multi-step Form Management**: Easily create wizard-style forms with multiple steps
- **Form State Persistence**: State is maintained across steps and can be pre-populated
- **Step Navigation**: Next/previous navigation with progress indicators
- **Step Validation**: Validate each step before proceeding
- **Form Submission**: Built-in submission handling with error management
- **Responsive Design**: Fully responsive modal container works on all device sizes
- **Accessibility**: ARIA attributes and keyboard navigation support

## Installation

No additional installation required - components are part of the United Tactical Defense codebase.

## Basic Usage

```jsx
import React, { useState } from 'react';
import ModalForm from '../components/Form/ModalForm';
import FormStep from '../components/Form/FormStep';

const MyForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSubmit = async (formData) => {
    // Submit form data to API
    console.log('Form submitted:', formData);
  };
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Form</button>
      
      <ModalForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="My Multi-step Form"
      >
        <FormStep stepIndex={0}>
          <h3>Step 1</h3>
          {/* Step 1 form fields */}
        </FormStep>
        
        <FormStep stepIndex={1}>
          <h3>Step 2</h3>
          {/* Step 2 form fields */}
        </FormStep>
        
        <FormStep stepIndex={2}>
          <h3>Step 3</h3>
          {/* Step 3 form fields */}
        </FormStep>
      </ModalForm>
    </>
  );
};
```

## Advanced Usage

### With Validation

```jsx
import { createStepValidator } from '../services/validation/formValidator';

// Create validation rules for each step
const personalInfoValidator = createStepValidator({
  firstName: { required: true },
  lastName: { required: true },
  email: { required: true, email: true }
});

// Use in FormStep
<FormStep 
  stepIndex={0}
  validate={personalInfoValidator}
>
  {/* Step content */}
</FormStep>
```

### With Initial Data

```jsx
const initialFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
};

<ModalForm
  initialData={initialFormData}
  // ...other props
>
  {/* FormSteps */}
</ModalForm>
```

## Component API

### ModalForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | Required | FormStep components |
| `initialData` | object | `{}` | Initial form data |
| `onSubmit` | function | Required | Function called with form data on submission |
| `title` | string | 'Form' | Modal title |
| `isOpen` | boolean | Required | Controls modal visibility |
| `onClose` | function | Required | Function called when modal closes |
| `validateBeforeNext` | boolean | `true` | Whether to validate before proceeding |
| `submitLabel` | string | 'Submit' | Text for submit button |
| `nextLabel` | string | 'Next' | Text for next button |
| `prevLabel` | string | 'Back' | Text for previous button |

### FormStep Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stepIndex` | number | Required | Zero-based index of this step |
| `validate` | function | `() => true` | Function to validate step data |
| `onStepComplete` | function | null | Callback when step validation changes |
| `children` | node | Required | Step content |

## Examples

See the [`examples/FreeClassForm.jsx`](./examples/FreeClassForm.jsx) for a complete example implementation.

## Testing

Unit tests are available in the `__tests__` directory. Run them with:

```bash
npm test
``` 