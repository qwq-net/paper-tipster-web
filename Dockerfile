FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.1 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "dev"]
