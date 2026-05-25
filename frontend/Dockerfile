# Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve estático

FROM nginx:stable-alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080

# Config nginx para puerto 8080
CMD ["nginx", "-g", "daemon off;"]
