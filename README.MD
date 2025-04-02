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
- Node.js/Express API server
- SQLite database for data persistence
- RESTful API architecture
- Secure authentication and data handling

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

### Running the Application
To start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend API server on port 3001
- Frontend development server on port 3000

### Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## Available Scripts
- `npm start`: Start the backend server only
- `npm run server`: Start the backend with nodemon (auto-restart on changes)
- `npm run client`: Start the frontend development server only
- `npm run dev`: Start both frontend and backend concurrently
- `npm run build`: Build the frontend for production
- `npm run install-all`: Install dependencies for both frontend and backend

## Project Structure
```
united-tactical-defense/
├── README.md
├── .env.example
├── package.json
├── unitedDT.db          # SQLite database
├── backend/             # Node.js/Express backend
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API route definitions
│   └── index.js         # Main server file
└── frontend/            # React frontend
    ├── public/          # Static files
    │   └── images/      # Image assets
    └── src/             # React source code
        ├── assets/      # Frontend assets
        │   └── css/     # CSS files
        ├── components/  # Reusable React components
        ├── pages/       # Page components
        └── utils/       # Utility functions
```

## Security & Privacy
- Secure API endpoints with proper authentication
- Data encryption for sensitive information
- Regular security updates and maintenance
- Compliance with data protection regulations

## Software Architecture

### System Overview
The application follows a modern client-server architecture with the following key components:
- **Single Page Application (SPA)**: React-based frontend
- **RESTful API Server**: Node.js/Express backend
- **Data Persistence**: SQLite database
- **Static Asset CDN**: Serves optimized images and videos
- **Analytics Engine**: Tracks user engagement and business metrics

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Shared components (buttons, forms, etc.)
│   │   ├── layout/          # Layout components (header, footer, etc.)
│   │   └── features/        # Feature-specific components
│   ├── pages/               # Page components and routing
│   │   ├── Home.js         # Landing page
│   │   ├── Dashboard.js    # Admin dashboard
│   │   └── Assessment.js   # Training assessment
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React context providers
│   ├── services/           # API integration services
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
└── public/                 # Public assets
```

#### Key Frontend Features
1. **Component Architecture**
   - Modular, reusable components
   - Prop-types validation
   - Styled-components for CSS-in-JS
   - Responsive design system

2. **State Management**
   - React Context for global state
   - Custom hooks for shared logic
   - Local component state for UI
   - Redux for complex state (optional)

3. **Performance Optimizations**
   - Code splitting by route
   - Lazy loading of images/videos
   - Memoization of expensive computations
   - Service worker for offline support

### Backend Architecture
```
backend/
├── config/                 # Configuration management
│   ├── database.js        # Database configuration
│   └── middleware.js      # Middleware setup
├── controllers/           # Request handlers
│   ├── auth.js           # Authentication logic
│   ├── leads.js          # Lead management
│   └── analytics.js      # Analytics tracking
├── models/               # Data models and schemas
├── routes/               # API route definitions
├── services/            # Business logic services
├── utils/               # Helper functions
└── middleware/          # Custom middleware
```

#### API Structure
1. **Authentication Endpoints**
   ```
   POST   /api/auth/login
   POST   /api/auth/logout
   POST   /api/auth/refresh
   ```

2. **Lead Management**
   ```
   GET    /api/leads
   POST   /api/leads
   PUT    /api/leads/:id
   DELETE /api/leads/:id
   ```

3. **Appointment Management**
   ```
   GET    /api/appointments
   POST   /api/appointments
   PUT    /api/appointments/:id
   DELETE /api/appointments/:id
   ```

4. **Analytics**
   ```
   POST   /api/analytics/track/:event
   GET    /api/analytics/dashboard
   GET    /api/analytics/reports
   ```

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
   - JWT-based authentication
   - Refresh token rotation
   - Password hashing with bcrypt
   - Rate limiting on auth endpoints

2. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

3. **API Security**
   - CORS configuration
   - Helmet.js security headers
   - Request sanitization
   - Role-based access control

### Development Workflow
1. **Local Development**
   ```bash
   # Start development servers
   npm run dev
   
   # Run tests
   npm test
   
   # Lint code
   npm run lint
   ```

2. **Environment Configuration**
   ```env
   NODE_ENV=development
   PORT=3001
   JWT_SECRET=your_jwt_secret
   DATABASE_URL=./unitedDT.db
   ```

3. **Testing Strategy**
   - Unit tests with Jest
   - Integration tests with Supertest
   - E2E tests with Cypress
   - Component tests with React Testing Library

### Deployment Architecture
1. **Production Setup**
   - Node.js production server
   - PM2 process manager
   - Nginx reverse proxy
   - SSL/TLS encryption

2. **Asset Management**
   - CDN integration for static assets
   - Image optimization pipeline
   - Video compression and streaming
   - Cache control headers

3. **Monitoring**
   - Error tracking with Sentry
   - Performance monitoring
   - API usage metrics
   - User analytics

## Support & Maintenance
For technical support or questions about the application, please contact the development team.

## License
This project is proprietary software and is not licensed for distribution.