# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy packages and backend
COPY packages/shared-types ./packages/shared-types
COPY apps/backend ./apps/backend

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @karsa/shared-types run build
RUN pnpm --filter @karsa/backend run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests & dist
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist

COPY apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY apps/backend/src/database/migrations ./apps/backend/dist/database/migrations

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

USER nestjs

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
