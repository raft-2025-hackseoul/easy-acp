# Frontend Web App Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/web/package*.json ./apps/web/
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

# Copy source code
COPY packages/acp-types ./packages/acp-types
COPY packages/tsconfig ./packages/tsconfig
COPY packages/workflow-types ./packages/workflow-types
COPY apps/web ./apps/web
COPY turbo.json ./
COPY package*.json ./

# Build the application using turbo (builds dependencies first)
WORKDIR /app
RUN npx turbo build --filter=@repo/web...

# Production image with nginx
FROM nginx:alpine AS runner

# Copy custom nginx config template
COPY apps/web/nginx.conf /etc/nginx/templates/nginx.conf.template

# Copy startup script
COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built static files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose port
EXPOSE 8080

# Start nginx with environment variable substitution
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
