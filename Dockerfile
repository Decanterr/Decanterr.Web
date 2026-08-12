# Build stage
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# Template is processed by nginx's built-in 20-envsubst-on-templates.sh at container start
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Backend address used by nginx to proxy /api and /hubs; override at runtime via env
ENV API_INTERNAL_URL=http://localhost:8080

# Runtime env injection script
COPY docker-entrypoint.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

EXPOSE 80
