# # # syntax=docker/dockerfile:1

# # # Base image
# # ARG NODE_VERSION=20.16.0
# # FROM node:${NODE_VERSION}-alpine as base

# # # Set working directory
# # WORKDIR /usr/src/app

# # ################################################################################
# # # Stage for installing production dependencies
# # FROM base as deps

# # # Install production dependencies
# # COPY package.json package-lock.json ./
# # RUN npm ci --omit=dev

# # ################################################################################
# # # Stage for building the application
# # FROM base as build

# # # Copy dependency files
# # COPY package.json package-lock.json ./

# # # Install all dependencies (including devDependencies)
# # RUN npm install

# # # Copy the rest of the application code
# # COPY . .

# # # Run the build script
# # RUN npm run build

# # ################################################################################
# # # Final stage to create a minimal runtime image
# # FROM node:${NODE_VERSION}-alpine as final

# # # Set NODE_ENV to production
# # ENV NODE_ENV production

# # # Create a non-root user and switch to it, avoiding conflicts
# # RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# # USER appuser

# # # Set the working directory
# # WORKDIR /usr/src/app

# # # Copy production dependencies and built files
# # COPY --from=deps /usr/src/app/node_modules ./node_modules
# # COPY --from=build /usr/src/app/build ./build

# # # Expose the port that the application listens on
# # EXPOSE 5000

# # # Run the application
# # CMD ["npm", "start"]
# # syntax=docker/dockerfile:1

# # Stage 1: Base image
# FROM node:20.16.0-alpine as base

# # Create a non-root user and switch to it
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# # Set working directory
# WORKDIR /usr/src/app

# # Stage 2: Dependencies
# FROM base as dependencies

# # Copy package files and install dependencies
# COPY package.json package-lock.json ./
# RUN npm ci --only=production

# # Stage 3: Build
# FROM base as build

# # Copy package files and install all dependencies (including devDependencies)
# COPY package.json package-lock.json ./
# RUN npm install

# # Copy the application code
# COPY . .

# # Build the application (if you have a build step, e.g., TypeScript)
# RUN npm run build

# # Stage 4: Final
# FROM base as final

# # Set environment variable
# ENV NODE_ENV=production

# # Copy only the production dependencies and built files
# COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
# COPY --from=build /usr/src/app/build /usr/src/app/build

# # Copy the rest of the application code (if needed)
# COPY --from=build /usr/src/app /usr/src/app

# # Expose the port that the application listens on
# EXPOSE 5000

# # Set the command to run the application
# CMD ["npm", "start"]
# Use an official Node.js runtime as a parent image
FROM node:20.16.0-alpine

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
