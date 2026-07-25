FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci --include=dev \
  && DATABASE_URL="postgresql://prisma:prisma@localhost:5432/prisma" npm run prisma:generate

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]
