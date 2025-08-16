# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies that might be needed)
RUN npm install

# Copy the pre-built client/dist directory
COPY client/dist ./client/dist

# Copy the server files
COPY server/simple-server.js ./

# Expose port
EXPOSE 8080

# Start the application using the main field from package.json
CMD ["npm", "start"]
