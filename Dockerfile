# ---- Stage 1: build the client ----
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build
# Vite outputs to client/dist by default — adjust if vite.config.js changes outDir

# ---- Stage 2: install server deps + assemble runtime image ----
FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client-build /app/client/dist ./public

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "index.js"]