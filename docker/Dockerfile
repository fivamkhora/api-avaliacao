FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --include=dev && npm run prisma:generate

COPY src ./src

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:migrate:deploy && node src/server.js"]
