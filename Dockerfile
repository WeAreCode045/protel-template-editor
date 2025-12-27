# Multi-stage build: build React app, then run Node backend

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* .npmrc* ./
RUN npm ci || npm install

# Copy sources
COPY . .

# Build frontend
ARG VITE_ONLYOFFICE_URL
ENV VITE_ONLYOFFICE_URL=${VITE_ONLYOFFICE_URL}
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only runtime deps
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy server code and built frontend
COPY server ./server
COPY --from=build /app/dist ./dist

# Create storage dir
RUN mkdir -p /app/storage

# Expose backend port
EXPOSE 5174

# Default envs (can be overridden)
ENV PORT=5174
ENV STORAGE_DIR=/app/storage

CMD ["node", "server/index.js"]
