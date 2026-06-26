# Stage 1: Build Next.js Application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY client/package*.json ./
RUN npm ci

# Copy application files and generate Prisma code
COPY client/ ./
RUN npx prisma generate

# Build Next.js production build
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built assets and production node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
