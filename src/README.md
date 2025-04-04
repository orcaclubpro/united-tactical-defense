# United Tactical Defense Backend

This directory contains the backend (server-side) code for the United Tactical Defense application.

## Project Structure

The project follows a clean architecture approach:

- `/api`: HTTP endpoints, controllers, middleware, and routes
- `/core`: Domain entities, interfaces, and business rules
- `/services`: Business logic implementations
- `/data`: Database models, repositories, and migration scripts
- `/config`: Application configuration
- `/utils`: Utility functions and helpers

## Key Files

- `server.js`: Main server entry point
- `app.js`: Express application setup
- `simple-server.js`: Alternative simplified server implementation

## Frontend Code

All frontend (React) code is now contained exclusively in the `/frontend` directory at the project root.
Previously, there were duplicate React components in both `/src` and `/frontend/src`, but this has been
consolidated to avoid confusion and maintenance issues. 