# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set necessary environment variables
ENV NODE_ENV=production
ENV CONTAINER_ENV=true
ENV IS_DOCKER=true

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Set environment variables for runtime
ENV NODE_ENV=production
ENV CONTAINER_ENV=true
ENV IS_DOCKER=true

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]