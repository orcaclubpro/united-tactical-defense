# United Tactical Defense

## Overview
United Tactical Defense is a comprehensive web platform for a reality-based firearms and self-defense training center. The application serves as both a marketing tool and a business management system, designed to showcase training programs, facilitate lead generation, and streamline appointment scheduling.

## Architecture

United Tactical Defense follows the clean architecture pattern, which separates concerns into distinct layers:

### Core Layer
- Contains domain entities and business rules
- Defines interfaces for outer layers
- Has no dependencies on other layers
- Components include domain models, interfaces, and use cases

### Service Layer
- Contains implementation of business logic
- Depends only on the Core layer
- Implements interfaces defined in the Core layer
- Includes service implementations, business logic operations, and data adapters

### Data Access Layer
- Contains database and external service access
- Implements repository interfaces from Core layer
- Handles data persistence and retrieval
- Includes repository implementations, data models, and database operations
- Features connection pooling with automatic failure recovery

### API Layer
- Contains HTTP endpoints and controllers
- Handles request validation and response formatting
- Depends on Service layer for business logic
- Includes controllers, middleware, routes, and validators

## Key Components

### Authentication System
- JWT-based authentication with refresh tokens
- Role-based authorization
- User registration and login
- Secure token management

### Lead Management System
- Processes and stores lead information
- Manages lead status and assignment
- Provides search and filtering capabilities
- Tracks lead activities and conversion

### Appointment System
- Handles scheduling, rescheduling, and cancellation
- Manages availability through time slots
- Integrates with lead management
- Prevents double-bookings
- Sends notifications for upcoming appointments

### Enhanced Form Processing System
- Multi-step form implementation with validation at each step
- Integrated booking calendar with real-time availability checking
- Global form access from anywhere in the application
- Deep linking support with form pre-filling capabilities
- Comprehensive form analytics tracking
- Centralized form submission through FreeLessonFormController
- Responsive design optimized for all devices
- Consistent form styling and behavior across the application

### Analytics Engine
- Tracks user interactions and events
- Generates reports and insights
- Identifies trends and patterns
- Provides dashboard data
- Form usage analytics with step completion tracking
- Conversion funnel visualization for form submissions

### Database Connection Management
- Connection pooling for efficient database access
- Automatic connection reuse and release
- Configurable pool size based on load
- Retry mechanism with exponential backoff
- Error classification and handling
- Connection failure recovery
- Transaction support with automatic rollback
- Performance monitoring and metrics collection

## Technical Stack

### Frontend
- React.js with TypeScript
- Context API for state management
- Custom hooks for form validation and step navigation
- Modern responsive CSS with SCSS
- Progressive Web App capabilities

### Backend
- Node.js/Express API server
- SQLite database with connection pooling
- JWT authentication
- RESTful API architecture
- Robust error handling and recovery

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- npm (v6 or newer)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file with your environment settings
5. Run database migrations:
   ```bash
   npm run migrate
   ```

### Running the Application
Start the application in development mode:
```bash
npm run dev
```

For a simpler development server:
```bash
NODE_ENV=development npm run simple
```

### Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

## Available Scripts
- `npm start`: Start the backend server
- `npm run dev`: Start backend with nodemon (auto-restart)
- `npm run simple`: Start the simple server
- `npm run client`: Start frontend development server
- `npm run install-all`: Install dependencies for both frontend and backend
- `npm run build`: Build frontend for production
- `npm run test`: Run tests
- `npm run test:coverage`: Run tests with coverage report
- `npm run migrate`: Run database migrations
- `npm run migrate:down`: Rollback database migrations
- `npm run test:db-pooling`: Run database connection pooling tests

