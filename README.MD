# United Tactical Defense

## Overview
United Tactical Defense is a comprehensive web platform for a reality-based firearms and self-defense training center. The application serves as both a marketing tool and a business management system, designed to showcase our training programs, facilitate lead generation, and streamline appointment scheduling.

## Key Features

### Customer-Facing Features
- **Interactive Homepage**: Showcases training programs, instructor profiles, and facility highlights
- **Lead Generation**: Contact forms for potential clients to express interest
- **Appointment Scheduling**: Easy-to-use system for booking training sessions
- **Testimonials & Media**: Video testimonials and photo galleries showcasing our facilities and training
- **Analytics Dashboard**: Track visitor engagement and conversion metrics

### Business Management
- **Lead Management**: Track and manage potential client inquiries
- **Appointment Management**: Organize and schedule training sessions
- **Analytics**: Monitor website performance and marketing campaign effectiveness
- **Content Management**: Update website content and media assets

## Marketing Strategy

### Digital Presence
- **SEO Optimization**: Built with modern web standards for optimal search engine visibility
- **Content Marketing**: Rich media content showcasing training programs and facilities
- **Lead Capture**: Strategic placement of contact forms and call-to-action buttons
- **Social Proof**: Integration of testimonials and success stories

### User Experience
- **Mobile-First Design**: Responsive layout ensuring optimal viewing on all devices
- **Fast Loading**: Optimized assets and efficient code structure
- **Clear Navigation**: Intuitive interface guiding users to key information
- **Engagement Features**: Interactive elements to increase user interaction

## Technical Stack

### Frontend
- React.js for dynamic user interface
- Modern CSS with responsive design
- Optimized media handling for images and videos
- Progressive Web App capabilities

### Backend
- Node.js/Express API server with Clean Architecture pattern
- SQLite database for data persistence
- RESTful API architecture
- Secure authentication and data handling
- Event-driven analytics system

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
4. Edit the `.env` file to match your environment
5. Run database migrations:
   ```bash
   npm run migrate
   ```

### Running the Application
To start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend API server on port 4000
- Frontend development server on port 3000

### Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

## Available Scripts
- `npm start`: Start the backend server only
- `npm run dev`: Start the backend with nodemon (auto-restart on changes)
- `npm run client`: Start the frontend development server only
- `npm run install-all`: Install dependencies for both frontend and backend
- `npm run build`: Build the frontend for production
- `npm run migrate`: Run database migrations
- `npm run migrate:down`: Rollback database migrations
- `npm test`: Run automated tests
- `npm run test:coverage`: Run tests with coverage report

## Project Structure
```
united-tactical-defense/
├── README.md
├── .env.example          # Example environment variables
├── .env                  # Environment configuration
├── package.json
├── src/                  # Backend with Clean Architecture pattern
│   ├── app.js            # Express application setup
│   ├── server.js         # Server entry point
│   ├── core/             # Core domain layer (business rules and entities)
│   │   ├── entities/     # Domain models
│   │   ├── interfaces/   # Interface definitions for outer layers
│   │   └── usecases/     # Business logic operations
│   ├── services/         # Service layer (business logic implementation)
│   │   ├── auth/         # Authentication services
│   │   ├── lead/         # Lead management services
│   │   ├── appointment/  # Appointment scheduling services
│   │   ├── form/         # Form processing services
│   │   ├── analytics/    # Analytics services
│   │   └── event/        # Event system for tracking and notifications
│   ├── data/             # Data access layer
│   │   ├── models/       # Data models and schemas
│   │   ├── repositories/ # Data access implementations
│   │   └── migrations/   # Database migrations
│   ├── api/              # API layer (controllers and routes)
│   │   ├── controllers/  # Request handlers 
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API route definitions
│   │   └── validators/   # Input validation
│   ├── config/           # Configuration management
│   └── utils/            # Utility functions
├── tests/                # Automated tests
│   ├── api/              # API tests
│   ├── core/             # Core domain tests
│   ├── data/             # Data layer tests
│   ├── services/         # Service layer tests
│   ├── integration/      # End-to-end integration tests
│   └── utils/            # Test utilities
├── frontend/             # React frontend (separate codebase)
│   ├── public/           # Static files
│   └── src/              # React source code
└── data/                 # Data storage directory
    └── unitedDT.db       # SQLite database (created by migrations)
```

