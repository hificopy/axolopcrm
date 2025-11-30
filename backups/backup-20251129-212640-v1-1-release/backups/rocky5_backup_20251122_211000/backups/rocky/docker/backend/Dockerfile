FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run postinstall  # This will run the force-resolutions
EXPOSE 3002
CMD ["node", "backend/index.js"]
