FROM node:20-alpine AS base

# Create app directory
WORKDIR /app

# Copy package files and configuration for NX build
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./

# Install dependencies with legacy-peer-deps to handle dependency conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

FROM base AS build

WORKDIR /app

# Build the api-gateway application (this will build required libraries automatically)
RUN npx nx build api-gateway

# Ensure the libs directory exists in dist
RUN mkdir -p /app/dist/libs && \
    if [ -d "/app/libs/common/src" ]; then \
      mkdir -p /app/dist/libs/common && \
      cp -r /app/libs/common/src /app/dist/libs/common/ || true; \
    fi && \
    if [ -d "/app/libs/auth/src" ]; then \
      mkdir -p /app/dist/libs/auth && \
      cp -r /app/libs/auth/src /app/dist/libs/auth/ || true; \
    fi && \
    if [ -d "/app/libs/configs/src" ]; then \
      mkdir -p /app/dist/libs/configs && \
      cp -r /app/libs/configs/src /app/dist/libs/configs/ || true; \
    fi

FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies with legacy-peer-deps to resolve conflicts
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application
COPY --from=build /app/dist/apps/api-gateway ./dist
# Copy libraries
COPY --from=build /app/dist/libs ./dist/libs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
