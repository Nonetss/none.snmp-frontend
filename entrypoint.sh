#!/bin/bash
set -e

# Valores por defecto para que no falle si no se pasan
export BACKEND_URL=${BACKEND_URL:-http://backend:3000}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:4321}

# Inyectar las variables en el archivo de configuración de Nginx
envsubst '${BACKEND_URL} ${FRONTEND_URL}' < /app/gateway/nginx.conf > /etc/nginx/nginx.conf

# Iniciar Astro en segundo plano
bun dist/server/entry.mjs &

# Iniciar Nginx en primer plano
nginx -g 'daemon off;'
