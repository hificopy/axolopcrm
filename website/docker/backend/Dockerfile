FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install --prod
COPY . .
EXPOSE 3001
CMD ["node", "backend/index.js"]
