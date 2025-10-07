# Use Node.js 20
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything
COPY . .

# Build the frontend
RUN cd client && npm run build

# Expose port
EXPOSE 8080

# Start the server
CMD ["npm", "run", "start"]