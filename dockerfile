# Build stage
FROM node:latest AS build
# Set working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json
COPY *.json .
# Install dependencies
RUN npm install
# Copy the rest of the application files
COPY . .
# Build the application
RUN npm run build --only=production
# Set environment variables
ARG PORT_ARG=4000
ENV PORT=${PORT_ARG}
EXPOSE $PORT_ARG

# Specify the command to run your application
CMD ["npm", "start"]
