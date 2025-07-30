# --- Stage 1: Build Frontend ---
FROM node:18-alpine AS build

# Install security updates and pnpm
RUN apk update && apk upgrade && apk add --no-cache dumb-init && \
    corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files for better caching
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies for build (including devDependencies)
RUN pnpm install --frozen-lockfile && pnpm store prune

# Copy source code
COPY . .

# Build frontend
RUN pnpm run build && rm -rf node_modules

# --- Stage 2: Production Runtime ---
FROM node:18-alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy built frontend from build stage
COPY --from=build --chown=nodeuser:nodejs /app/dist ./dist

# Copy backend package files
COPY --chown=nodeuser:nodejs backend/package*.json ./backend/

# Install production dependencies only
RUN cd backend && \
    npm ci --omit=dev && \
    npm cache clean --force

# Copy backend source code
COPY --chown=nodeuser:nodejs backend/src ./backend/src
COPY --chown=nodeuser:nodejs backend/server.js ./backend/

# Create necessary directories with correct permissions
RUN mkdir -p /app/backend/database /app/logs && \
    chown -R nodeuser:nodejs /app/backend/database /app/logs

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3001

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://0.0.0.0:3001/api/test', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "backend/server.js"]

