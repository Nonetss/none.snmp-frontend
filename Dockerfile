FROM oven/bun:alpine

WORKDIR /app

# 1. Instalamos dependencias (esto se cachea si no cambia el package.json)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# 2. Copiamos el código
COPY . .

EXPOSE 4321

# 3. EL TRUCO: Construimos Y servimos AL ARRANCAR.
# Así la build "ve" las variables de entorno que le pasas desde el docker-compose.
CMD bun run build && bun run preview --host 0.0.0.0 --port 4321 --allowed-hosts=*