## Project Structure
```
united-tactical-defense/
├── src/                  # Backend with Clean Architecture pattern
│   ├── core/             # Core domain layer
│   │   ├── entities/     # Domain models
│   │   ├── interfaces/   # Interface definitions
│   │   ├── adapters/     # Interface adapters
│   │   └── usecases/     # Business logic operations
│   ├── services/         # Service layer
│   │   ├── auth/         # Authentication services
│   │   ├── lead/         # Lead management services
│   │   ├── appointment/  # Appointment scheduling services
│   │   └── form/         # Form processing services
│   ├── data/             # Data access layer
│   │   ├── models/       # Data models and schemas
│   │   ├── repositories/ # Data access implementations
│   │   └── migrations/   # Database migrations
│   ├── api/              # API layer
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API route definitions
│   │   └── validators/   # Input validation
│   ├── config/           # Configuration management
│   │   ├── database.js   # Database configuration with connection pooling
│   ├── app.js            # Express application setup
│   ├── server.js         # Main server entry point
│   ├── simple-server.js  # Simple development server
│   └── utils/            # Utility functions
│       ├── dbErrorHandler.js # Database error handling and retry
│       ├── dbPerformance.js  # Database performance monitoring
├── frontend/             # React frontend application
│   ├── src/              # Frontend source code
│   │   ├── components/   # React components
│   │   │   ├── Form/     # Enhanced form components
│   │   │   │   ├── FreeLessonFormController.tsx # Main form controller
│   │   │   │   ├── GlobalTrigger.tsx  # Global form access component
│   │   │   │   ├── ModernModalUI.tsx  # Enhanced modal component
│   │   │   │   └── ... # Other form components
│   │   │   ├── Calendar/ # Calendar booking components
│   │   │   ├── landing/  # Landing page components
│   │   │   └── ...      # Other component directories
│   │   ├── contexts/    # React context providers
│   │   ├── services/    # Frontend services
│   │   │   ├── api/     # API communication
│   │   │   ├── analytics/ # Analytics services
│   │   │   └── validation/ # Form validation
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Utility functions
│   ├── public/          # Public assets
│   └── package.json     # Frontend dependencies
├── tests/                # Test suites
├── data/                 # Data storage
├── public/               # Static public files
└── .env                  # Environment configuration
```

## Database Connection Pooling

The application uses a robust database connection pooling system to optimize database access and improve reliability:

### Key Features

1. **Connection Pooling**: Maintains a pool of database connections for improved performance
   - Eliminates connection creation overhead
   - Configurable pool size based on application needs
   - Automatic connection reuse and efficient management

2. **Error Handling and Recovery**:
   - Automatic retries for failed operations
   - Error classification for targeted handling
   - Exponential backoff for optimal retry timing
   - Stale connection detection and recovery

3. **Transaction Support**:
   - Automatic transaction management
   - Rollback on errors to maintain data integrity
   - Simplified transaction API

4. **Performance Monitoring**:
   - Detailed metrics on connection usage
   - Performance statistics collection
   - Load testing utilities

### Usage Examples

**Basic Database Operation with Retry:**
```javascript
const { executeWithRetry } = require('./utils/dbErrorHandler');

const user = await executeWithRetry(async (connection) => {
  return new Promise((resolve, reject) => {
    connection.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
});
```

**Transaction with Automatic Rollback:**
```javascript
const { executeTransaction } = require('./utils/dbErrorHandler');

const result = await executeTransaction(async (connection) => {
  return new Promise((resolve, reject) => {
    // Multiple operations that will automatically rollback on error
    connection.run('INSERT INTO users (name) VALUES (?)', ['John'], function(err) {
      if (err) return reject(err);
      
      const userId = this.lastID;
      connection.run('INSERT INTO profiles (user_id) VALUES (?)', [userId], function(err) {
        if (err) return reject(err);
        resolve({ success: true, userId });
      });
    });
  });
});
```

## Form System Architecture

The newly implemented form system provides a unified approach to form handling across the application:

### Key Components

1. **FreeLessonFormController**: Central component managing all form interactions
   - Handles form state and validation
   - Manages multi-step form navigation
   - Processes form submission with retry capability
   - Provides unified booking experience

2. **GlobalFormTrigger**: Enables access to forms from anywhere in the application
   - Context provider for application-wide form state
   - Trigger buttons with consistent styling
   - Deep linking support with URL parameter handling
   - Form pre-filling capabilities

3. **ModernModalUI**: Enhanced modal experience for form presentation
   - Animated transitions for improved user engagement
   - Responsive design for all device sizes
   - Accessibility features for keyboard navigation
   - Visual hooks for increased conversion

4. **BookingResponseHandler**: Comprehensive status notifications
   - Success confirmations with appointment details
   - Error handling with actionable next steps
   - Alternative time suggestions for unavailable slots
   - Integrated with form analytics for tracking outcomes

### Form Analytics

The system includes comprehensive analytics tracking:
- Step completion rates
- Form abandonment analysis
- Field interaction tracking
- Submission success/failure rates
- Conversion funnel visualization