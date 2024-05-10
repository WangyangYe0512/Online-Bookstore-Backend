# Use an official Node.js runtime as the base image
FROM node:latest

# Create and change to the app directory.
WORKDIR /app

# Copy local code to the container image.
COPY . .

# Install production dependencies.
RUN npm install


# Expose the port the app runs in
EXPOSE 3001

# Run the web service on container startup.
CMD [ "npm", "run", "serve" ]