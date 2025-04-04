# United Tactical Defense - Deployment Guide

This guide provides instructions for integrating and deploying the United Tactical Defense application using the provided automation scripts.

## Prerequisites

- Node.js >= 14
- npm
- Git
- PM2 (for production deployment)
- Access to a server for deployment

## Quick Start

### 1. Integration Testing

To run the integration and testing process:

```bash
# Make the script executable if needed
chmod +x integrate-and-test.js

# Run the integration script
./integrate-and-test.js
```

This script will:
- Validate your environment configuration
- Install dependencies for both frontend and backend
- Verify database connection
- Run database migrations
- Run all tests
- Build the frontend for production

### 2. Deployment

To deploy the application to production:

```bash
# Make the script executable if needed
chmod +x deploy.js

# Run the deployment script
./deploy.js
```

This script will:
- Set up a production environment file
- Build the application for production
- Set up PM2 process manager
- Configure database backups
- Verify the deployment

## Manual Integration & Deployment Process

If you prefer to run the steps manually, follow this process:

### Integration Process

1. **Setup Environment**:
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit environment variables as needed
   nano .env
   ```

2. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   ```

3. **Run Database Migrations**:
   ```bash
   npm run migrate
   ```

4. **Run Tests**:
   ```bash
   # Run backend tests
   npm run test
   
   # Run API tests
   npm run test:api
   
   # Run service tests
   npm run test:services
   
   # Run database connection pooling tests
   npm run test:db-pooling
   
   # Run frontend tests
   npm run test:frontend
   ```

5. **Build Frontend**:
   ```bash
   npm run build
   ```

### Deployment Process

1. **Create Production Environment**:
   ```bash
   # Copy and modify for production
   cp .env.example .env.production
   nano .env.production
   ```

   Important settings to update:
   - Set `NODE_ENV=production`
   - Update `CORS_ORIGINS` with production domains
   - Generate a secure `JWT_SECRET`
   - Configure database settings

2. **Build for Production**:
   ```bash
   # Install clean dependencies
   npm ci
   cd frontend && npm ci
   
   # Build frontend
   npm run build
   ```

3. **Setup PM2**:
   ```bash
   # Install PM2 if needed
   npm install -g pm2
   
   # Create ecosystem.config.js file
   cat > ecosystem.config.js << 'EOL'
   module.exports = {
     apps: [{
       name: "united-tactical-defense",
       script: "src/server.js",
       instances: "max",
       autorestart: true,
       watch: false,
       max_memory_restart: "1G",
       env: {
         NODE_ENV: "production",
         PORT: 3000
       }
     }]
   };
   EOL
   
   # Start with PM2
   pm2 start ecosystem.config.js
   
   # Save PM2 process list
   pm2 save
   
   # Setup PM2 to start on system boot (follow instructions)
   pm2 startup
   ```

4. **Setup Database Backup**:
   ```bash
   # Create backup directory
   mkdir -p data/backups
   
   # Create backup script (see deploy.js for full script)
   # Add a cron job for regular backups
   crontab -e
   # Add: 0 2 * * * cd /path/to/app && node backup-database.js >> data/backups/backup.log 2>&1
   ```

5. **Verify Deployment**:
   ```bash
   # Check server status
   curl http://localhost:3000/api/status
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify DB_PATH in .env file is correct
   - Ensure database file is accessible and not locked
   - Check file permissions

2. **Port Already in Use**:
   - Change the PORT in .env file
   - Check for existing processes: `lsof -i :3000`
   - Kill process if needed: `kill -9 <PID>`

3. **PM2 Issues**:
   - Check PM2 logs: `pm2 logs`
   - Restart the application: `pm2 restart united-tactical-defense`
   - Check PM2 status: `pm2 status`

4. **Build Errors**:
   - Clear node_modules and reinstall: 
     ```
     rm -rf node_modules frontend/node_modules
     npm run install-all
     ```
   - Check for compatibility issues in package.json

### Rollback Procedure

If deployment fails, follow these steps to rollback:

1. Stop the application:
   ```bash
   pm2 stop united-tactical-defense
   ```

2. Restore from the previous version:
   ```bash
   # If using Git
   git checkout <previous-stable-tag>
   
   # Reinstall dependencies
   npm ci
   cd frontend && npm ci
   
   # Rebuild (if needed)
   npm run build
   ```

3. Restore database (if needed):
   ```bash
   # Find latest backup
   ls -la data/backups
   
   # Restore from backup (when the server is stopped)
   cp data/backups/backup-YYYY-MM-DD.db ./unitedDT.db
   ```

4. Restart the application:
   ```bash
   pm2 start ecosystem.config.js
   ```

## Security Considerations

1. **JWT Secret**: Always use a strong, unique secret in production
2. **Environment Variables**: Never commit .env.production to version control
3. **Database Security**: Ensure database file has proper permissions
4. **Rate Limiting**: Verify rate limiting is enabled in production
5. **CORS Settings**: Restrict CORS to only necessary domains

## Monitoring

Monitor your production deployment with:

```bash
# View logs
pm2 logs

# View metrics
pm2 monit

# View status
pm2 status
```

For more comprehensive monitoring, consider setting up:
- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
- Uptime robot for external monitoring

## Additional Resources

For more detailed information, refer to:
- [Integration and Deployment Plan](integration-deployment-plan.md)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Node.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html) 