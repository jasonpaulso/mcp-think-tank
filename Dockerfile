FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.npm npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:18-alpine AS release
WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/smithery.yaml ./

# Set production environment and improve tool scanning
ENV NODE_ENV=production
ENV TOOL_SCAN_TIMEOUT=30000
ENV NODE_OPTIONS="--max-old-space-size=512"

# Install only production dependencies
RUN npm ci --ignore-scripts --omit=dev

# Set executable permissions
RUN chmod +x dist/src/server.js

# Set the user to non-root
USER node

# Use ENTRYPOINT instead of CMD for better compatibility
ENTRYPOINT ["node", "dist/src/server.js"]