# Stage 1: Dependencies and Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo configuration files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy shared types & frontend application
COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend

ARG NEXT_PUBLIC_API_BASE_URL=/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Install dependencies and compile Next.js standalone build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @karsa/shared-types run build
RUN pnpm --filter @karsa/frontend run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone bundle & static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/frontend/server.js"]
