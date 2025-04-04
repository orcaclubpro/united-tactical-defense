# United Tactical Defense Frontend

This directory contains the frontend (React) application for United Tactical Defense.

## Project Structure

The application is built with React and TypeScript and follows a component-based architecture:

- `/src/components`: React UI components organized by feature
  - `/Form`: Form components for lead capture and booking
  - `/landing`: Landing page components
  - `/dashboard`: Dashboard components for internal users
  - `/common`: Shared UI components
- `/src/contexts`: React context providers for state management
- `/src/services`: API clients and service integrations
- `/src/hooks`: Custom React hooks
- `/src/utils`: Utility functions and helpers

## Important Note About Project Restructuring

The frontend code was previously duplicated between this directory and the root `/src` directory. 
This duplication has been removed, and all React components are now exclusively in this frontend directory.

The backend code remains in the root `/src` directory.

## Development

To start the frontend development server:

```bash
# From the project root
npm run client

# Or from the frontend directory
npm start
```

## Building

To build the frontend for production:

```bash
# From the project root
npm run build

# Or from the frontend directory
npm run build
```

The build output will be placed in the `/frontend/build` directory, which is served by the backend in production.
