FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci && npm run prisma:generate && npm prune --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]
