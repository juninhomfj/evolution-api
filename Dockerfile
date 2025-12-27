FROM node:24-alpine AS builder

RUN apk update && apk add --no-cache git ffmpeg wget curl bash openssl

WORKDIR /evolution

COPY package*.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

RUN npm ci

COPY src ./src
COPY public ./public
COPY prisma ./prisma
COPY manager ./manager
COPY runWithProvider.js ./

RUN npm run build

FROM node:24-alpine

RUN apk update && apk add --no-cache tzdata ffmpeg bash openssl

ENV TZ=America/Sao_Paulo
ENV DOCKER_ENV=true

WORKDIR /evolution

COPY --from=builder /evolution/package.json ./
COPY --from=builder /evolution/package-lock.json ./
COPY --from=builder /evolution/node_modules ./node_modules
COPY --from=builder /evolution/dist ./dist
COPY --from=builder /evolution/prisma ./prisma
COPY --from=builder /evolution/manager ./manager
COPY --from=builder /evolution/public ./public
COPY --from=builder /evolution/runWithProvider.js ./

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
