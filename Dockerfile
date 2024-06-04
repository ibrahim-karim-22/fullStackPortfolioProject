# Use a Node.js base image
FROM node:18-alpine

# Create and change to the app directory
WORKDIR /app

# Install dependencies globally
RUN npm install -g expo-cli eas-cli @expo/ngrok@^4.1.0

# Set environment variables
ARG MONGO_KEY
ARG SECRET_KEY
ARG CLOUD_KEY
ARG GOOGLE_MAPS_KEY

ENV MONGO_KEY=$MONGO_KEY
ENV SECRET_KEY=$SECRET_KEY
ENV CLOUD_KEY=$CLOUD_KEY
ENV GOOGLE_MAPS_KEY=$GOOGLE_MAPS_KEY

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the port
EXPOSE 8081

# Start the backend server
CMD ["node", "server.js"]
