# Use official Node.js image as base
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
