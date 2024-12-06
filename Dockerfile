# Build stage - Compiles TypeScript to JavaScript
FROM node:22.5.1-alpine AS builder

# Set working directory for build stage
WORKDIR /usr/src/app

# Copy package files and TypeScript config
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript into JavaScript
RUN npm run build

# -----------------------------------------------------------------------------

# Production stage - Lighter image with only production dependencies
FROM node:22.5.1-alpine

# Set working directory for production stage
WORKDIR /usr/src/app

# Copy package files for production
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Install curl for health checks
RUN apk --no-cache add curl

# Copy built JavaScript files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose API port
EXPOSE 5100

# Start the Node.js application
CMD ["node", "dist/server.js"]