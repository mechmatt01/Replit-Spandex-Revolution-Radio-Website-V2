# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy source code
COPY . .

# Build the client
RUN cd client && npm run build

# Install only production dependencies for runtime
RUN npm ci --only=production

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server/simple-server.js"]
