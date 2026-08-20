FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm ci

COPY . .

ARG VITE_NEWS_API_KEY=""
ARG VITE_GUARDIAN_API_KEY=""
ARG VITE_NYT_API_KEY=""

RUN pnpm build

FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
