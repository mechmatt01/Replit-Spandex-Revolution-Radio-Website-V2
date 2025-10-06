# Dockerfile (place at project root)
FROM node:20

# Use a predictable working directory
WORKDIR /usr/src/app

# Copy package files first to leverage cache
COPY package*.json ./

# Install production dependencies only (faster + smaller)
RUN npm ci --omit=dev

# Copy project files
COPY . .

# Build frontend (client)
RUN cd client && npm ci --omit=dev && npm run build

# Expose the port your Express app listens on
ENV PORT=8080
EXPOSE 8080

# Ensure Node uses your real server file
# Either run the npm start script or call node directly.
# This removes any ambiguity about index.js.
CMD ["node", "server/simple-server.js"]