FROM node:22-alpine AS base

# Enable Corepack to use the specific pnpm version in package.json
RUN corepack enable

WORKDIR /app

FROM base AS deps

# Copy package config files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen-lockfile ensures exact versions)
RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

# Copy cached node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Run the build script (rimraf dist && tsc ...)
RUN pnpm run build

# Prune devDependencies to keep the final image small
# This removes packages like 'typescript', 'tsx', etc.
RUN pnpm prune --prod

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Security: Create and use a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

RUN mkdir -p /app/data
RUN chown -R expressjs:nodejs /app/data


# Copy only necessary files from builder
# We copy 'dist' (compiled code) and 'node_modules' (prod dependencies only)
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER expressjs

# Expose the port (Adjust if your app uses a different port)
EXPOSE ${PORT}

# Start the application using the native Node flag for .env
CMD ["node", "./dist/src/index.js"]
