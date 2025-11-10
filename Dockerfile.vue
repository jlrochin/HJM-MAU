# Dockerfile para MAU Frontend (Vue.js)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# Instalar dependencias
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copiar código fuente
COPY frontend/ .

# Build de producción
RUN pnpm run build

# Stage de producción con nginx
FROM nginx:1.27-alpine AS runner

# Copiar build de Vue
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar nginx para Vue Router (SPA)
RUN printf "server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  \n\
  # Ruta base /mau/\n\
  location /mau/ {\n\
    rewrite ^/mau/(.*)$ /\$1 last;\n\
  }\n\
  \n\
  # Fallback para Vue Router\n\
  location / {\n\
    try_files \$uri \$uri/ /index.html;\n\
  }\n\
  \n\
  # Health check\n\
  location /health {\n\
    access_log off;\n\
    return 200 \"healthy\\n\";\n\
    add_header Content-Type text/plain;\n\
  }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
