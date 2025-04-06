FROM node:18-alpine

WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend files
COPY backend ./backend

# Copy frontend files 
COPY frontend ./frontend

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build frontend
RUN npm run build

# Return to main directory
WORKDIR /app

# Expose ports
EXPOSE 3000 5000

# Start both frontend and backend services
CMD ["npm", "start"] 