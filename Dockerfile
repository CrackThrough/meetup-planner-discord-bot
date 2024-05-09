FROM node:20 AS builder

RUN corepack enable

WORKDIR /app

COPY package.json prisma pnpm-lock.yaml ./

RUN pnpm i --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:20 AS runner

WORKDIR /app

RUN corepack enable

COPY package.json prisma pnpm-lock.yaml ./

RUN pnpm i --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

CMD ["pnpm", "start"]
