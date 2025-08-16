# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the simple server
COPY server/simple-server.js ./

# Copy the pre-built client files (these should exist locally)
COPY client/dist ./client/dist

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "simple-server.js"]
