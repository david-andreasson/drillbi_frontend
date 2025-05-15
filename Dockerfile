# Steg 1 – Bygg appen
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Steg 2 – Servera statiskt med Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
