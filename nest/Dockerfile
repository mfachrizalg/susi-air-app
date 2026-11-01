FROM node:26.10.0-slim AS base
RUN npm install -g pnpm@12.8.1
WORKDIR /app

# Build stage: full dependency tree, compiles TypeScript to dist/.
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Runtime stage: production dependencies, compiled output, data and assets only.
FROM base AS runtime
ENV NODE_ENV=production PORT=3001
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
COPY data ./data
COPY assets ./assets
USER node
EXPOSE 3001
CMD ["node", "dist/main"]
