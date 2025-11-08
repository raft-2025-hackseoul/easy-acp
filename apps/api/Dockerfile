# Backend API Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/api/package*.json ./apps/api/
COPY packages/acp-types/package*.json ./packages/acp-types/
COPY packages/tsconfig/package*.json ./packages/tsconfig/
COPY packages/workflow-types/package*.json ./packages/workflow-types/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY packages/acp-types ./packages/acp-types
COPY packages/tsconfig ./packages/tsconfig
COPY packages/workflow-types ./packages/workflow-types
COPY apps/api ./apps/api
COPY turbo.json ./
COPY package*.json ./

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Create uploads directory
RUN mkdir -p uploads && chmod 755 uploads

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/packages/acp-types ./packages/acp-types

# Copy specs directory if exists
COPY --from=builder /app/apps/api/src/specs ./src/specs

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]
