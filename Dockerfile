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

# Keep the built client files and server dependencies
# Don't run npm ci --only=production as it removes client dependencies

# Expose port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "server/simple-server.js"]
