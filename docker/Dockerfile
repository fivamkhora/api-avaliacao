FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --include=dev \
  && DATABASE_URL="postgresql://prisma:prisma@localhost:5432/prisma" npm run prisma:generate

COPY src ./src

EXPOSE 3000

CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ]; then echo 'DATABASE_URL nao foi configurada.' >&2; exit 1; fi; npm run prisma:migrate:deploy && node src/server.js"]