## Security & Privacy
- Secure API endpoints with proper authentication
- Data encryption for sensitive information
- Regular security updates and maintenance
- Compliance with data protection regulations

## Software Architecture

### Clean Architecture Overview
The application follows the clean architecture pattern with distinct layers:

1. **Core Layer** (Domain)
   - Contains domain entities and business rules
   - Defines interfaces for outer layers
   - Has no dependencies on other layers

2. **Service Layer** (Use Cases)
   - Contains implementation of business logic
   - Depends only on the Core layer
   - Implements interfaces defined in the Core layer

3. **Data Layer** (Infrastructure)
   - Contains database and external service access
   - Implements repository interfaces from Core layer
   - Handles data persistence and retrieval

4. **API Layer** (Interface)
   - Contains HTTP endpoints and controllers
   - Handles request validation and response formatting
   - Depends on Service layer for business logic

### Component Interactions

#### Authentication Flow
1. Client sends credentials to /api/auth/login
2. AuthController validates input using validation middleware
3. AuthService authenticates user via UserRepository
4. JWT token is generated and returned to client
5. Subsequent requests use token in Authorization header
6. AuthMiddleware verifies token and attaches user to request

#### Lead Management Flow
1. LeadController receives lead creation request
2. Input is validated by validation middleware
3. LeadService processes the lead creation
4. LeadRepository saves to database
5. Events are published via EventSystem

#### Appointment Scheduling Flow
1. AppointmentController receives appointment request
2. Validation middleware validates input
3. AppointmentService checks availability via Repository
4. If available, appointment is created via Repository
5. Confirmation is sent back to client
6. Lead is updated with appointment information

### Database Schema
```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    created_at DATETIME
);

-- Leads Table
CREATE TABLE leads (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT,
    source TEXT,
    created_at DATETIME
);

-- Appointments Table
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY,
    lead_id INTEGER,
    instructor_id INTEGER,
    date DATETIME,
    status TEXT,
    notes TEXT,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Analytics Table
CREATE TABLE analytics (
    id INTEGER PRIMARY KEY,
    event_type TEXT,
    event_data JSON,
    created_at DATETIME
);
```

### Security Implementation
1. **Authentication**
   - JWT-based authentication with refresh tokens
   - Password hashing with secure algorithms
   - Rate limiting on auth endpoints

2. **Data Protection**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF protection

3. **API Security**
   - CORS configuration
   - Security headers
   - Request sanitization
   - Role-based access control

### Development Workflow
1. **Local Development**
   ```bash
   # Start development server
   npm run dev
   
   # Run tests
   npm test
   
   # Run migrations
   npm run migrate
   ```

2. **Environment Configuration**
   ```env
   NODE_ENV=development
   PORT=4000
   JWT_SECRET=your_jwt_secret
   DB_PATH=./data/unitedDT.db
   ```

3. **Testing Strategy**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - Repository tests for data access
   - End-to-end tests for critical flows

### Deployment Architecture
1. **Production Setup**
   - Node.js production server
   - Process manager for reliability
   - Reverse proxy with SSL/TLS
   - Database backups

2. **Asset Management**
   - Static asset optimization
   - Image compression
   - Efficient caching

3. **Monitoring**
   - Error tracking
   - Performance monitoring
   - API usage metrics
   - User analytics

## Support & Maintenance
For technical support or questions about the application, please contact the development team.

## License
This project is proprietary software and is not licensed for distribution.