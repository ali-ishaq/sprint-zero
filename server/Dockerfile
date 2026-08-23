FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build && cp -r dist/* ../server/public/

COPY server/ ./server/

EXPOSE 8080

CMD ["node", "server/index.js"]