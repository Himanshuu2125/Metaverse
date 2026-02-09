# Stage 1: Build the frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/client-side

# Define build arguments for Vite (Render passes secret/env vars as build-args)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_SERVER_URL

# Set them as environment variables for the build process
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_SERVER_URL=$VITE_SERVER_URL

# Copy package files and install dependencies
COPY client-side/package*.json ./
RUN npm install

# Copy source and build
COPY client-side/ ./
# We need to ensure that the environment variables are available during build if needed, 
# or Vite will use defaults. However, for a generic dockerize, we'll assume the client 
# connects to the same origin or uses env vars provided at build time.
# For Render, we can use ARG/ENV to pass these if needed.
RUN npm run build

# Stage 2: Run the server
FROM node:20-alpine
WORKDIR /app

# Copy server package files and install production dependencies
COPY server-side/package*.json ./server-side/
WORKDIR /app/server-side
RUN npm install --production

# Copy server source
COPY server-side/ ./

# Copy built frontend from Stage 1
COPY --from=build-frontend /app/client-side/dist /app/client-side/dist

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
