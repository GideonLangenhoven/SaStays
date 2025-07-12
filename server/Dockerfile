# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the server code
COPY . .

# Expose the port your app runs on
EXPOSE 5001

# Start the server
CMD ["node", "index.js"] 