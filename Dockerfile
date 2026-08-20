# syntax=docker/dockerfile:1

# Vite inlines VITE_* variables at build time, so keys are build arguments.
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_NEWS_API_KEY=""
ARG VITE_GUARDIAN_API_KEY=""
ARG VITE_NYT_API_KEY=""
ENV VITE_NEWS_API_KEY=$VITE_NEWS_API_KEY \
    VITE_GUARDIAN_API_KEY=$VITE_GUARDIAN_API_KEY \
    VITE_NYT_API_KEY=$VITE_NYT_API_KEY

RUN pnpm build

FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
