# Step 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Step 2: Serve the compiled app with Nginx
FROM nginx:alpine

# Copy custom nginx configuration if needed, otherwise use default
# Copy the compiled production build from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
