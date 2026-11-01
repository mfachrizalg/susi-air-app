# Build stage: install and build the Nuxt app (Nitro server plus client assets).
FROM node:26.10.0-slim AS build
RUN npm install -g pnpm@12.8.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Runtime stage: Node serves the app. The browser calls the API directly (CORS), so there is no proxy.
FROM node:26.10.0-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
