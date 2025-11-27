# Stage 1: Build a React application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json và package-lock.json của frontend
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy thư mục shared
COPY shared/ shared/

# Copy mã nguồn còn lại của frontend
COPY frontend/ .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built application from the 'build' stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d

# Expose port 80
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
