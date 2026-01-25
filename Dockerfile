FROM oven/bun:1.3

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start"]
