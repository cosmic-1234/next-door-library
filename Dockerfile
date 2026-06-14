# ============================================================
# Next Door Library — Multi-stage Docker Build
# Stage 1: Build the React frontend
# Stage 2: Serve via Express (production)
# ============================================================

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine AS production
WORKDIR /app/backend

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ .

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "server.js"]
