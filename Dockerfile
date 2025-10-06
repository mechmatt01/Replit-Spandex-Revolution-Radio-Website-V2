# --- Dockerfile for Cloud Run (Node.js 20) ---
FROM node:20

# Use Cloud Run's default working directory
WORKDIR /workspace

# Copy only package files first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the project
COPY . .

# Build your frontend (client)
RUN npm run build

# Cloud Run exposes this port
ENV PORT=8080
EXPOSE 8080

# ✅ Run your real start script (not index.js)
CMD ["npm", "start"]