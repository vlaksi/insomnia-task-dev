# Use an official lightweight Node.js image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies (including devDependencies for TypeScript build)
RUN npm install

# Copy the rest of the application
COPY . .

# Copy the .env and .env.development files
COPY .env .env.example ./

# Build the NestJS application
RUN npm run build

# ------------------
# Production Stage
# ------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 3000

# Run the compiled application in production mode
CMD ["npm", "run", "start:prod"]