# United Tactical Defense Backend Logs

This directory contains the log files for the United Tactical Defense backend service.

## Log Files

- **combined.log**: Contains all logs of all levels
- **error.log**: Contains only error-level logs
- **exceptions.log**: Contains uncaught exceptions and unhandled rejections

## Log Levels

The logging system uses the following levels, from highest to lowest priority:

1. **error**: Critical errors that require immediate attention
2. **warn**: Warnings that don't prevent operation but should be addressed
3. **info**: General information about service operation (default level)
4. **debug**: Detailed information useful for debugging
5. **verbose**: Very detailed information typically only used during development

To change the log level, set the `LOG_LEVEL` environment variable in the `.env` file.

## Configuration

Logging behavior can be configured through environment variables:

- `LOG_LEVEL`: Sets the minimum log level to record (default: info)
- `LOG_FILE_ENABLED`: Whether to write logs to files (default: true)
- `LOG_CONSOLE_ENABLED`: Whether to output logs to console (default: true)
- `LOG_MAX_SIZE`: Maximum size of log files in bytes before rotation (default: 5MB)
- `LOG_MAX_FILES`: Maximum number of rotated log files to keep (default: 5)

## Request Tracking

Each HTTP request is assigned a unique request ID, which is included in all log entries related to that request. This makes it easier to trace a request through the system. 