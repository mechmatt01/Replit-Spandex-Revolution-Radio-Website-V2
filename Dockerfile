# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install all dependencies (including dev dependencies for building)
RUN npm install && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN npm install

# Build only the server (skip client build to avoid Rollup platform issues)
RUN npm run build:server

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy package files first (including package.json for module type)
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built server files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copy the simple server
COPY --from=builder --chown=nodejs:nodejs /app/server/simple-server.js ./dist/

# Copy server source files (needed for some imports)
COPY --from=builder --chown=nodejs:nodejs /app/server ./server

# Copy shared files
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/simple-server.js"]
