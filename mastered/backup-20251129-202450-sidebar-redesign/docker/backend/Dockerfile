FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy all necessary source directories
COPY backend/ ./backend/
COPY src/backend/ ./src/backend/
COPY config/ ./config/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3002

CMD ["node", "backend/index.js"]
