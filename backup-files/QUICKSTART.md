# United Tactical Defense - Quick Start Guide

This guide provides quick instructions for getting the United Tactical Defense application up and running.

## Prerequisites

- Node.js (v14 or newer)
- npm

## Quick Start

### Option 1: Automated Setup (Recommended)

We've created a setup script that will handle all the necessary steps to get the application running:

```bash
# Make the script executable if needed
chmod +x setup-and-run.js

# Run the setup script
./setup-and-run.js
```

This script will:
1. Set up the environment configuration
2. Install dependencies with appropriate flags to resolve conflicts
3. Create necessary data directories
4. Run database migrations if needed
5. Start the application in development mode

### Option 2: Manual Setup

If you prefer to run the steps manually:

1. **Setup Environment**:
   ```bash
   # Copy example environment file
   cp .env.example .env
   ```

2. **Create Data Directory**:
   ```bash
   mkdir -p data
   ```

3. **Install Dependencies**:
   ```bash
   # Install backend dependencies with legacy peer deps flag
   npm install --legacy-peer-deps
   
   # Install frontend dependencies with legacy peer deps flag
   cd frontend && npm install --legacy-peer-deps
   ```

4. **Run Database Migrations**:
   ```bash
   npm run migrate
   ```

5. **Start the Application**:
   ```bash
   # Start the backend in development mode
   npm run dev
   
   # In another terminal, start the frontend
   npm run client
   ```

## Access the Application

Once the application is running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

## Fixes We Made

To get the application running correctly, we implemented the following fixes:

1. **Frontend Type Definition Conflicts**
   - Updated React type definitions to compatible versions
   - Added legacy peer deps flag for npm install

2. **Missing Middleware Files**
   - Created `authMiddleware.js` to re-export auth functions correctly
   - Created `validationMiddleware.js` for Joi validation

3. **Interface Implementation**
   - Created service interfaces directory and `AuthServiceInterface`
   - Updated `AuthService` implementation to properly extend the interface

4. **Dependency Issues**
   - Installed missing dependencies like Joi
   - Fixed infinite loop in the frontend package.json install script

5. **Database Migration Runner**
   - Created `run-migrations.js` script
   - Fixed migration runner in database.js config

## Common Issues and Solutions

### Dependency Conflicts

If you encounter npm dependency conflicts, try:
```bash
npm install --legacy-peer-deps
cd frontend && npm install --legacy-peer-deps
```

### Port Already in Use

If you encounter port conflicts, modify the ports in your `.env` file or accept the prompt to use a different port for the React app.

### Database Errors

If database errors occur:
```bash
# Ensure data directory exists
mkdir -p data

# Rerun migrations
npm run migrate
```

### Frontend Build Issues

If you encounter issues with the frontend build:
```bash
# Remove node_modules and reinstall
cd frontend
rm -rf node_modules
npm install --legacy-peer-deps
```

## Next Steps

After getting the application running, refer to these resources for more information:
- [Integration and Deployment Plan](integration-deployment-plan.md)
- [Deployment Guide](DEPLOY.md) 