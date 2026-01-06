# Use official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the project
FROM install AS build
COPY . .
# We need to pass the backend URL at build time for Astro to bake it in
ARG PUBLIC_BACKEND_URL
ENV PUBLIC_BACKEND_URL=$PUBLIC_BACKEND_URL
RUN bun run build

# Final production image
FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

EXPOSE 4321

# Astro node standalone output is usually in dist/server/entry.mjs
CMD ["bun", "dist/server/entry.mjs"]
