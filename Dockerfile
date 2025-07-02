FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY dist/ ./
COPY client/dist/ ./client/dist/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
