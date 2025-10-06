# Use official Node.js 20 image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the frontend
RUN cd client && npm ci && npm run build

# Expose the port that your Express app listens on
EXPOSE 8080

# Set environment variables (you can also set these in Cloud Run console)
ENV NODE_ENV=production
ENV PORT=8080

# Start your server
CMD ["node", "server/simple-server.js"]