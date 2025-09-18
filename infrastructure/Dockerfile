# Dockerfile for AisleMarts Phase 2 Unlock Service
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache postgresql-client curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY server/ ./server/
COPY db/ ./db/

# Create non-root user
RUN addgroup -g 1001 -S aislemarts && \
    adduser -S aislemarts -u 1001

# Change ownership of app directory
RUN chown -R aislemarts:aislemarts /app
USER aislemarts

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the service
CMD ["node", "server/index.js"]