FROM node:18-alpine AS base

# Install dependencies for the entire monorepo
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY package-lock.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/api/package*.json ./apps/api/

RUN npm ci

# Build the API
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY package*.json ./
COPY turbo.json ./
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

CMD ["node", "dist/main"]
